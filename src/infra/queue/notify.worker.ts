import { Worker, Job } from "bullmq";
import { env } from "../config/configs";
import { NotifyUpcomingAppointmentsUseCase } from "../../usecase/notification/notify-upcoming-appointments.usecase";
import { IUserConfigRepository } from "../../usecase/repositories/iuser-config-repository";

export class NotifyWorker {
    private worker: Worker;

    constructor(
        private readonly notifyUseCase: NotifyUpcomingAppointmentsUseCase,
        private readonly userConfigRepository: IUserConfigRepository
    ) {
        this.worker = new Worker(
            "notifications",
            async (job: Job) => {
                if (job.name === "check-upcoming-appointments") {
                    await this.handleGlobalCheck();
                    return;
                }

                const { userId } = job.data;
                await this.notifyUseCase.execute(userId);
            },
            {
                connection: {
                    host: env.redis.host,
                    port: env.redis.port,
                    password: env.redis.password
                }
            }
        );

        this.worker.on("completed", (job: Job) => {
            console.log(`[NotifyWorker] Job ${job.name} (${job.id}) completed`);
        });

        this.worker.on("failed", (job: Job | undefined, err: Error) => {
            console.error(`[NotifyWorker] Job ${job?.name} (${job?.id}) failed: ${err.message}`);
        });
    }

    private async handleGlobalCheck() {
        const activeConfigs = await this.userConfigRepository.findAllActive();
        for (const config of activeConfigs) {
            await this.notifyUseCase.execute(config.userId);
        }
    }
}
