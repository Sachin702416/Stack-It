// src/utils/cohere.js
import axios from 'axios';

const COHERE_API_KEY = "r7w4NvTDZVCkSLoWpCaOwYRErAptl2WUhJkumwHT"; // Replace with your Cohere key

export const getAISuggestion = async (prompt) => {
  try {
    const response = await axios.post(
      "https://api.cohere.ai/v1/generate",
      {
        model: "command",
        prompt: prompt,
        max_tokens: 60,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.generations[0].text.trim();
  } catch (error) {
    console.error("Cohere API Error:", error);
    return "No suggestion generated.";
  }
};
