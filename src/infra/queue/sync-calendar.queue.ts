import { Queue } from "bullmq";
import { env } from "../config/configs";

export class SyncCalendarQueue {
    private queue: Queue;

    constructor() {
        this.queue = new Queue("sync-calendar", {
            connection: {
                host: env.redis.host,
                port: env.redis.port,
                password: env.redis.password
            }
        });
    }

    async addSyncJob(userId: string): Promise<void> {
        await this.queue.add(
            `sync-${userId}`,
            { userId },
            {
                removeOnComplete: true,
                attempts: 3,
                backoff: { type: "exponential", delay: 1000 }
            }
        );
    }
}
