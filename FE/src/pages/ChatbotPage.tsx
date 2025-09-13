import { GoPlus } from "react-icons/go";
import { useState } from "react";
import { IoMdArrowUp } from "react-icons/io";
import TypeOutText from "../components/TypeoutText";
import { LuAudioLines } from "react-icons/lu";
import UseChatbot from "../hooks/UseChatbot";

export default function ChatbotPage() {
    const { sendPrompt } = UseChatbot();
    const [promptInput, setPromptInput] = useState<string>("");
    const [chatStatus, setChatStatus] = useState<"idle" | "typing" | "fetching">("idle");
    const [messageFeed, setMessageFeed] = useState<{type: "user" | "bot", content: string}[]>([
    ]);

    const handleNewMessage = () => {
        if (promptInput.trim() !== "" && chatStatus === "idle") {
            setMessageFeed((prev) => [...prev, { type: "user", content: promptInput.trim() }]);
            setPromptInput("");
            setChatStatus("fetching");
            sendPrompt(promptInput.trim()).then((response) => {
                console.log("AI Response:", response);
                setMessageFeed((prev) => [...prev, { type: "bot", content: response }]);
                setChatStatus("idle");
            }).catch((error) => {
                console.error("Error sending prompt:", error);
                setChatStatus("idle");
            });
        }
    }

    return (
            <div className={`min-h-screen w-screen bg-(--background) relative overflow-hidden flex justify-center items-center text-(--text-primary)`}>
                <div className="xl:w-1/2 lg:w-[65%] md:w-[78%] w-[90%] h-full">
                <div className="w-full h-[85vh] overflow-y-auto flex flex-col space-y-4 md:space-y-7 lg:space-y-10 mb-5 my-scrollbar p-3 lg:text-[16px] md:text-[14px] text-[12px]">
                {messageFeed.map((message, index) => (
                    message.type === "bot" ? (
                        <TypeOutText key={index} text={message.content} styles="" speed={20} />
                    ) : (
                        <div dir="rtl" key={index} className={`py-3 px-4 rounded-2xl animate-fade-in bg-(--primary) w-fit max-w-[90%] md:max-w-[70%] lg:max-w-1/2`}>
                            {message.content}
                        </div>
                    )
                ))}
                {chatStatus === "fetching" && <div className="animate-pulse">bot is thinking...</div>}
                </div>
                <div className="bg-(--primary) rounded-full px-4 p-2 w-full flex justify-between items-center">
                    <GoPlus className="text-[26px] md:text-[30px] cursor-pointer" />
                    <input type="file" accept="image/*,video/*" multiple className="hidden" />
                    <input dir="rtl" onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleNewMessage();
                        }
                    }} value={promptInput} onChange={(e) => setPromptInput(e.target.value)} type="text" placeholder="اكتب رسالتك هنا..." className={`lg:text-[16px] md:text-[14px] text-[12px] w-full focus:outline-none font-medium duration-200 transition-all rounded-full text-sm px-5 py-2.5 flex text-(--text-primary)`} />
                    <div className={`relative h-7 lg:h-9 min-w-7 lg:min-w-9 rounded-full ${promptInput.trim() === "" ? "brightness-75" : "brightness-100"} bg-(--text-primary) cursor-pointer`}>
                        <IoMdArrowUp onClick={() => handleNewMessage()} className={`top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute text-[14px] md:text-[17px] lg:text-[20px] text-(--background) transition-all duration-200 ${chatStatus === "idle" ? "opacity-100 z-10" : "opacity-0 -z-50"}`} />
                        <LuAudioLines className={`top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute text-[14px] md:text-[17px] lg:text-[20px] text-(--background) transition-all duration-200 ${chatStatus !== "idle" ? "opacity-100 z-10" : "opacity-0 -z-50"}`} />
                    </div>
                </div>
                </div>
            </div>
    )
}