export default function DatePicker({ onChange, value }: { onChange: (date: string) => void; value: string }) {
    return (
        <div className="w-full flex flex-col items-end space-y-2">
            <p className="font-semibold text-[12px] md:text-[14px] lg:text-[16px]">تاريخ الحادثة</p>
            <input value={value} type="date" className="w-full bg-background border-border border-2 hover:border-border-hover focus:outline-none font-medium duration-200 transition-all rounded-xl text-sm px-5 py-2.5 flex" onChange={(e) => onChange(e.target.value)} />
        </div>
    )
}