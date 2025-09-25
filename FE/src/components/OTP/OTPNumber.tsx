import { useRef } from "react";

interface OTPNumberProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
}

export default function OTPNumber({ value, onChange, length = 6 }: OTPNumberProps) {
  const inputs = Array.from({ length });
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
    const otpArr = value.split("");
    otpArr[idx] = val;
    const newOtp = otpArr.join("").padEnd(length, "");
    onChange(newOtp);

    if (val && idx < length - 1) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {inputs.map((_, idx) => (
        <input
          key={idx}
          ref={el => { refs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className="w-12 h-12 text-center text-2xl border-2 border-border rounded-lg focus:border-primary outline-none transition"
          value={value[idx] || ""}
          onChange={e => handleChange(e, idx)}
          onKeyDown={e => handleKeyDown(e, idx)}
        />
      ))}
    </div>
  );
}