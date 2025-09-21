export default function InputField({ value, onChange, placeholder, label}: { value: string; onChange: (val: string) => void; placeholder?: string; label: string }) {
    return (
        <div className="w-full flex flex-col items-end space-y-2">
            <p className="font-semibold text-[12px] md:text-[14px] lg:text-[16px]">{label}</p>
            <input dir="rtl" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className={`w-full bg-background border-border border-2 hover:border-border-hover focus:outline-none font-medium duration-200 transition-all rounded-xl text-sm px-5 py-2.5 flex`} />
        </div>
    );
}