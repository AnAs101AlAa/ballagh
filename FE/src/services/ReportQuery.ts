import type { SetStateAction, Dispatch } from "react";
import type { Report } from "../types/report"
import { initSodium, createEphemeralKP, encryptForServer, fetchServerPubKey } from "../utils/cryptoClient";
import { fileToBase64WithMime } from "../utils/formaters";
import type { ReportStatus } from "../types/report";
import axios from "axios";
import toast from "react-hot-toast";

const submitReport = async (reportData: Report, setStage: Dispatch<SetStateAction<ReportStatus>>) => {
    try {
        await initSodium();

        const clientKP = createEphemeralKP();

        const serverPub = await fetchServerPubKey();

        setStage("encrypting");
        await new Promise((r) => setTimeout(r, 3000));

        const payload = { report: reportData };
        let encodedFiles: { data: string; mime: string }[] = [];
        if (reportData.media && reportData.media.length > 0) {
            encodedFiles = await Promise.all(reportData.media.map(fileToBase64WithMime));
        }

        const envelope = await encryptForServer({ report: { ...payload.report, media: encodedFiles } }, clientKP, serverPub);

        setStage("submitting");
        await new Promise((r) => setTimeout(r, 3000));

        axios.post("https://ballagh-production.up.railway.app/api/submit-report", envelope, {
            headers: { "Content-Type": "application/json" },
        }).then(() => {
            setStage("success");
        }).catch(() => {
            toast.error("حدث خطأ غير متوقع اثناء إرسال البلاغ, يرجى المحاولة مرة أخرى");
            setStage("error");
        });

    } catch {
        toast.error("حدث خطأ غير متوقع اثناء إرسال البلاغ, يرجى المحاولة مرة أخرى");
        setStage("error");
    }
}

export default submitReport;