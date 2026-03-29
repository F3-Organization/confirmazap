import { IEvolutionService } from "../ports/ievolution-service";
import { IUserConfigRepository } from "../repositories/iuser-config-repository";

export class DisconnectWhatsappUseCase {
    constructor(
        private readonly userConfigRepository: IUserConfigRepository,
        private readonly evolutionService: IEvolutionService
    ) {}

    async execute(userId: string): Promise<void> {
        const config = await this.userConfigRepository.findByUserId(userId);
        
        if (!config || !config.whatsappInstanceName) {
            return;
        }

        const instanceName = config.whatsappInstanceName;

        try {
            await this.evolutionService.logoutInstance(instanceName).catch(() => {});
            await this.evolutionService.deleteInstance(instanceName).catch(() => {});
        } catch (error) {
        }

        await this.userConfigRepository.update(userId, {
            whatsappInstanceName: null as unknown as string 
        });
    }
}
