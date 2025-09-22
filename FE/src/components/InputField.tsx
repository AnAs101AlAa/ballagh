export default function InputField({ value, onChange, placeholder, label, error}: { value: string; onChange: (val: string) => void; placeholder?: string; label: string; error?: string }) {
    return (
        <div className="w-full flex flex-col items-end space-y-2">
            <p className="font-semibold text-[11px] md:text-[12px] lg:text-[14px]">{label}</p>
            <input dir="rtl" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className={`w-full bg-background ${error ? "border-danger hover:border-danger-hover" : "border-border hover:border-border-hover"} border-[1px] focus:outline-none font-medium duration-200 transition-all rounded-xl text-sm px-3 py-2 flex`} />
            {error && <p className="text-danger text-[10px] md:text-[11px] lg:text-[12px]">{error}</p>}
        </div>
    );
}