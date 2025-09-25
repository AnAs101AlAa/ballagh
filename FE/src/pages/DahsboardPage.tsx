import Dropdown from "../components/Dropdown"
import { categories } from "../constants/listings"
import { useState, useEffect } from "react"
import SearchField from "../components/SearchField"
import { fetchReports } from "../services/UserData"
import type { Report } from "../types/report"
import ReportCard from "../components/dahsboard/ReportCard"

export default function DashboardPage() {
    const [selectedCategory, setSelectedCategory] = useState(categories[0])
    const [searchTerm, setSearchTerm] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [reports, setReports] = useState<Report[]>([])

    useEffect(() => {
        if(isLoading) return

        const loadReports = async () => {
            try {
                const reports = await fetchReports()
                setReports(reports)
                console.log(reports)
            } catch (error) {
                console.error("Error fetching reports:", error)
            } finally {
                setIsLoading(false)
            }
        }

        loadReports()
    }, [])

    return (
        <div className={`min-h-screen w-screen bg-background relative overflow-hidden flex items-center justify-center`}>
            <div className="flex flex-col items-center z-10 h-screen p-4 py-8 space-y-4 lg:w-1/2 md:w-2/3 w-full">
                <p className="lg:text-[34px] md:text-[30px] text-[26px] text-text-primary mb-2 md:mb-4">قائمة البلاغات</p>
                <p className="lg:text-[18px] md:text-[16px] text-[14px] text-text-secondary mb-8">إدارة البلاغات والتقارير</p>
                <div className="w-full md:flex-row flex flex-col items-center gap-3">
                    <div className="md:w-[67%] w-full">
                        <SearchField value={searchTerm} onChange={(val) => setSearchTerm(val)} placeholder="ابحث في البلاغات..." />
                    </div>
                    <div className="md:w-[33%] w-full">
                        <Dropdown options={categories} onSelect={(option) => setSelectedCategory(option)} selectedOption={selectedCategory}/>
                    </div>
                </div>
                <hr className="w-full border-text-primary"/>
                <div className="w-full h-full overflow-y-auto flex flex-col gap-4 py-2">
                    {isLoading ? (
                        <p className="text-text-secondary">جاري تحميل البلاغات...</p>
                    ) : (
                        reports.map((report) => <ReportCard key={report.id} report={report} />)
                    )}
                </div>
            </div>
            <div className={`fixed w-full h-full bottom-0 bg-gradient-to-b -translate-y-[15%] lg:-translate-y-[10%] from-background to-primary from-80% animate-breathe`} />
        </div>
    )
}