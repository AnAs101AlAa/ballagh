import type { Report } from "../../types/report"

export default function ReportCard({report}: {report: Report}) {
    return (
        <div className="w-[98%] bg-offset border-border border-[1px] rounded-xl p-4 flex flex-col space-y-2 hover:scale-[1.02] duration-200 transition-transform">
            <div className="flex justify-between items-center">
                <p className="font-semibold text-text-primary lg:text-[16px] md:text-[14px] text-[12px]">{report.title}</p>
                <p className="text-text-primary lg:text-[12px] md:text-[11px] text-[10px]">{new Date(report.date).toLocaleDateString("ar-EG")}</p>
            </div>
            <p className="text-text-primary lg:text-[14px] md:text-[13px] text-[11px]">{report.description}</p>
            <div className="flex justify-between items-center mt-2">
                <p className="text-text-secondary lg:text-[12px] md:text-[11px] text-[10px]">
                    الحالة:{" "}
                    <span className={`font-semibold ${
                        report.status === "pending"
                            ? "text-green-500"
                            : report.status === "in progress"
                            ? "text-yellow-500"
                            : "text-red-500"
                    }`}>
                        {report.status === "pending"
                            ? "قيد الانتظار"
                            : report.status === "in progress"
                            ? "قيد التنفيذ"
                            : "مغلق"}
                    </span>
                </p>
                <p className="lg:text-[12px] md:text-[11px] text-[10px]">
                    <span className="text-text-secondary">الموقع:</span>{" "}
                    <span className="text-text-primary">{report.address}</span>
                </p>
            </div>
        </div>
    )
}