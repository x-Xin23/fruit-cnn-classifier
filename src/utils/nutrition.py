"""15 种水果的营养数据字典与类别映射。"""

from typing import Dict, List, Optional

# ── 类别名称 ──
# 字母序与 FruitDataset 的 sorted() 一致，索引映射与 webapp/utils.py 完全对应
CLASS_NAMES: List[str] = [
    "Apple", "Banana", "Blueberry", "Cherry", "Grape",
    "Kiwi", "Lemon", "Mango", "Orange", "Peach",
    "Pear", "Pineapple", "Pomegranate", "Strawberry", "Watermelon",
]

CLASS_NAMES_ZH: List[str] = [
    "苹果", "香蕉", "蓝莓", "樱桃", "葡萄",
    "猕猴桃", "柠檬", "芒果", "橙子", "桃子",
    "梨", "菠萝", "石榴", "草莓", "西瓜",
]

INDEX_TO_CLASS: Dict[int, str] = {i: name for i, name in enumerate(CLASS_NAMES)}
CLASS_TO_INDEX: Dict[str, int] = {name: i for i, name in enumerate(CLASS_NAMES)}

# ── Fruits 360 文件夹名 → 标准类名映射 ──
FRUIT360_TO_STANDARD: Dict[str, str] = {
    "Apple Red Delicious": "Apple",
    "Apple Red Delicious 1": "Apple",
    "Banana": "Banana",
    "Orange": "Orange",
    "Grape White": "Grape",
    "Grape White 1": "Grape",
    "Strawberry": "Strawberry",
    "Kiwi": "Kiwi",
    "Watermelon": "Watermelon",
    "Peach": "Peach",
    "Pear": "Pear",
    "Mango": "Mango",
    "Pineapple": "Pineapple",
    "Cherry": "Cherry",
    "Cherry 1": "Cherry",
    "Lemon": "Lemon",
    "Blueberry": "Blueberry",
    "Pomegranate": "Pomegranate",
}

# ── 营养数据 ──
NUTRITION_INFO: Dict[str, dict] = {
    "Apple": {
        "name_zh": "苹果",
        "emoji": "🍎",
        "calories_per_100g": "52 kcal",
        "vitamin_c": "4.6 mg",
        "fiber": "2.4 g",
        "benefits": [
            "促进消化，富含膳食纤维",
            "降低胆固醇，保护心血管健康",
            "增强免疫力，抗氧化"
        ],
        "description": "苹果富含膳食纤维和维生素C，是世界上最受欢迎的水果之一。苹果中的果胶有助于降低胆固醇，多酚类物质具有抗氧化作用，常食有助于消化健康、增强免疫力。"
    },
    "Banana": {
        "name_zh": "香蕉",
        "emoji": "🍌",
        "calories_per_100g": "89 kcal",
        "vitamin_c": "8.7 mg",
        "fiber": "2.6 g",
        "benefits": [
            "快速补充能量，适合运动前后食用",
            "富含钾元素，维持血压稳定",
            "改善心情，含色氨酸促进血清素分泌"
        ],
        "description": "香蕉是高能量水果，富含碳水化合物和钾元素。钾有助于维持正常血压和肌肉功能，是运动爱好者的理想食物。香蕉还含有色氨酸，有助于改善情绪和睡眠质量。"
    },
    "Orange": {
        "name_zh": "橙子",
        "emoji": "🍊",
        "calories_per_100g": "47 kcal",
        "vitamin_c": "53.2 mg",
        "fiber": "2.4 g",
        "benefits": [
            "维生素C含量极高，增强抵抗力",
            "促进铁吸收，预防贫血",
            "美白肌肤，抗氧化抗衰老"
        ],
        "description": "橙子是维生素C的优质来源，一个中等大小的橙子即可满足成人每日维生素C需求。橙子中的柠檬酸有助于促进铁的吸收，类黄酮物质具有抗炎和抗氧化功效。"
    },
    "Grape": {
        "name_zh": "葡萄",
        "emoji": "🍇",
        "calories_per_100g": "69 kcal",
        "vitamin_c": "3.2 mg",
        "fiber": "0.9 g",
        "benefits": [
            "含白藜芦醇，抗氧化抗衰老",
            "保护心血管，降低血压",
            "缓解疲劳，补充能量"
        ],
        "description": "葡萄富含葡萄糖、果糖和多种有机酸，易于消化吸收。葡萄皮和籽中的白藜芦醇是强效抗氧化剂，有助于保护心血管健康、延缓衰老。"
    },
    "Strawberry": {
        "name_zh": "草莓",
        "emoji": "🍓",
        "calories_per_100g": "32 kcal",
        "vitamin_c": "58.8 mg",
        "fiber": "2.0 g",
        "benefits": [
            "维生素C含量超过橙子",
            "低热量高营养，适合减重人群",
            "含花青素，保护视力"
        ],
        "description": "草莓是低热量高营养的水果，维生素C含量比橙子还高。草莓中的花青素和鞣花酸具有抗氧化和抗炎作用，有助于保护心血管、改善皮肤健康和预防慢性疾病。"
    },
    "Kiwi": {
        "name_zh": "猕猴桃",
        "emoji": "🥝",
        "calories_per_100g": "61 kcal",
        "vitamin_c": "92.7 mg",
        "fiber": "3.0 g",
        "benefits": [
            "维生素C之王，远超橙子和柠檬",
            "富含膳食纤维，促进肠道蠕动",
            "含猕猴桃蛋白酶，助消化蛋白质"
        ],
        "description": "猕猴桃是维生素C含量最高的水果之一，一颗猕猴桃即可满足全天维生素C需求。猕猴桃中的膳食纤维和蛋白酶有助于消化，特别适合饭后食用。"
    },
    "Watermelon": {
        "name_zh": "西瓜",
        "emoji": "🍉",
        "calories_per_100g": "30 kcal",
        "vitamin_c": "8.1 mg",
        "fiber": "0.4 g",
        "benefits": [
            "水分含量高达90%，清热解暑",
            "含番茄红素，抗氧化保护前列腺",
            "低热量，适合夏季补水"
        ],
        "description": "西瓜含水量极高，是夏季消暑解渴的首选水果。西瓜中的番茄红素具有抗氧化作用，瓜氨酸有助于改善血液循环。虽然糖分较高，但总体热量较低。"
    },
    "Peach": {
        "name_zh": "桃子",
        "emoji": "🍑",
        "calories_per_100g": "39 kcal",
        "vitamin_c": "6.6 mg",
        "fiber": "1.5 g",
        "benefits": [
            "润肺止咳，生津止渴",
            "富含果胶，促进肠道健康",
            "含β-胡萝卜素，保护视力"
        ],
        "description": "桃子口感香甜多汁，富含果胶和膳食纤维，有润肺止咳、生津润肠的功效。桃子中的β-胡萝卜素在体内转化为维生素A，有助于保护视力和皮肤健康。"
    },
    "Pear": {
        "name_zh": "梨",
        "emoji": "🍐",
        "calories_per_100g": "57 kcal",
        "vitamin_c": "4.3 mg",
        "fiber": "3.1 g",
        "benefits": [
            "润肺止咳，清热化痰",
            "高纤维促进肠道健康",
            "含山梨糖醇，天然通便"
        ],
        "description": "梨是传统中医推崇的润肺止咳水果，生吃清六腑之热，熟食滋五脏之阴。梨富含膳食纤维和山梨糖醇，有助于改善便秘，维护肠道健康。"
    },
    "Mango": {
        "name_zh": "芒果",
        "emoji": "🥭",
        "calories_per_100g": "60 kcal",
        "vitamin_c": "36.4 mg",
        "fiber": "1.6 g",
        "benefits": [
            "维生素A含量极高，保护视力",
            "富含抗氧化物质，延缓衰老",
            "改善消化，缓解便秘"
        ],
        "description": "芒果被誉为热带水果之王，富含维生素A和维生素C。芒果中的芒果苷和槲皮素等抗氧化物质有助于保护细胞免受自由基损伤，延缓衰老。"
    },
    "Pineapple": {
        "name_zh": "菠萝",
        "emoji": "🍍",
        "calories_per_100g": "50 kcal",
        "vitamin_c": "47.8 mg",
        "fiber": "1.4 g",
        "benefits": [
            "含菠萝蛋白酶，助消化肉类蛋白质",
            "抗炎消肿，缓解关节炎",
            "富含锰元素，促进骨骼健康"
        ],
        "description": "菠萝含有独特的菠萝蛋白酶（菠萝酶），能帮助分解蛋白质，促进消化。菠萝还富含锰元素，对骨骼发育和结缔组织健康至关重要。"
    },
    "Cherry": {
        "name_zh": "樱桃",
        "emoji": "🍒",
        "calories_per_100g": "50 kcal",
        "vitamin_c": "7.0 mg",
        "fiber": "1.6 g",
        "benefits": [
            "含褪黑素，改善睡眠质量",
            "缓解痛风和关节炎疼痛",
            "补铁补血，美容养颜"
        ],
        "description": "樱桃色泽艳丽、味道甜美，是天然的褪黑素来源，有助于调节睡眠周期。樱桃中的花青素具有抗炎作用，可缓解痛风和运动后的肌肉酸痛。"
    },
    "Lemon": {
        "name_zh": "柠檬",
        "emoji": "🍋",
        "calories_per_100g": "29 kcal",
        "vitamin_c": "53.0 mg",
        "fiber": "2.8 g",
        "benefits": [
            "维生素C丰富，美白淡斑",
            "碱性食物，平衡体内酸碱",
            "促进胆汁分泌，帮助消化脂肪"
        ],
        "description": "柠檬以高维生素C含量和清新的酸味著称。虽然口感酸，但柠檬在体内代谢后呈碱性，有助于平衡体内酸碱环境。柠檬皮中的柠檬烯具有抗癌潜力。"
    },
    "Blueberry": {
        "name_zh": "蓝莓",
        "emoji": "🫐",
        "calories_per_100g": "57 kcal",
        "vitamin_c": "9.7 mg",
        "fiber": "2.4 g",
        "benefits": [
            "花青素含量极高，护眼明目",
            "延缓大脑衰老，增强记忆力",
            "抗氧化值 ORAC 在所有水果中排名前列"
        ],
        "description": "蓝莓被誉为超级食品，花青素含量在所有水果中名列前茅。蓝莓中的抗氧化物质有助于保护视力、增强记忆力、延缓脑部衰老，是名副其实的健脑水果。"
    },
    "Pomegranate": {
        "name_zh": "石榴",
        "emoji": "🫐",
        "calories_per_100g": "83 kcal",
        "vitamin_c": "10.2 mg",
        "fiber": "4.0 g",
        "benefits": [
            "抗氧化能力是绿茶的3倍",
            "保护心血管，降低血压和胆固醇",
            "富含鞣花酸，抗癌抗炎"
        ],
        "description": "石榴富含多酚和鞣花酸，抗氧化能力远超绿茶和红酒。石榴汁有助于降低血压、改善血液流动、减少动脉粥样硬化风险，是心血管健康的守护者。"
    },
}


def get_nutrition_info(class_name: str) -> Optional[dict]:
    """根据英文类名查找营养数据，未找到返回 None。"""
    return NUTRITION_INFO.get(class_name)


def get_fruit_emoji(class_name: str) -> str:
    """获取水果 emoji，未匹配时返回默认值。"""
    info = NUTRITION_INFO.get(class_name)
    return info["emoji"] if info else "🍍"
