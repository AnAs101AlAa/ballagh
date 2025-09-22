export type Report = {
    id: string;
    title: string;
    category: string;
    address: string;
    date: string;
    description: string;
    media: File[];
    status: "pending" | "in progress" | "resolved";
    createdAt: string;
    updatedAt: string;
}

export type ReportErrors = {
    title?: string;
    category?: string;
    address?: string;
    date?: string;
    description?: string;
    media?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type ReportStatus = "idle" | "generating" | "encrypting" | "submitting" | "success" | "error";