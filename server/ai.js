import dotenv from "dotenv";
dotenv.config();

const reviewCode = async (code, language, customConfig = {}) => {
  const baseUrl = customConfig.endpoint || process.env.BASE_URL;
  const apiKey = customConfig.apiKey || process.env.MODEL_API_KEY;
  const model = customConfig.model || "deepseek/deepseek-latest";

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: `You are a code review assistant and your task is to generate a short code review for a given code snippet.
    Your task is to:
      1. Review the code and check if there are any errors
      2. If there are no errors check if the code can be further optimized or written in a better way.
      3. If everything looks perfect, just write back "The code looks perfect."
      This is the code:

      """
      ${code}
      """

      in Language: ${language}

      For each issue found, respond in this format always:

      **Issue [number]**
      - Severity: critical / warning / suggestion
      - Issue: what's wrong
      - Line: where in the code
      - Fix: how to fix it with a code example

      If the code is perfect, respond with "No issues found."`,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || data.message || "API request failed");
  }

  return data.choices[0].message.content;
};

export default reviewCode;
