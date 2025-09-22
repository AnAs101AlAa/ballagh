import { useRef } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";

export default function DatePicker({
    onChange,
    value,
    error,
}: { onChange: (date: string) => void; value: string; error?: string }) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        if (inputRef.current?.showPicker) {
            inputRef.current.showPicker(); // Native date picker for supporting browsers
        } else {
            inputRef.current?.focus();    // Fallback
        }
    };

    return (
        <div className="w-full flex flex-col items-end space-y-2">
            <p className="font-semibold text-[11px] md:text-[12px] lg:text-[14px]">تاريخ ووقت الحادثة</p>
            <div className="relative w-full">
                <input
                    ref={inputRef}
                    value={value}
                    type="datetime-local"
                    onClick={handleClick}
                    className={`w-full bg-background ${error ? "border-danger hover:border-danger-hover" : "border-border hover:border-border-hover"} border-[1px] focus:outline-none font-medium duration-200 transition-all rounded-xl text-sm px-3 py-2 flex pr-10`}
                    onChange={(e) => onChange(e.target.value)}
                />
                <FaRegCalendarAlt
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 cursor-pointer"
                    size={20}
                    onClick={handleClick}
                />
            </div>
            {error && <p className="text-danger text-[10px] md:text-[11px] lg:text-[12px]">{error}</p>}
        </div>
    );
}