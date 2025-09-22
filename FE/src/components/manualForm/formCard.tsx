import Dropdown from "../Dropdown";
import { categories } from "../../constants/listings";
import Button  from "../Button";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import InputField from "../InputField";
import DatePicker from "../DatePicker";
import TextArea from "../TextArea";
import type { Report, ReportStatus, ReportErrors } from "../../types/report";
import { useState, useEffect } from "react";
import submitReport from "../../services/ReportQuery";
import { reportSchema } from "../../schemas/reportSchema";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";

export default function FormCard({reportData, submissionStatus, setReportData, setSubmissionStatus}: {reportData: Report, submissionStatus: ReportStatus, setReportData: React.Dispatch<React.SetStateAction<Report>>, setSubmissionStatus: React.Dispatch<React.SetStateAction<ReportStatus>>}) {
    const [reportErrors, setReportErrors] = useState<ReportErrors>({});
    const [descriptionRows, setDescriptionRows] = useState<number>(20);
    const [recaptchaToken, setRecaptchaToken] = useState<string>("");

    useEffect(() => {
        function updateRows() {
            if (window.innerWidth >= 1024) {
                setDescriptionRows(10);
            } else if (window.innerWidth >= 768) {
                setDescriptionRows(8);
            } else {
                setDescriptionRows(6);
            }
        }
        updateRows();
        window.addEventListener("resize", updateRows);
        return () => window.removeEventListener("resize", updateRows);
    }, []);

    const handleDataChange = (field: keyof Report, value: string | File[]) => {
        setReportData((prev) => ({...prev, [field]: value}));
    }

    const handleSubmit = () => {
        if (!recaptchaToken) {
            toast.error("يرجى إكمال التحقق من reCAPTCHA قبل الإرسال.");
            return;
        }
        if (submissionStatus === "idle" || submissionStatus === "error") {
            try {
                const parseResult = reportSchema.safeParse(reportData);
                if (parseResult.success) {
                    submitReport(reportData, setSubmissionStatus);
                    setReportErrors({});
                } else {
                    const fieldErrors: ReportErrors = {};
                    parseResult.error.issues.forEach((err) => {
                        const path = err.path;
                        const fieldName = (typeof path[0] === "string" || typeof path[0] === "number" ? path[0] : undefined) as keyof ReportErrors;
                        if (fieldName !== undefined) {
                            fieldErrors[fieldName] = err.message;
                        }
                    });
                    setReportErrors(fieldErrors);
                }
            } catch{
                toast.error("حدث خطأ غير متوقع أثناء التحقق من صحة البيانات.");
                setSubmissionStatus("error");
            }
        }
    }

    return (
        <div className="sm:my-0 my-6 z-10 lg:w-3/4 md:w-[70%] w-[90%] border-2 border-border bg-offset rounded-xl p-6 lg:p-8 flex flex-col items-end space-y-3">
            <h1 className="text-[20px] md:text-[22px] lg:text-[24px] font-bold">التبليغ اليدوي</h1>
            <p className="text-text-secondary text-[13px] md:text-[14px] lg:text-[16px] text-end">املأ بيانات بلاغك يدويا لتحكم اكثر في تفاصيل و بيانات البلاغ في خطوات بسيطة</p>
            <hr className="border-border w-full mb-6 -mt-1" />
            <div className="flex flex-row-reverse flex-wrap w-full justify-between space-y-4">                    
                <div className="space-y-4 mb-0 flex flex-col items-end lg:w-[49%] w-full">
                    <InputField label="وصف الحادثة" value={reportData.title} onChange={(val) => handleDataChange("title", val)} placeholder="أدخل وصف الحادثة" error={reportErrors.title} />
                    <Dropdown label="نوع البلاغ" options={categories} selectedOption={reportData.category} onSelect={(val) => handleDataChange("category", val)} error={reportErrors.category} />
                    <div className="lg:flex hidden w-full space-y-2 flex-col items-end">
                        <p className="font-semibold text-[12px] md:text-[14px] lg:text-[16px]">إرفاق صور (اختياري)</p>
                        <label className="w-full bg-background border-2 border-border hover:border-border-hover rounded-xl p-10 flex flex-col justify-center items-center text-text-secondary cursor-pointer lg:h-[213px]">
                            <MdOutlineAddPhotoAlternate className="text-[30px] md:text-[35px] lg:text-[40px]" />
                            <p className="text-[12px] md:text-[14px] lg:text-[16px]">إضافة صور</p>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        handleDataChange("media", Array.from(e.target.files));
                                    }
                                }}
                            />
                        </label>
                        {reportData.media.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2 w-full justify-end">
                                {reportData.media.map((file, idx) => (
                                    <span key={idx} className="bg-background border border-border rounded px-2 py-1 text-xs flex gap-2 items-center">
                                        {file.name}
                                        <IoMdClose className="cursor-pointer" onClick={() => {
                                            handleDataChange("media", reportData.media.filter((_, i) => i !== idx));
                                        }} />
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-full lg:w-[49%] flex flex-col space-y-4">
                    <DatePicker value={reportData.date} onChange={(date) => handleDataChange("date", date)} error={reportErrors.date} />
                    <InputField label="موقع الحادثة" value={reportData.address} onChange={(val) => handleDataChange("address", val)} placeholder="أدخل موقع الحادثة" error={reportErrors.address} />
                    <TextArea label="تفاصيل الحادثة" value={reportData.description} onChange={(val) => handleDataChange("description", val)} placeholder="أدخل تفاصيل الحادثة" descriptionRows={descriptionRows} error={reportErrors.description} />
                    <div className="lg:hidden flex w-full space-y-2 flex-col items-end">
                        <p className="font-semibold text-[12px] md:text-[14px] lg:text-[16px]">إرفاق صور (اختياري)</p>
                        <label className="w-full bg-background border-2 border-border hover:border-border-hover rounded-xl p-10 flex flex-col justify-center items-center text-text-secondary cursor-pointer lg:h-[200px]">
                            <MdOutlineAddPhotoAlternate className="text-[30px] md:text-[35px] lg:text-[40px]" />
                            <p className="text-[12px] md:text-[14px] lg:text-[16px]">إضافة صور</p>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        handleDataChange("media", Array.from(e.target.files));
                                    }
                                }}
                            />
                        </label>
                        {reportData.media.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2 w-full justify-end">
                                {reportData.media.map((file, idx) => (
                                    <span key={idx} className="bg-background border border-border rounded px-2 py-1 text-xs flex gap-2 items-center">
                                        {file.name}
                                        <IoMdClose className="cursor-pointer" onClick={() => {
                                            handleDataChange("media", reportData.media.filter((_, i) => i !== idx));
                                        }} />
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ReCAPTCHA
                sitekey={import.meta.env.VITE_CAPTCHA_TOKEN}
                onChange={token => setRecaptchaToken(token || "")}
                hl="ar"
                className="self-center"
            />
            <div className="w-full flex-row-reverse flex justify-center gap-4 items-center">
                <Button buttonText="إرسال البلاغ" onClick={handleSubmit} type="primary" />
                <Button buttonText="الغاء" onClick={() => {handleDataChange("category", categories[0]); handleDataChange("address", ""); handleDataChange("description", ""); handleDataChange("media", []);}} type="danger" />
            </div>
        </div>
    )
}