import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const reviewCode = async (code, language) => {
  const result = await model.generateContent(`
    You are a code review assistant and your task is to generate a short code review for a given code snippet.
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

      If the code is perfect, respond with "No issues found."
    `);

  const response = result.response.text();

  return response;
};

export default reviewCode;
