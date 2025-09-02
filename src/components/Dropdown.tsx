import { FaChevronDown } from "react-icons/fa"
import { useRef, useState } from "react"
export default function Dropdown({options, selectedOption, onSelect} : {options: string[], selectedOption: string, onSelect: (option: string) => void}) {
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
        <div ref={menuRef} className="relative w-full group text-(--text-primary)" onBlur={() => handleBlur() }>
            <button id="dropdownDefaultButton" data-dropdown-toggle="dropdown" className={`w-full bg-(--background) border-(--border) border-2 group-hover:border-(--border-hover) focus:outline-none font-medium duration-200 transition-all ${isOpen ? "rounded-t-xl" : "rounded-xl"} text-sm px-5 py-2.5 flex justify-between items-center`} type="button" onClick={() => setIsOpen(!isOpen)}>
                <FaChevronDown className={`w-2.5 h-2.5 ${isOpen ? "rotate-180" : ""} transition-all`} />
                {selectedOption}
            </button>
            <div ref={dropdownRef} id="dropdown" className={`${isOpen ? "z-10 translate-y-10" : "-z-50 translate-y-0"} w-full border-t-0 border-2 border-(--border) group-hover:border-(--border-hover) bg-(--background) transition-all duration-200 ease-in-out absolute top-0 rounded-b-xl`}>
                <ul className="py-2 text-sm" aria-labelledby="dropdownDefaultButton">
                    {options.map((option, index) => (
                        <li key={index} onClick={() => {onSelect(option); setIsOpen(false);}}>
                            <a href="#" className={`block px-4 py-2 hover:text-(--text-secondary) ${selectedOption === option ? "text-(--text-secondary)" : ""} transition-colors`}>{option}</a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}