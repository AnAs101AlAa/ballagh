export type Report = {
    id: string;
    title: string;
    category: string;
    address: string;
    date: string;
    description: string;
    media: File[];
    status: "pending" | "in_progress" | "resolved";
    createdAt: string;
    updatedAt: string;
}