import { useState, useEffect } from "react";
import Dropdown from "../components/Dropdown";
import { categories } from "../constants/listings";
import Button  from "../components/Button";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import InputField from "../components/InputField";
import DatePicker from "../components/DatePicker";
import type { Report } from "../types/report";

export default function ManualFormPage() {
    const [reportData, setReportData] = useState<Report>({id: "", category: categories[0], address: "", date: "", description: "", media: [], status: "pending", createdAt: "", updatedAt: "", title: ""});
    const [descriptionRows, setDescriptionRows] = useState<number>(20);

    useEffect(() => {
        function updateRows() {
            if (window.innerWidth >= 1024) {
                setDescriptionRows(17);
            } else if (window.innerWidth >= 768) {
                setDescriptionRows(14);
            } else {
                setDescriptionRows(8);
            }
        }
        updateRows();
        window.addEventListener("resize", updateRows);
        return () => window.removeEventListener("resize", updateRows);
    }, []);

    const handleDataChange = (field: keyof Report, value: string | File[]) => {
        setReportData((prev) => ({...prev, [field]: value}));
    }

    return (
        <div className={`min-h-screen w-screen bg-background relative overflow-hidden flex justify-center items-center text-text-primary`}>
            <div className="z-10 lg:w-3/4 md:w-[70%] w-[90%] border-2 border-border bg-offset rounded-xl p-6 lg:p-8 flex flex-col items-end space-y-6">
                <h1 className="text-[22px] md:text-[26px] lg:text-[30px] font-bold">التبليغ اليدوي</h1>
                <p className="text-text-secondary text-[14px] md:text-[16px] lg:text-[18px] text-end">املأ بيانات بلاغك يدويا لتحكم اكثر في تفاصيل و بيانات البلاغ في خطوات بسيطة</p>
                <hr className="border-border w-full mb-6 -mt-4" />
                <div className="flex flex-row-reverse flex-wrap w-full justify-between space-y-8">                    
                    <div className="space-y-6 mb-0 flex flex-col items-end lg:w-[49%] w-full">
                        <InputField label="وصف الحادثة" value={reportData.title} onChange={(val) => handleDataChange("title", val)} placeholder="أدخل وصف الحادثة" />
                        <div className="w-full flex flex-col items-end space-y-2">
                            <p className="font-semibold text-[12px] md:text-[14px] lg:text-[16px]">نوع البلاغ</p>
                            <Dropdown selectedOption={reportData.category} options={categories} onSelect={(value) => handleDataChange("category", value)} />
                        </div>
                        <InputField label="موقع الحادثة" value={reportData.address} onChange={(val) => handleDataChange("address", val)} placeholder="أدخل موقع الحادثة" />
                        <div className="lg:flex hidden w-full space-y-2 flex-col items-end">
                            <p className="font-semibold text-[12px] md:text-[14px] lg:text-[16px]">إرفاق صور (اختياري)</p>
                            <label className="w-full bg-background border-2 border-border hover:border-border-hover rounded-xl p-10 flex flex-col justify-center items-center text-text-secondary cursor-pointer lg:h-[163px]">
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
                    <div className="w-full lg:w-[49%] flex flex-col space-y-6">
                        <DatePicker value={reportData.date} onChange={(date) => handleDataChange("date", date)} />
                        <div className="space-y-2 flex flex-col items-end h-full">
                            <p className="font-semibold text-[12px] md:text-[14px] lg:text-[16px]">تفاصيل البلاغ</p>
                            <textarea dir="rtl" placeholder="أدخل تفاصيل البلاغ" rows={descriptionRows} value={reportData.description} onChange={(e) => handleDataChange("description", e.target.value)} className={`w-full bg-background border-border border-2 hover:border-border-hover focus:outline-none font-medium duration-200 transition-all rounded-xl text-sm px-5 py-2.5 flex`} />
                        </div>
                        <div className="lg:hidden flex w-full space-y-2 flex-col items-end">
                            <p className="font-semibold text-[12px] md:text-[14px] lg:text-[16px]">إرفاق صور (اختياري)</p>
                            <label className="w-full bg-background border-2 border-border hover:border-border-hover rounded-xl p-10 flex flex-col justify-center items-center text-text-secondary cursor-pointer lg:h-[163px]">
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
                <div className="w-full flex-row-reverse flex justify-center gap-4 items-center">
                    <Button buttonText="إرسال البلاغ" onClick={() => {}} type="primary" />
                    <Button buttonText="الغاء" onClick={() => {handleDataChange("category", categories[0]); handleDataChange("address", ""); handleDataChange("description", ""); handleDataChange("media", []);}} type="danger" />
                </div>
            </div>
            <div className={`fixed w-full h-full bottom-0 bg-gradient-to-b -translate-y-[15%] lg:-translate-y-[10%] from-background to-primary from-80% animate-breathe`} />
        </div>
    )
}