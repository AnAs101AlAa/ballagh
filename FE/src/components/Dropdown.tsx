import { FaChevronDown } from "react-icons/fa"
import { useRef, useState } from "react"
export default function Dropdown({label, options, selectedOption, onSelect, error} : {label?: string, options: string[], selectedOption: string, onSelect: (option: string) => void, error?: string}) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const handleBlur = () => {
        setTimeout(() => {
            if (
                menuRef.current &&
                !menuRef.current.contains(document.activeElement) &&
                !dropdownRef.current?.contains(document.activeElement)
            ) {
                setIsOpen(false);
            }
        }, 0);
    };

    return (
        <div className="w-full flex flex-col items-end space-y-2">
            {label && <p className="font-semibold text-[11px] md:text-[12px] lg:text-[14px]">{label}</p>}
            <div ref={menuRef} className="relative w-full group text-text-primary" onBlur={() => handleBlur() }>
                <button id="dropdownDefaultButton" data-dropdown-toggle="dropdown" className={`w-full bg-background ${error ? "border-danger group-hover:border-danger-hover" : "border-border group-hover:border-border-hover"} border-[1px] focus:outline-none font-medium duration-200 transition-all ${isOpen ? "rounded-t-xl" : "rounded-xl"} text-sm px-3 py-2 flex justify-between items-center`} type="button" onClick={() => setIsOpen(!isOpen)}>
                    <FaChevronDown className={`w-2.5 h-2.5 ${isOpen ? "rotate-180" : ""} transition-all`} />
                    {selectedOption}
                </button>
                <div ref={dropdownRef} id="dropdown" className={` ${isOpen ? "z-10 translate-y-10 opacity-100 pointer-events-auto" : "-z-50 opacity-0 translate-y-0 pointer-events-none"} ${error ? "border-danger group-hover:border-danger-hover" : "border-border group-hover:border-border-hover"} w-full border-t-0 border-[1px] bg-background transition-all duration-200 ease-in-out absolute top-0 rounded-b-xl`}>
               <ul className="py-2 text-sm" aria-labelledby="dropdownDefaultButton">
                        {options.map((option, index) => (
                            <li key={index} onClick={() => {onSelect(option); setIsOpen(false);}}>
                                <a href="#" className={`block px-4 py-2 hover:text-text-secondary ${selectedOption === option ? "text-text-secondary" : ""} transition-colors`}>{option}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {error && <p className="text-danger text-[10px] md:text-[11px] lg:text-[12px]">{error}</p>}
        </div>
    )
}