import { useState, useEffect } from "react"
import logo from "/logo.png"
import { VscRobot } from "react-icons/vsc";
import { FaWpforms } from "react-icons/fa";
import Card from "../components/Card";
import { useNavigate } from "react-router-dom";
export default function LandingPage() {
    const [triggerStarter, setTriggerStarter] = useState<number>(0);
    const navigate = useNavigate();
    useEffect(() => {
        const timer = setInterval(() => {
            setTriggerStarter((prev) => prev + 1);
        }, 350);

        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <div className={`min-h-screen w-screen bg-(--background) relative overflow-hidden flex items-center`}>
            <div className="relative h-full lg:w-[75%] md:w-[80%] w-[85%] space-y-6 lg:space-y-10 z-10 flex flex-col justify-center items-center mx-auto">
                <img src={logo} className={`text-(--text-primary) h-[140px] md:h-[190px] lg:h-[267px] text-[42px] md:text-[46px] lg:text-[50px] font-bold transition-all duration-300 ease-in-out ${triggerStarter > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}/>
                <p className={`text-center text-(--text-primary) font-medium text-[16px] md:text-[19px] lg:text-[22px] transition-all duration-300 ease-in-out ${triggerStarter > 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>اول منصة مصرية للتبليغ عن الجرائم بخصوصية و امان مطلق</p>
                <div className={`flex md:flex-row flex-col justify-center items-center gap-4 transition-all duration-300 ease-in-out ${triggerStarter > 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
                    <div className="lg:w-[40%] md:w-[45%] w-[96%] ">
                        <Card icon={<VscRobot className="size-8"/>} title="المساعد الآلي" text="استخدم المساعد الآلي المدعم بالذكاء الاصطناعي لمساعدتك في التبليغ عن الجرائم بسهولة و دقة" buttonText="ابدأ الآن" onClick={() => {}} />
                    </div>
                    <div className="lg:w-[40%] md:w-[45%] w-[96%]">
                        <Card icon={<FaWpforms className="size-8"/>} title="التبليغ اليدوي" text="املأ بيانات بلاغك يدويا لتحكم اكثر في تفاصيل و بيانات البلاغ في خطوات بسيطة" buttonText="ابدأ الآن" onClick={() => navigate("/form")} />
                    </div>
                </div>
            </div>
            <div className={`fixed w-full h-full bottom-0 bg-gradient-to-b -translate-y-[15%] lg:-translate-y-[10%] from-(--background) to-(--primary) from-80% animate-breathe`} />
        </div>
    )
}