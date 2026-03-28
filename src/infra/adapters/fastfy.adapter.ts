import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, HTTPMethods } from 'fastify'
import { env } from '../config/configs'

export class FastifyAdapter {
    private app: FastifyInstance;

    public constructor() {
        this.app = Fastify({
            logger: true,
        })
    }

    public addRoute(
        method: HTTPMethods | HTTPMethods[],
        path: string,
        handler: (request: FastifyRequest, reply: FastifyReply) => void, schema?: any
    ) {
        this.app.route({
            method: method,
            url: `/api${path}`,
            handler: handler,
            schema: schema
        });
    }

    public listen() {
        this.app.listen({
            port: env.port as number,
        })
    }

}