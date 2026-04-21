import { IEvolutionService, EvolutionConnectResponse } from "../ports/ievolution-service";
import { ICompanyConfigRepository } from "../repositories/icompany-config-repository";
import { env } from "../../infra/config/configs";
import { encrypt } from "../../shared/utils/cryptography";

export class ConnectWhatsappUseCase {
    constructor(
        private readonly companyConfigRepository: ICompanyConfigRepository,
        private readonly evolutionService: IEvolutionService
    ) { }

    async execute(companyId: string): Promise<EvolutionConnectResponse> {
        const config = await this.companyConfigRepository.findByCompanyId(companyId);
        if (!config) {
            throw new Error("User configuration not found");
        }

        const instanceName = `agent_${companyId.replace(/-/g, "").substring(0, 10)}`;

        let instanceToken: string | undefined;
        try {
            const instanceResponse = await this.evolutionService.createInstance(instanceName);
            instanceToken = instanceResponse.hash?.apikey;
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
        }

        const webhookUrl = env.evolution.webhookUrl;

        await this.evolutionService.setWebhook(instanceName, webhookUrl);

        const updateData: Record<string, unknown> = {
            whatsappInstanceName: instanceName
        };
        if (instanceToken) {
            updateData.whatsappInstanceToken = encrypt(instanceToken);
        }

        await this.companyConfigRepository.updateByCompanyId(companyId, updateData);

        return await this.evolutionService.connectInstance(instanceName);
    }
}
