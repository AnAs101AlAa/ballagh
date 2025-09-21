import { GoPlus } from "react-icons/go";
import { useState, useRef, useEffect } from "react";
import { IoMdArrowUp } from "react-icons/io";
import TypeOutText from "../components/TypeoutText";
import { LuAudioLines } from "react-icons/lu";
import UseChatbot from "../hooks/UseChatbot";
import { FaXmark } from "react-icons/fa6";

export default function ChatbotPage() {
    const { sendPrompt } = UseChatbot();
    const [promptInput, setPromptInput] = useState<string>("");
    const [uploadedInputs, setUploadedInputs] = useState<File[]>([]);
    const [chatStatus, setChatStatus] = useState<"idle" | "typing" | "fetching">("idle");
    const [messageFeed, setMessageFeed] = useState<{type: "user" | "bot", content: string}[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [renderIn, setRenderIn] = useState<boolean>(false);

    useEffect(() => {
        setTimeout(() => setRenderIn(true), 50);
    }, []);

    const handleNewMessage = () => {
        if (promptInput.trim() !== "" && chatStatus === "idle") {
            setMessageFeed((prev) => [...prev, { type: "user", content: promptInput.trim() }]);
            setPromptInput("");
            setUploadedInputs([]);
            setChatStatus("fetching");
            sendPrompt(promptInput.trim(), uploadedInputs).then((response) => {
                console.log("AI Response:", response);
                setMessageFeed((prev) => [...prev, { type: "bot", content: response }]);
                setChatStatus("idle");
            }).catch((error) => {
                console.error("Error sending prompt:", error);
                setChatStatus("idle");
            });
        }
    };

    const handlePlusClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            Array.from(files).forEach(file => {
                setUploadedInputs(prev => [...prev, file]);
            });
        }
    };

    return (
        <div className={`min-h-screen w-screen bg-background relative overflow-hidden flex justify-center items-center text-text-primary`}>
            <div className="relative xl:w-1/2 lg:w-[65%] md:w-[78%] w-[90%] min-h-screen">
                <div className="relative w-full h-[85vh] mt-8 overflow-y-auto flex flex-col space-y-4 md:space-y-7 lg:space-y-10 mb-5 my-scrollbar p-3 lg:text-[16px] md:text-[14px] text-[12px]">         
                    <div className={`absolute top-1/3 w-[90%] -translate-x-1/2 left-1/2 flex flex-col items-center justify-center space-y-3 ${messageFeed.length === 0 && renderIn ? "opacity-100 translate-y-0 z-10" : "opacity-0 -translate-y-10 -z-10"} transition-all duration-500`}>
                        <h1 className="text-text-primary font-bold lg:text-[48px] md:text-[39px] text-[30px]">مرحبا</h1>
                        <p className="text-text-secondary lg:text-[20px] md:text-[17px] text-[15px] max-w-lg text-center">اخبرني ببلاغك حتى يمكننا ايصاله بشكل صحيح و موجز</p>
                    </div>
                    {messageFeed.map((message, index) => (
                        message.type === "bot" ? (
                            <TypeOutText key={index} text={message.content} styles="" speed={20} />
                        ) : (
                            <div dir="rtl" key={index} className={`py-3 px-4 rounded-2xl animate-fade-in bg-primary w-fit max-w-[90%] md:max-w-[70%] lg:max-w-1/2`}>
                                {message.content}
                            </div>
                        )
                    ))}
                    {chatStatus === "fetching" && <div className="animate-pulse">المساعد يفكر...</div>}
                </div>
                <div className={`bg-primary ${uploadedInputs.length > 0 ? "rounded-3xl" : "rounded-full"} py-2 px-3 w-full flex flex-col space-y-3 absolute bottom-5`}>
                    {uploadedInputs.length > 0 && (
                        <div className="w-full flex space-x-3 overflow-x-auto my-scrollbar">
                            {uploadedInputs.map((file, index) => (
                                <div key={index} className="flex items-center justify-between relative w-1/5 min-h-full">
                                    <img src={URL.createObjectURL(file)} alt={file.name} className="min-h-full rounded-lg object-contain" />
                                    <FaXmark className="absolute top-2 right-2 size-3 md:size-4 lg:size-5 text-black bg-text-secondary rounded-full p-1 cursor-pointer" onClick={() => {
                                        setUploadedInputs((prev) => prev.filter((_, i) => i !== index));
                                    }} />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="w-full flex justify-between items-center">
                        <GoPlus
                            className="text-[26px] md:text-[30px] cursor-pointer"
                            onClick={handlePlusClick}
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <input dir="rtl" onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleNewMessage();
                            }
                        }} value={promptInput} onChange={(e) => setPromptInput(e.target.value)} type="text" placeholder="اكتب رسالتك هنا..." className={`lg:text-[16px] md:text-[14px] text-[12px] w-full focus:outline-none font-medium duration-200 transition-all rounded-full text-sm px-5 py-2.5 flex text-text-primary`} />
                        <div className={`relative h-7 lg:h-9 min-w-7 lg:min-w-9 rounded-full ${promptInput.trim() === "" ? "brightness-75" : "brightness-100"} bg-text-primary cursor-pointer`}>
                            <IoMdArrowUp onClick={() => handleNewMessage()} className={`top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute text-[14px] md:text-[17px] lg:text-[20px] text-background transition-all duration-200 ${chatStatus === "idle" ? "opacity-100 z-10" : "opacity-0 -z-50"}`} />
                            <LuAudioLines className={`top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 absolute text-[14px] md:text-[17px] lg:text-[20px] text-text-background transition-all duration-200 ${chatStatus !== "idle" ? "opacity-100 z-10" : "opacity-0 -z-50"}`} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}