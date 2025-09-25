import InputField from "../components/InputField"
import Button from "../components/Button"
import { useState } from "react"
import { secureLogin } from "../services/UserData";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {loginSchema} from "../schemas/loginSchema";

export default function LoginPage() {
    const [loginData, setLoginData] = useState({username: "", password: ""});
    const navigate = useNavigate();

    const handleLogin = async () => {
        const validation = loginSchema.safeParse(loginData);
        if (!validation.success) {
            const firstError = validation.error.issues[0]?.message || "برجاء ملء جميع الحقول بشكل صحيح";
            toast.error(firstError);
            return;
        }
        
        toast.promise(
            secureLogin(loginData.username, loginData.password),
            {
                loading: "جاري تسجيل الدخول...",
                success: (res) => {
                    if (res.status === "otp_sent") {
                        setTimeout(() => {
                            navigate(`/otp/${loginData.username}`);
                        }, 1500);
                        return "تم إرسال رمز التحقق إلى بريدك الإلكتروني!";
                    }
                    return "حدث خطأ غير متوقع";
                },
                error: (err) =>
                    err?.status === 400 ? "برجاء ملء جميع الحقول" : err?.status === 401 ? `فشل تسجيل الدخول: بيانات غير صحيحة` : `فشل تسجيل الدخول`,
            }
        );
    };

    return (
        <div className={`min-h-screen w-screen bg-background relative overflow-hidden flex items-center justify-center`}>
            <div className="z-10 lg:w-1/4 md:w-1/2 w-[90%] text-center text-text-primary rounded-xl p-4 md:p-6 lg:p-8 flex flex-col items-center space-y-4 border-2 border-border bg-offset">
                <p className="lg:text-[26px] md:text-[23px] text-[20px] mb-6">تسجيل الدخول</p>
                <p className="lg:text-[16px] md:text-[14px] text-[12px] text-text-secondary">برجاء إدخال بياناتك</p>
                <InputField label="اسم المستخدم" placeholder="أدخل اسم المستخدم" value={loginData.username} onChange={(e) => setLoginData({...loginData, username: e})} />
                <InputField label="كلمة المرور" placeholder="أدخل كلمة المرور" value={loginData.password} onChange={(e) => setLoginData({...loginData, password: e})} />
                <Button buttonText="تسجيل الدخول" onClick={handleLogin} type="primary" />
            </div>
            <div className={`fixed w-full h-full bottom-0 bg-gradient-to-b -translate-y-[15%] lg:-translate-y-[10%] from-background to-primary from-80% animate-breathe`} />
        </div>
    )
}