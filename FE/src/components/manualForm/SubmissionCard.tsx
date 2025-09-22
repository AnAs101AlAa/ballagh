import { LuLoaderCircle } from "react-icons/lu";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdErrorOutline } from "react-icons/md";
import type { ReportStatus } from "../../types/report";
import { useEffect, useState } from "react";
import Button from "../Button";
import { useNavigate } from "react-router-dom";

export default function SubmissionCard({submissionStatus}: {submissionStatus: ReportStatus}) {
    const statusMessages:  {msg: string, status: ReportStatus} [] = [
        {msg: "...جاري إنشاء مفتاح التشفير الخاص بك", status: "generating"},
        {msg: "...جاري تشفير بيانات بلاغك", status: "encrypting"},
        {msg: "...جاري إرسال بلاغك الى النظام", status: "submitting"},
    ];
    const [statusIndex, setStatusIndex] = useState<number>(0);
    const navigate = useNavigate();

    useEffect(() => {
        setStatusIndex((prev) => prev + 1);
    }, [submissionStatus]);

    return (
        <div className="z-10 lg:w-1/3 md:w-1/2 w-[90%] border-2 border-border bg-offset rounded-xl p-6 lg:p-8 flex flex-col space-y-4 items-center">
            {submissionStatus !== "success" && submissionStatus !== "error" ? (
                <LuLoaderCircle className={`animate-spin text-text-secondary size-12 md:size-16 lg:size-24 mb-2`} />
            ) : (submissionStatus === "error" ? (
                <MdErrorOutline className={`text-danger size-12 md:size-16 lg:size-24 mb-2`} />
            ) : (
                <IoMdCheckmarkCircleOutline className={`text-green-500 size-12 md:size-16 lg:size-24 mb-2`} />
            ))}
            <p className={`font-semibold text-[16px] md:text-[20px] lg:text-[24px] mb-8`}>{submissionStatus === "success" ? "تم إرسال البلاغ بنجاح" : submissionStatus === "error" ? "فشل إرسال البلاغ" : "جاري ارسال بلاغك"}</p>
            {statusMessages.map(({msg}, index) => (
                <div key={index} className="flex gap-3 items-center flex-row-reverse w-full">
                    {submissionStatus === "error" ? (
                        <MdErrorOutline className="text-danger size-5 md:size-6 lg:size-7" />
                    ) : statusIndex <= index ? (
                        <LuLoaderCircle className="animate-spin text-text-secondary size-5 md:size-6 lg:size-7" />
                    ) : (
                        <IoMdCheckmarkCircleOutline className="text-green-500 size-5 md:size-6 lg:size-7" />
                    )}
                    <p className={`font-semibold text-[14px] md:text-[16px] lg:text-[18px] text-text-primary`}>{msg}</p>
                </div>
            ))}
            {(submissionStatus === "success" || submissionStatus === "error") && (
                <Button buttonText="العودة للرئيسية" onClick={() => navigate('/')} type="primary"/>
            )}
        </div>
    )
}