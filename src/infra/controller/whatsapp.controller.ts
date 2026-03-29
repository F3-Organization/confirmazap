import { FastifyAdapter } from "../adapters/fastfy.adapter";
import { ConnectWhatsappUseCase } from "../../usecase/notification/connect-whatsapp.usecase";
import { DisconnectWhatsappUseCase } from "../../usecase/notification/disconnect-whatsapp.usecase";

export class WhatsappController {
    constructor(
        private readonly fastify: FastifyAdapter,
        private readonly connectUseCase: ConnectWhatsappUseCase,
        private readonly disconnectUseCase: DisconnectWhatsappUseCase,
        private readonly subMiddleware?: any,
        private readonly adminMiddleware?: any
    ) {
        this.registerRoutes();
    }

    private registerRoutes() {
        const connectMiddlewares = [];
        if (this.adminMiddleware) connectMiddlewares.push(this.adminMiddleware);
        if (this.subMiddleware) connectMiddlewares.push(this.subMiddleware);

        this.fastify.addProtectedRoute("POST", "/whatsapp/connect", async (request, reply) => {
            const userId = (request.user as { id: string }).id;
            
            try {
                const qr = await this.connectUseCase.execute(userId);
                return reply.send(qr);
            } catch (error: any) {
                return reply.code(error.status || 500).send({ 
                    error: "Erro de Conexão", 
                    message: "Não foi possível gerar o QR Code. Tente novamente mais tarde." 
                });
            }
        }, {
            tags: ["WhatsApp"],
            summary: "Gera um QR Code para conexão do WhatsApp",
            description: "Cria ou recupera uma instância na Evolution API e retorna o QR Code em Base64 para pareamento."
        }, connectMiddlewares);

        this.fastify.addProtectedRoute("DELETE", "/whatsapp/disconnect", async (request, reply) => {
            const userId = (request.user as { id: string }).id;
            
            try {
                await this.disconnectUseCase.execute(userId);
                return reply.send({ status: "success", message: "WhatsApp desconectado com sucesso." });
            } catch (error: any) {
                return reply.code(500).send({ 
                    error: "Erro de Desconexão", 
                    message: "Houve um erro ao tentar desconectar o WhatsApp." 
                });
            }
        }, {
            tags: ["WhatsApp"],
            summary: "Remove a conexão do WhatsApp",
            description: "Finaliza a sessão do WhatsApp e remove a instância vinculada ao usuário."
        }, this.adminMiddleware);
    }
}
