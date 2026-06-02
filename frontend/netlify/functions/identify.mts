import type { Context } from "@netlify/functions";

const MIMO_API_URL = "https://api.xiaomimimo.com/v1/chat/completions";
const MIMO_MODEL = "mimo-v2.5";

const SYSTEM_PROMPT = `你是一个专业的水果识别助手。用户会给你一张图片，请你识别图片中的水果。

请严格按照以下 JSON 格式返回结果，不要添加任何额外的文字说明、markdown 标记或代码块标记，只返回纯 JSON：

{
  "fruit_zh": "水果中文名",
  "fruit_en": "水果英文名",
  "emoji": "对应水果的emoji",
  "calories": "每100g热量，格式如 '52 kcal'",
  "vitamin_c": "维生素C含量，格式如 '4.6 mg/100g'",
  "fiber": "膳食纤维含量，格式如 '2.4 g/100g'",
  "benefits": ["健康益处1", "健康益处2", "健康益处3"],
  "description": "一段50字左右的水果营养简介",
  "trivia": "一个关于该水果的有趣冷知识"
}

注意：
- 如果图片不是水果或无法识别，请返回 {"error": "无法识别图片中的水果，请上传一张清晰的水果照片。"}
- benefits 数组固定返回 3 项
- 所有文本使用中文`;

export default async (req: Request, _context: Context) => {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers }
    );
  }

  // Get API key from environment
  const apiKey = Netlify.env.get("MIMO_API_KEY");
  if (!apiKey) {
    console.error("MIMO_API_KEY not configured");
    return new Response(
      JSON.stringify({ error: "服务配置错误，请联系管理员。" }),
      { status: 500, headers }
    );
  }

  try {
    const body = await req.json();
    const base64Data = body?.imageParams?.inlineData?.data;
    const mimeType = body?.imageParams?.inlineData?.mimeType || "image/jpeg";

    if (!base64Data) {
      return new Response(
        JSON.stringify({ error: "未收到图片数据" }),
        { status: 400, headers }
      );
    }

    // Call Mimo-v2.5 API
    const mimoRes = await fetch(MIMO_API_URL, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MIMO_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                },
              },
              {
                type: "text",
                text: "请识别这张图片中的水果，并按照要求的 JSON 格式返回结果。",
              },
            ],
          },
        ],
        temperature: 0.3,
        max_completion_tokens: 1024,
      }),
    });

    if (!mimoRes.ok) {
      const errText = await mimoRes.text();
      console.error("Mimo API error:", mimoRes.status, errText);
      return new Response(
        JSON.stringify({ error: `模型服务暂时不可用 (${mimoRes.status})，请稍后重试。` }),
        { status: 502, headers }
      );
    }

    const mimoData = await mimoRes.json();
    const content = mimoData?.choices?.[0]?.message?.content;

    if (!content) {
      console.error("Empty response from Mimo API");
      return new Response(
        JSON.stringify({ error: "模型返回了空结果，请重新上传图片。" }),
        { status: 502, headers }
      );
    }

    // Parse JSON from model response (strip possible markdown code block)
    let parsed: any;
    try {
      const cleaned = content.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse model response as JSON:", content);
      return new Response(
        JSON.stringify({ error: "模型返回格式异常，请重新上传图片。" }),
        { status: 502, headers }
      );
    }

    // Check for model's own error response
    if (parsed.error) {
      return new Response(
        JSON.stringify({ error: parsed.error }),
        { status: 422, headers }
      );
    }

    // Validate required fields
    if (!parsed.fruit_zh || !parsed.fruit_en) {
      return new Response(
        JSON.stringify({ error: "未能识别出水果，请上传一张更清晰的照片。" }),
        { status: 422, headers }
      );
    }

    // Estimate calorie percentage for progress bar (map 20-80 kcal to 1-100%)
    const calorieMatch = parsed.calories?.match(/(\d+)/);
    const calorieVal = calorieMatch ? parseInt(calorieMatch[1]) : 50;
    const caloriePercentage = Math.min(100, Math.max(1, Math.round((calorieVal / 80) * 100)));

    // Estimate nutrient percentages
    const vitaminCMatch = parsed.vitamin_c?.match(/([\d.]+)/);
    const vitaminCVal = vitaminCMatch ? parseFloat(vitaminCMatch[1]) : 10;
    const fiberMatch = parsed.fiber?.match(/([\d.]+)/);
    const fiberVal = fiberMatch ? parseFloat(fiberMatch[1]) : 2;

    const result = {
      name: `${parsed.emoji || "🍎"} ${parsed.fruit_zh}`,
      scientificName: parsed.fruit_en,
      calories: parsed.calories || "",
      caloriePercentage,
      highlights: parsed.description || "",
      nutritionalProfile: [
        {
          label: "维生素 C",
          value: parsed.vitamin_c || "",
          percentage: Math.min(100, Math.max(1, Math.round((vitaminCVal / 100) * 100))),
        },
        {
          label: "膳食纤维",
          value: parsed.fiber || "",
          percentage: Math.min(100, Math.max(1, Math.round((fiberVal / 8) * 100))),
        },
      ],
      superpowers: Array.isArray(parsed.benefits) ? parsed.benefits.slice(0, 3) : [],
      trivia: parsed.trivia || "",
      origin: "由 MiMo-v2.5 大模型通过图像理解技术识别分析。",
    };

    return new Response(JSON.stringify(result), { status: 200, headers });
  } catch (err: any) {
    console.error("Function error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "分析过程中发生错误，请稍后重试。" }),
      { status: 500, headers }
    );
  }
};
