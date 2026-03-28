import { FastifyAdapter } from "../adapters/fastfy.adapter";
import { SyncCalendarQueue } from "../queue/sync-calendar.queue";
import { NotifyQueue } from "../queue/notify.queue";

export class CalendarController {
    // ID fixo para testes
    private static readonly TEST_USER_ID = "00000000-0000-0000-0000-000000000001";

    constructor(
        private readonly fastify: FastifyAdapter,
        private readonly syncQueue: SyncCalendarQueue,
        private readonly notifyQueue: NotifyQueue
    ) {
        this.registerRoutes();
    }

    private registerRoutes() {
        this.fastify.addRoute("POST", "/calendar/sync", async (request, reply) => {
            try {
                await this.syncQueue.addSyncJob(CalendarController.TEST_USER_ID);
                reply.send({ message: "Sincronização agendada com sucesso!", userId: CalendarController.TEST_USER_ID });
            } catch (error: any) {
                reply.code(500).send({ error: "Erro ao agendar sincronização", message: error.message });
            }
        });

        this.fastify.addRoute("POST", "/calendar/notify", async (request, reply) => {
            try {
                await this.notifyQueue.addNotificationJob(CalendarController.TEST_USER_ID);
                reply.send({ message: "Varridura de notificações agendada!", userId: CalendarController.TEST_USER_ID });
            } catch (error: any) {
                reply.code(500).send({ error: "Erro ao agendar notificações", message: error.message });
            }
        });
    }
}
