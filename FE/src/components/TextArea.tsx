export default function TextArea({ value, onChange, placeholder, label, error, descriptionRows}: { value: string; onChange: (val: string) => void; placeholder?: string; label: string; error?: string; descriptionRows: number }) {
    return (
    <div className="space-y-2 flex flex-col items-end h-full">
        <p className="font-semibold text-[11px] md:text-[12px] lg:text-[14px]">{label}</p>
        <textarea dir="rtl" placeholder={placeholder} rows={descriptionRows} value={value} onChange={(e) => onChange(e.target.value)} className={`w-full bg-background ${error ? "border-danger hover:border-danger-hover" : "border-border hover:border-border-hover"} border-[1px] focus:outline-none font-medium duration-200 transition-all rounded-xl text-sm px-3 py-2 flex`} />
        {error && <p className="text-danger text-[10px] md:text-[11px] lg:text-[12px]">{error}</p>}
    </div>
    )
}