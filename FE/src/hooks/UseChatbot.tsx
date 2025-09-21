import sendGeminiRequest from "../services/AiChat"

export default function UseChatbot() {

    const sendPrompt = async (prompt: string, uploadedFiles: File[]) => {
        try {
            let response;
            if(uploadedFiles.length > 0) {
                response = await sendGeminiRequest(prompt, uploadedFiles);
            } else {
                response = await sendGeminiRequest(prompt);
            }
            return response;
        } catch (error) {
            console.error("Error sending prompt:", error);
            throw error;
        }
    }

    return { sendPrompt };
}