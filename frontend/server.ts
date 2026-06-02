import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// 后端 API 地址（FastAPI 推理服务）
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

// 测试模式开关：在开发时设为 true 可以使用模拟数据，不消耗模型推理资源
const TEST_MODE = false;

// 水果热量估算范围 (kcal/100g)，用于计算 caloriePercentage
const CALORIE_RANGES: Record<string, [number, number]> = {
  low: [20, 40],    // 低热量
  medium: [40, 60], // 中等热量
  high: [60, 80],   // 较高热量
};

function estimateCaloriePercentage(calories: string): number {
  const match = calories.match(/(\d+)/);
  if (!match) return 50;
  const val = parseInt(match[1]);
  // 常见水果热量范围约 20-80 kcal/100g，映射到 1-100
  return Math.min(100, Math.max(1, Math.round((val / 80) * 100)));
}

function estimateNutrientPercentage(value: string, category: string): number {
  const match = value.match(/([\d.]+)/);
  if (!match) return 50;
  const val = parseFloat(match[1]);
  switch (category) {
    case "vitamin_c":
      // 常见范围 0-200 mg，中位数约 30
      return Math.min(100, Math.max(1, Math.round((val / 100) * 100)));
    case "fiber":
      // 常见范围 0-10 g，中位数约 3
      return Math.min(100, Math.max(1, Math.round((val / 8) * 100)));
    default:
      return 50;
  }
}

interface FastAPIResult {
  fruit_en: string;
  fruit_zh: string;
  confidence: number;
  emoji: string;
  nutrition: {
    calories: string;
    vitamin_c: string;
    fiber: string;
    benefits: string[];
    description: string;
  };
  top3: Array<{
    name_en: string;
    name_zh: string;
    confidence: number;
  }>;
}

interface FruitInfo {
  name: string;
  scientificName: string;
  calories: string;
  caloriePercentage: number;
  highlights: string;
  nutritionalProfile: { label: string; value: string; percentage: number }[];
  superpowers: string[];
  trivia: string;
  origin: string;
}

function mapToFruitInfo(result: FastAPIResult): FruitInfo {
  const { nutrition } = result;

  return {
    name: `${result.emoji} ${result.fruit_zh}`,
    scientificName: result.fruit_en,
    calories: nutrition.calories,
    caloriePercentage: estimateCaloriePercentage(nutrition.calories),
    highlights: nutrition.description,
    nutritionalProfile: [
      {
        label: "维生素 C",
        value: nutrition.vitamin_c,
        percentage: estimateNutrientPercentage(nutrition.vitamin_c, "vitamin_c"),
      },
      {
        label: "膳食纤维",
        value: nutrition.fiber,
        percentage: estimateNutrientPercentage(nutrition.fiber, "fiber"),
      },
    ],
    superpowers: nutrition.benefits,
    trivia: `该水果的识别置信度为 ${(result.confidence * 100).toFixed(1)}%。Top-3 预测：${result.top3.map((t) => `${t.name_zh} ${(t.confidence * 100).toFixed(1)}%`).join("、")}`,
    origin: "基于 Fruits 360 数据集训练的 4 层 CNN 模型识别，测试准确率 99.90%。",
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 images
  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.post("/api/identify", async (req, res) => {
    try {
      const { imageParams } = req.body;

      if (TEST_MODE) {
        console.warn("当前处于测试模拟模式，未请求真实模型。");
        await new Promise((resolve) => setTimeout(resolve, 2500));

        return res.json({
          name: "🍎 苹果 (测试示例)",
          scientificName: "Apple",
          calories: "52 kcal",
          caloriePercentage: 65,
          highlights: "苹果富含膳食纤维和维生素C，常食有助于消化健康，是日常水果的完美选择。",
          nutritionalProfile: [
            { label: "维生素 C", value: "4.6 mg", percentage: 15 },
            { label: "膳食纤维", value: "2.4 g", percentage: 30 },
          ],
          superpowers: [
            "促进消化，富含膳食纤维",
            "降低胆固醇，保护心血管健康",
            "增强免疫力，抗氧化",
          ],
          trivia: "苹果树是世界上种植最广泛的果树之一，全球有超过 7500 个品种。测试模式下返回模拟数据。",
          origin: "基于 Fruits 360 数据集训练的 CNN 模型。【提示：当前为测试模式】",
        });
      }

      // 从 base64 构建 FormData 发送给 FastAPI
      const base64Data = imageParams?.inlineData?.data;
      if (!base64Data) {
        return res.status(400).json({ error: "未收到图片数据" });
      }

      // 将 base64 转为 Buffer
      const imageBuffer = Buffer.from(base64Data, "base64");

      // 构建 multipart/form-data
      const boundary = "----FormBoundary" + Math.random().toString(36).slice(2);
      const mimeType = imageParams?.inlineData?.mimeType || "image/jpeg";
      const fileName = mimeType.includes("png") ? "image.png" : "image.jpg";

      const header = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`;
      const footer = `\r\n--${boundary}--\r\n`;

      const body = Buffer.concat([
        Buffer.from(header, "utf-8"),
        imageBuffer,
        Buffer.from(footer, "utf-8"),
      ]);

      // 调用 FastAPI 后端
      const backendRes = await fetch(`${BACKEND_URL}/api/predict`, {
        method: "POST",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
        },
        body,
      });

      if (!backendRes.ok) {
        const errText = await backendRes.text();
        console.error("Backend error:", backendRes.status, errText);
        return res
          .status(backendRes.status)
          .json({ error: `后端推理服务错误: ${backendRes.status}` });
      }

      const apiResult = (await backendRes.json()) as FastAPIResult;

      // 映射为前端期望的 FruitInfo 格式
      const fruitInfo = mapToFruitInfo(apiResult);
      res.json(fruitInfo);
    } catch (error: any) {
      console.error("API Error:", error);
      res
        .status(500)
        .json({ error: error.message || "分析过程中发生错误，请稍后重试。" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Backend API: ${BACKEND_URL}`);
  });
}

startServer();
