import { useParams, useNavigate } from "react-router-dom";
import { verifyOTP } from "../services/UserData";
import { useState } from "react";
import InputField from "../components/InputField";
import Button from "../components/Button";
import toast from "react-hot-toast";

export default function OTPPage() {
    const { username } = useParams() as { username: string };
    const [otp, setOtp] = useState("");
    const navigate = useNavigate();

    const handleVerifyOTP = async () => {
        toast.promise(
            verifyOTP(username, otp).then(() => {
                setTimeout(() => {
                    navigate("/home");
                }, 1500);
            }),
            {
                loading: "تحقق من الرمز...",
                success: "تم التحقق بنجاح!",
                error: "فشل التحقق. حاول مرة أخرى."
            }
        );
    };

    return (
        <div className={`min-h-screen w-screen bg-background relative overflow-hidden flex items-center justify-center`}>
            <div className="z-10 lg:w-1/2 md:w-[60%] w-[94%] text-center text-text-primary rounded-xl p-4 md:p-6 lg:p-8 flex flex-col items-center space-y-4 border-2 border-border bg-offset">
                <p className="lg:text-[26px] md:text-[23px] text-[20px] mb-6">صفحة OTP</p>
                <p className="lg:text-[16px] md:text-[14px] text-[12px] text-text-secondary">هذه صفحة OTP</p>
                <InputField label="رمز التحقق" placeholder="أدخل رمز التحقق" value={otp} onChange={(e) => setOtp(e)} />
                <Button onClick={handleVerifyOTP} buttonText="تحقق" type="primary" />
            </div>
            <div className={`fixed w-full h-full bottom-0 bg-gradient-to-b -translate-y-[15%] lg:-translate-y-[10%] from-background to-primary from-80% animate-breathe`} />
        </div>
    )
}