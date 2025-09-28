import { ButtonTypes } from "../constants/presets";

export default function Button({buttonText, onClick, type}: {buttonText: string, onClick: () => void, type: ButtonTypes}) {
    const stylePresets : Record<ButtonTypes, string> = {
        primary: "bg-primary border-border hover:bg-text-secondary hover:border-text-secondary hover:text-primary text-text-secondary",
        secondary: "bg-secondary border-border hover:bg-text-secondary-hover text-text-secondary",
        tertiary: "bg-tertiary border-border hover:bg-tertiary-hover text-text-tertiary",
        danger: 'bg-danger border-border hover:bg-danger text-danger hover:text-primary hover:border-danger'
    }

    return (
        <button onClick={onClick} className={`btn-${stylePresets[type]} mt-5 lg:mt-7 rounded-xl px-6 py-2 border cursor-pointer font-bold text-[12px] md:text-[13px] lg:text-[14px] transition-all duration-200 ease-in-out`}>
            {buttonText}
        </button>
    )
}