import { useState } from "react";
import FormCard from "../components/manualForm/formCard";
import type { Report, ReportStatus } from "../types/report";
import { categories } from "../constants/listings";
import SubmissionCard from "../components/manualForm/SubmissionCard";
export default function ManualFormPage() {
    const [reportData, setReportData] = useState<Report>({id: "", category: categories[0], address: "", date: "", description: "", media: [], status: "pending", createdAt: "", updatedAt: "", title: ""});
    const [submissionStatus, setSubmissionStatus] = useState<ReportStatus>("idle");

    return (
        <div className={`min-h-screen w-screen bg-background relative overflow-hidden flex justify-center items-center text-text-primary`}>
            {submissionStatus === "idle" && (<FormCard reportData={reportData} submissionStatus={submissionStatus} setReportData={setReportData} setSubmissionStatus={setSubmissionStatus} />)}
            {submissionStatus !== "idle" && (<SubmissionCard submissionStatus={submissionStatus} />)}
            <div className={`fixed w-full h-full bottom-0 bg-gradient-to-b -translate-y-[15%] lg:-translate-y-[10%] from-background to-primary from-80% animate-breathe`} />
        </div>
    )
}