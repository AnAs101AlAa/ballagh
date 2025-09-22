import sendGeminiRequest from "../services/AiChat"
import toast from "react-hot-toast";

export default function UseChatbot() {

    const sendPrompt = async (prompt: string, uploadedFiles: File[], sessionId: string) => {
        try {
            let response;
            if(uploadedFiles.length > 0) {
                response = await sendGeminiRequest(prompt, uploadedFiles, sessionId);
            } else {
                response = await sendGeminiRequest(prompt, [], sessionId);
            }
            return response;
        } catch (error) {
            toast.error("Error sending prompt:", error);
            throw error;
        }
    }

    return { sendPrompt };
}