import { IoSearchSharp } from "react-icons/io5";

export default function InputField({ value, onChange, placeholder}: { value: string; onChange: (val: string) => void; placeholder?: string }) {
    return (
        <div className="w-full flex flex-col items-end space-y-2">
            <div className="relative w-full text-text-primary">
                <IoSearchSharp className="absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input dir="rtl" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className={`w-full bg-background border-border hover:border-border-hover border-[1px] focus:outline-none font-medium duration-200 transition-all rounded-xl text-sm px-3 py-2 flex pl-10`} />
            </div>
        </div>
    );
}