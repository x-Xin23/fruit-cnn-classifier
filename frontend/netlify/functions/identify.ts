import type { Config } from "@netlify/functions";

const BACKEND_URL = Netlify.env.get("BACKEND_URL") || "http://localhost:8000";

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
  trivia: string;
  top3: Array<{ name_en: string; name_zh: string; confidence: number }>;
}

function estimateCaloriePercentage(calories: string): number {
  const match = calories.match(/(\d+)/);
  if (!match) return 50;
  const val = parseInt(match[1]);
  return Math.min(100, Math.max(1, Math.round((val / 80) * 100)));
}

function estimateNutrientPercentage(value: string, category: string): number {
  const match = value.match(/([\d.]+)/);
  if (!match) return 50;
  const val = parseFloat(match[1]);
  switch (category) {
    case "vitamin_c":
      return Math.min(100, Math.max(1, Math.round((val / 100) * 100)));
    case "fiber":
      return Math.min(100, Math.max(1, Math.round((val / 8) * 100)));
    default:
      return 50;
  }
}

function mapToFruitInfo(result: FastAPIResult) {
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
    trivia:
      result.trivia ||
      `该水果的识别置信度为 ${(result.confidence * 100).toFixed(1)}%。`,
    origin:
      "基于 Fruits 360 数据集训练的 4 层 CNN 模型识别，测试准确率 99.90%。",
  };
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const base64Data = body?.imageParams?.inlineData?.data;
    const mimeType = body?.imageParams?.inlineData?.mimeType || "image/jpeg";

    if (!base64Data) {
      return new Response(
        JSON.stringify({ error: "未收到图片数据" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Convert base64 to buffer
    const imageBuffer = Uint8Array.from(atob(base64Data), (c) =>
      c.charCodeAt(0)
    );

    // Build multipart/form-data for FastAPI
    const boundary =
      "----FormBoundary" + Math.random().toString(36).slice(2);
    const fileName = mimeType.includes("png") ? "image.png" : "image.jpg";

    const encoder = new TextEncoder();
    const header = encoder.encode(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`
    );
    const footer = encoder.encode(`\r\n--${boundary}--\r\n`);

    const body_parts = new Uint8Array(
      header.length + imageBuffer.length + footer.length
    );
    body_parts.set(header, 0);
    body_parts.set(imageBuffer, header.length);
    body_parts.set(footer, header.length + imageBuffer.length);

    // Call FastAPI backend
    const backendRes = await fetch(`${BACKEND_URL}/api/predict`, {
      method: "POST",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      body: body_parts,
    });

    if (!backendRes.ok) {
      const errText = await backendRes.text();
      console.error("Backend error:", backendRes.status, errText);
      return new Response(
        JSON.stringify({
          error: `后端推理服务错误: ${backendRes.status}`,
        }),
        {
          status: backendRes.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const apiResult = (await backendRes.json()) as FastAPIResult;
    const fruitInfo = mapToFruitInfo(apiResult);

    return new Response(JSON.stringify(fruitInfo), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "分析过程发生错误，请稍后重试。",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config: Config = {
  path: "/api/identify",
};
