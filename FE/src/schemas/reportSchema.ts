import { z } from "zod";
import { categories } from "../constants/listings";

export const reportSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  description: z.string().min(1, "الوصف مطلوب"),
  date: z
    .string()
    .min(1, "التاريخ مطلوب")
    .refine(
      (val) => {
        const inputDate = new Date(val);
        const now = new Date();
        // Remove time part for comparison if needed
        return inputDate <= now;
      },
      { message: "لا يمكن أن يكون التاريخ في المستقبل" }
    ),
  address: z.string().min(1, "الموقع مطلوب"),
  category: z.enum(categories as [string, ...string[]], {
    errorMap: () => ({ message: "يرجى اختيار تصنيف صحيح" }),
  }),
});