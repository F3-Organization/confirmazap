import Fastify, { FastifyInstance, FastifyReply, FastifyRequest, HTTPMethods } from 'fastify'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
// @ts-ignore - Types installed during docker build
import fastifyCors from '@fastify/cors'
// @ts-ignore - Types installed during docker build
import fastifyHelmet from '@fastify/helmet'
// @ts-ignore - Types installed during docker build
import fastifyRateLimit from '@fastify/rate-limit'
import { env } from '../config/configs'

export class FastifyAdapter {
    private app: FastifyInstance;

    public constructor() {
        this.app = Fastify({
            logger: {
                level: env.logLevel
            },
            ajv: {
                customOptions: {
                    keywords: ['example']
                }
            }
        })
    }

    public async setup() {
        // ── Segurança ──────────────────────────────────────────
        await this.app.register(fastifyCors, {
            origin: env.isProduction()
                ? [`https://${env.domain}`]
                : true,
            credentials: true
        });

        await this.app.register(fastifyHelmet, {
            contentSecurityPolicy: false // Desativado para permitir Swagger UI
        });

        await this.app.register(fastifyRateLimit, {
            max: 100,
            timeWindow: '1 minute',
            allowList: ['127.0.0.1'] // Localhost para health checks
        });

        // ── Documentação ───────────────────────────────────────
        await this.app.register(fastifySwagger, {
            mode: 'dynamic',
            openapi: {
                openapi: '3.0.0',
                info: {
                    title: 'AgendaOk API',
                    description: 'Solução SaaS pragmática para automação de agendamentos e notificações via WhatsApp integrando Google Calendar e Evolution API.',
                    version: '1.0.0',
                    contact: {
                        name: 'Suporte AgendaOk',
                        email: 'suporte@agendaok.com.br',
                        url: 'https://agendaok.com.br/contato'
                    },
                    license: {
                        name: 'MIT',
                        url: 'https://opensource.org/licenses/MIT'
                    }
                },
                externalDocs: {
                    description: 'Documentação Técnica Completa',
                    url: 'https://docs.agendaok.com.br'
                },
                servers: [
                    { 
                        url: env.isProduction() 
                            ? `https://${env.domain}` 
                            : `http://localhost:${env.port}`,
                        description: env.isProduction() 
                            ? 'Servidor de Produção' 
                            : 'Servidor de Desenvolvimento Local'
                    }
                ],
                tags: [
                    { name: 'Auth', description: 'Gerenciamento de autenticação via Google OAuth2' },
                    { name: 'Calendar', description: 'Operações de sincronização e tarefas de calendário' },
                    { name: 'Webhook', description: 'Receptores de eventos assíncronos (Evolution API)' },
                    { name: 'System', description: 'Monitoramento e status operacional' }
                ]
            }
        })

        await this.app.register(fastifySwaggerUi, {
            routePrefix: '/api/documentation',
            uiConfig: {
                docExpansion: 'list',
                deepLinking: false
            },
            staticCSP: true,
            transformStaticCSP: (header) => header
        })

        // ── Error Handler Global ───────────────────────────────
        this.app.setErrorHandler((error: any, request, reply) => {
            const statusCode = error.statusCode || 500;

            request.log.error({
                err: error,
                req: { method: request.method, url: request.url }
            });

            reply.code(statusCode).send({
                error: statusCode >= 500 ? 'Erro interno do servidor' : error.message,
                statusCode,
                ...(env.debug() && { stack: error.stack })
            });
        });

        await this.app.after();
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
            host: '0.0.0.0'
        })
    }

}