const { GoogleGenerativeAI } = require('@google/generative-ai');

async function debugCode(sourceCode, language, errorMessage) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in the .env file. Please get a free API key from Google AI Studio.");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are an expert ${language} debugger. Provide a debugging analysis for the following code and error.
    
    Source Code:
    \`\`\`${language}
    ${sourceCode}
    \`\`\`
    
    Error Message:
    ${errorMessage}
    
    You must return your response STRICTLY as a valid JSON object matching exactly this structure, with no markdown formatting around it:
    {
      "explanation": "A clear, concise explanation of why the error occurred.",
      "suggestion": "A clear, concise suggestion on how to fix it.",
      "correctedCode": "The fully corrected source code."
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Clean up potential markdown code blocks returned by Gemini
    text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    text = text.trim();

    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini API Error:', error.message || error);
    throw new Error('Failed to debug code with Gemini AI');
  }
}

module.exports = {
  debugCode,
};
