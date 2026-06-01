"""数据集准备：下载 Fruits 360，筛选 15 类，分层划分 train/test。"""

import os
import shutil
import zipfile
from pathlib import Path
from typing import Dict, List, Tuple, Optional

from sklearn.model_selection import train_test_split

from src.utils.config import Config
from src.utils.nutrition import FRUIT360_TO_STANDARD


def ensure_dir(path: Path) -> Path:
    """创建目录（如不存在）并返回路径。"""
    path.mkdir(parents=True, exist_ok=True)
    return path


def extract_archive(archive_path: Path, extract_dir: Path) -> Path:
    """解压 zip 文件到指定目录，返回解压后的根目录路径。"""
    ensure_dir(extract_dir)
    with zipfile.ZipFile(archive_path, "r") as zf:
        zf.extractall(extract_dir)
    # 返回解压后的顶层目录
    names = [f for f in os.listdir(extract_dir) if (extract_dir / f).is_dir()]
    if not names:
        raise RuntimeError(f"解压后未找到目录: {extract_dir}")
    return extract_dir / (names[0] if len(names) == 1 else "")


def collect_class_images(
    data_root: Path, target_map: Dict[str, str]
) -> Dict[str, List[Path]]:
    """扫描 data_root 下所有类别子目录，按 target_map 筛选并映射到标准名。

    返回 {standard_name: [image_paths]}。
    """
    result: Dict[str, List[Path]] = {}
    for folder in sorted(data_root.iterdir()):
        if not folder.is_dir():
            continue
        standard_name = target_map.get(folder.name)
        if standard_name is None:
            continue
        images = sorted(
            p for p in folder.iterdir()
            if p.suffix.lower() in (".jpg", ".jpeg", ".png")
        )
        if images:
            result.setdefault(standard_name, []).extend(images)
    return result


def stratified_split(
    class_images: Dict[str, List[Path]],
    train_ratio: float = 0.8,
    seed: int = 42,
) -> Tuple[Dict[str, List[Path]], Dict[str, List[Path]]]:
    """按类别分层分割为 train/test。"""
    train: Dict[str, List[Path]] = {}
    test: Dict[str, List[Path]] = {}
    for cls_name, paths in class_images.items():
        paths_train, paths_test = train_test_split(
            paths, test_size=1 - train_ratio, random_state=seed, shuffle=True
        )
        train[cls_name] = paths_train
        test[cls_name] = paths_test
    return train, test


def copy_images(
    split: Dict[str, List[Path]], dest_root: Path, split_name: str
) -> int:
    """将 split 中的图片复制到 dest_root/split_name/{class}/ 下。返回复制总数。"""
    count = 0
    for cls_name, paths in split.items():
        cls_dir = ensure_dir(dest_root / split_name / cls_name)
        for src in paths:
            shutil.copy2(src, cls_dir / src.name)
            count += 1
    return count


def find_dataset_dir(raw_dir: Path) -> Optional[Path]:
    """在 raw_dir 中查找 Fruits 360 数据集的根目录。"""
    for root, dirs, _ in os.walk(raw_dir):
        subdirs = set(dirs)
        for candidate in subdirs:
            if candidate in FRUIT360_TO_STANDARD:
                return Path(root)
        # 也检查是否有 Training/Test 子目录结构
        if "Training" in subdirs:
            return Path(root)
    return None


def main(config: Optional[Config] = None) -> None:
    """完整数据准备流程。"""
    if config is None:
        config = Config()

    processed_dir = config.data_processed_dir
    raw_dir = config.data_raw_dir

    # 如果已处理过，跳过
    if (processed_dir / "train").exists() and (processed_dir / "test").exists():
        print(f"数据已存在于 {processed_dir}，跳过预处理。")
        print(f"如需重新处理，请删除 {processed_dir} 后重试。")
        return

    # 查找数据集
    dataset_root = find_dataset_dir(raw_dir)
    if dataset_root is None:
        raise FileNotFoundError(
            f"未在 {raw_dir} 中找到 Fruits 360 数据集。\n"
            f"请下载数据集并解压到 {raw_dir}/。\n"
            f"下载地址: https://www.kaggle.com/datasets/moltean/fruits"
        )

    print(f"找到数据集: {dataset_root}")

    # 查找 Training 和 Test 目录
    training_dir = None
    for candidate in [dataset_root / "Training", dataset_root / "Train"]:
        if candidate.exists():
            training_dir = candidate
            break
    test_dir = None
    for candidate in [dataset_root / "Test", dataset_root / "Validation"]:
        if candidate.exists():
            test_dir = candidate
            break

    if training_dir is None:
        raise FileNotFoundError(f"未找到 Training 目录: {dataset_root}")

    # 收集图片
    print("扫描类别目录...")
    train_images = collect_class_images(training_dir, FRUIT360_TO_STANDARD)

    if test_dir:
        test_raw = collect_class_images(test_dir, FRUIT360_TO_STANDARD)
    else:
        test_raw = {}

    # 合并 Train + Test 原始数据，再重新分层分割
    all_images: Dict[str, List[Path]] = {}
    for cls_name in sorted(set(list(train_images) + list(test_raw))):
        all_images[cls_name] = train_images.get(cls_name, []) + test_raw.get(
            cls_name, []
        )

    if not all_images:
        raise RuntimeError("未找到任何目标类别的图片。请检查数据集内容。")

    # 打印统计
    total = sum(len(v) for v in all_images.values())
    print(f"找到 {len(all_images)} 个类别，共 {total} 张图片：")
    for cls_name in sorted(all_images):
        print(f"  {cls_name}: {len(all_images[cls_name])} 张")

    # 80/20 分层分割
    print(f"\n按 {config.train_split:.0%}/{1-config.train_split:.0%} 分层划分...")
    train_split_dict, test_split_dict = stratified_split(
        all_images, train_ratio=config.train_split, seed=config.random_seed
    )

    # 清空已有处理后数据
    if processed_dir.exists():
        shutil.rmtree(processed_dir)
    ensure_dir(processed_dir)

    # 复制
    n_train = copy_images(train_split_dict, processed_dir, "train")
    n_test = copy_images(test_split_dict, processed_dir, "test")

    print(f"\n数据准备完成:")
    print(f"  data/processed/train/ : {n_train} 张 ({len(train_split_dict)} 类)")
    print(f"  data/processed/test/  : {n_test} 张 ({len(test_split_dict)} 类)")


if __name__ == "__main__":
    main()
