import { IEvolutionService, EvolutionConnectResponse } from "../ports/ievolution-service";
import { IUserConfigRepository } from "../repositories/iuser-config-repository";
import { env } from "../../infra/config/configs";

export class ConnectWhatsappUseCase {
    constructor(
        private readonly userConfigRepository: IUserConfigRepository,
        private readonly evolutionService: IEvolutionService
    ) { }

    async execute(userId: string): Promise<EvolutionConnectResponse> {
        const config = await this.userConfigRepository.findByUserId(userId);
        if (!config) {
            throw new Error("User configuration not found");
        }

        const instanceName = `agent_${userId.replace(/-/g, "").substring(0, 10)}`;

        try {
            await this.evolutionService.createInstance(instanceName);
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
        }

        const protocol = env.isProduction() ? "https" : "http";
        const host = env.domain;
        const port = env.isProduction() ? "" : `:${env.port}`;
        const webhookUrl = `${protocol}://${host}${port}/api/webhook/evolution`;

        await this.evolutionService.setWebhook(instanceName, webhookUrl);

        await this.userConfigRepository.update(userId, {
            whatsappInstanceName: instanceName
        });

        return await this.evolutionService.connectInstance(instanceName);
    }
}
