import dotenv from "dotenv";
dotenv.config();

import logger from "./lib/logger.js";

const SYSTEM_PROMPT = `You are a code review assistant. Analyze the given code and return a JSON response.
Return ONLY valid JSON with this structure:
{
  "summary": "Brief overall assessment",
  "issues": [
    {
      "number": 1,
      "severity": "critical" | "warning" | "suggestion",
      "issue": "Description of the problem",
      "line": "Line number or range",
      "fix": "How to fix it with code example"
    }
  ]
}
If the code is perfect, return: {"summary": "No issues found. The code looks good.", "issues": []}
Do NOT include markdown formatting, code fences, or any text outside the JSON.`;

const sanitizeCode = (code) => {
  return code.replace(/```/g, "'''").slice(0, 50000);
};

const parseAIResponse = (content) => {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        raw: content,
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        summary: parsed.summary || "",
      };
    }
  } catch {
    logger.warn("Failed to parse AI response as JSON, returning raw");
  }
  return { raw: content, issues: [], summary: content.slice(0, 200) };
};

const reviewCode = async (code, language, customConfig = {}) => {
  const baseUrl = customConfig.endpoint || process.env.BASE_URL;
  const apiKey = customConfig.apiKey || process.env.MODEL_API_KEY;
  const model = customConfig.model || "deepseek/deepseek-chat";

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Review this ${language} code:\n\n${sanitizeCode(code)}`,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || data.message || "API request failed");
  }

  const content = data.choices[0].message.content;
  return parseAIResponse(content);
};

export default reviewCode;
