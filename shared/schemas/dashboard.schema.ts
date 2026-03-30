import { z } from "zod";

export const DashboardStatsSchema = z.object({
    totalConfirmations: z.number(),
    deliveryRate: z.string(),
    managedReplies: z.number(),
    confirmationsChange: z.string(),
    repliesChange: z.string()
});


export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
