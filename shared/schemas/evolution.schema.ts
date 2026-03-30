import { z } from "zod";

export const EvolutionWebhookSchema = z.object({
    event: z.enum(['messages.upsert', 'messages.update', 'connection.update', 'qrcode.updated']),
    instance: z.string(),
    data: z.object({
        key: z.object({
            remoteJid: z.string(),
            fromMe: z.boolean(),
            id: z.string()
        }).optional(),
        pushName: z.string().nullable().optional(),
        message: z.any().optional()
    }).passthrough(),
    apikey: z.string().optional()
}).passthrough();

export type EvolutionWebhookPayload = z.infer<typeof EvolutionWebhookSchema>;
