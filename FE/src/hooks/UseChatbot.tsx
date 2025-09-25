import sendGeminiRequest from "../services/AiChat"

export default function UseChatbot() {

    const sendPrompt = async (prompt: string, uploadedFiles: File[], sessionId: string) => {
        let response;
        if(uploadedFiles.length > 0) {
            response = await sendGeminiRequest(prompt, uploadedFiles, sessionId);
        } else {
            response = await sendGeminiRequest(prompt, [], sessionId);
        }
        return response;
    }

    return { sendPrompt };
}