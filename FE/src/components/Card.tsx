import type { ReactNode } from "react";
import Button from "./Button";

export default function Card ({icon, title, text, buttonText, onClick} : {icon : ReactNode, title: string, text: string, buttonText: string, onClick: () => void}) {
    return (
        <div className="w-full h-full text-center text-text-primary rounded-xl p-4 md:p-6 lg:p-8 flex flex-col items-center space-y-4 border-2 border-border bg-offset hover:border-text-secondary hover:scale-[1.03] transition-all duration-300 ease-in-out">
            {icon}
            <p className="lg:text-[18px] md:text-[16px] text-[14px] mb-6">{title}</p>
            <p className="lg:text-[16px] md:text-[14px] text-[12px]">{text}</p>
            <Button buttonText={buttonText} onClick={onClick} type="primary" />
        </div>
    )
}