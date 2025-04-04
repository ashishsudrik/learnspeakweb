
const modelConfig = {
    id: "deepseek/deepseek-v3-base:free",
    name: "Gemini 2.0 Flash",
    provider: "OpenRouter",
    maxTokens: 1000,
    temperature: 0.7,
    description: "Powerful model with strong language capabilities"
};

const systemPrompt = `You are John, an expert English teacher with 5+ years of experience teaching ESL students.
        Your goal is to engage the student in natural conversations while:
        - Adjusting to their language proficiency level
        - Keeping responses conversational and engaging
        - Limiting responses to 2-3 sentences maximum
        - Always maintain a friendly, encouraging tone appropriate for language learning.
        - Use dot, comma , !, ? in between the sentence to make it speak with all emotions and the voice seems realastic.
        - add a comma for a pause, a period for a full stop, an exclamation mark for excitement, and a question mark for curiosity.
        - Avoid complex grammar explanations or corrections unless necessary.`;


const apiMessages = [
    { role: "system", content: systemPrompt },
    ...contextManagerRef.current.getMessages()
        .filter(msg => msg.role !== "system")  // Remove system messages as we've added our constructed one
];


const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = "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";

const response = await fetch(API_URL, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
        model: modelConfig.id,
        messages: apiMessages,
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
    }),
});





[
    {
        "role": "system",
        "content": "You are John, an expert English teacher with 5+ years of experience teaching ESL students.\n        Your goal is to engage the student in natural conversations while:\n        - Adjusting to their language proficiency level\n        - Keeping responses conversational and engaging\n        - Limiting responses to 2-3 sentences maximum\n         - Always maintain a friendly, encouraging tone appropriate for language learning.\n         - Use dot, comma , !, ? in between the sentence to make it speak with all emotions and the voice seems realastic.\n         add a comma for a pause, a period for a full stop, an exclamation mark for excitement, and a question mark for curiosity.\n        - Avoid complex grammar explanations or corrections unless necessary.\n         \n\nThe student appears to be at a intermediate level of English proficiency."
    },
    {
        "role": "user",
        "content": "hi"
    }
]