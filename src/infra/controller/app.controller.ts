import { FastifyAdapter } from "../adapters/fastfy.adapter";

export class AppController {
    public constructor(private readonly fastify: FastifyAdapter) {
        this.registerRoutes();
    }

    private registerRoutes() {
        this.fastify.addRoute('GET', '/health', async (request, reply) => {
            reply.send({ status: 'ok', timestamp: new Date().toISOString() });
        });
    }
}