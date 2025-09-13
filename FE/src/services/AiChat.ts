import axios from 'axios';

const sendGeminiRequest = async (prompt: string) => {
  try {
    const response = await axios.post(
      'http://localhost:3000/api/gemini', // Call your backend proxy
      { prompt }
    );
    return response.data.answer || 'No response received';
  } catch (error: any) {
    throw new Error('Proxy API error: ' + error.message);
  }
};

export default sendGeminiRequest;