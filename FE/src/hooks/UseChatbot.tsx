import sendGeminiRequest from "../services/AiChat"

export default function UseChatbot() {

    const sendPrompt = async (prompt: string) => {
        try {
            const response = await sendGeminiRequest(prompt);
            return response;
        } catch (error) {
            console.error("Error sending prompt:", error);
            throw error;
        }
    }

    return { sendPrompt };
}