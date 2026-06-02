import type { Context } from "@netlify/functions";

const MIMO_API_URL = "https://token-plan-cn.xiaomimimo.com/v1/chat/completions";
const MIMO_MODEL = "mimo-v2.5";

const SYSTEM_PROMPT = `你是水果识别助手。识别图片中的水果，返回纯JSON，不要加任何markdown标记。

格式：
{"fruit_zh":"中文名","fruit_en":"英文名","emoji":"🍎","calories":"52 kcal","vitamin_c":"4.6 mg/100g","fiber":"2.4 g/100g","benefits":["功效1","功效2","功效3"],"description":"50字简介","trivia":"冷知识"}

非水果返回：{"error":"无法识别，请上传清晰的水果照片。"}`;

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

    // Call Mimo-v2.5 API (disable thinking for faster response)
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
                text: "识别水果，返回JSON。",
              },
            ],
          },
        ],
        temperature: 0.1,
        max_completion_tokens: 512,
        thinking: { type: "disabled" },
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
    const message = mimoData?.choices?.[0]?.message;
    // Try content first, then reasoning_content (thinking mode fallback)
    const content = message?.content || message?.reasoning_content;

    if (!content) {
      console.error("Empty response from Mimo API:", JSON.stringify(mimoData));
      return new Response(
        JSON.stringify({ error: "模型返回了空结果，请重新上传图片。" }),
        { status: 502, headers }
      );
    }

    // Parse JSON from model response (strip possible markdown code block)
    let parsed: any;
    try {
      // Try to extract JSON from the response (handle various formats)
      let cleaned = content.trim();
      // Remove markdown code blocks
      cleaned = cleaned.replace(/```(?:json)?\s*/g, "").replace(/```/g, "").trim();
      // Try to find JSON object in the response
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(cleaned);
      }
    } catch (e) {
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
