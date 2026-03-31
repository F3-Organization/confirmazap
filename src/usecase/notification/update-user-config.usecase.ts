import { env } from "../../infra/config/configs";
import { IEvolutionService } from "../ports/ievolution-service";
import { IUserConfigRepository } from "../repositories/iuser-config-repository";
import { AppError } from "../../shared/errors/app-error";

export interface UpdateUserConfigInput {
    whatsappNumber?: string;
    syncEnabled?: boolean;
    silentWindowStart?: string;
    silentWindowEnd?: string;
}

export class UpdateUserConfigUseCase {
    constructor(
        private readonly userConfigRepo: IUserConfigRepository,
        private readonly evolutionService: IEvolutionService
    ) {}

    async execute(userId: string, data: UpdateUserConfigInput): Promise<void> {
        if (!userId) {
            throw new AppError("User ID is required", 400);
        }

        if (data.whatsappNumber) {
            data.whatsappNumber = this.normalizeNumber(data.whatsappNumber);
        }

        let config = await this.userConfigRepo.findByUserId(userId);
        
        if (!config) {
            config = await this.userConfigRepo.save({
                userId,
                ...data
            } as any);
        } else {
            await this.userConfigRepo.update(userId, data);
        }

        if (data.whatsappNumber && config) {
            try {
                const introMessage = `🔔 *Ativação ConfirmaZap*\n\n` +
                    `Olá! Para concluir seu vínculo com o sistema e receber alertas de agendamentos e cancelamentos por aqui, precisamos validar sua conta.\n\n` +
                    `👉 *Copie e envie a próxima mensagem abaixo neste chat:*`;

                const codeMessage = `Ref: ${config.id}`;
                const targetNumber = `55${data.whatsappNumber}`;

                await this.evolutionService.sendText(
                    env.evolution.systemBotInstance, 
                    targetNumber, 
                    introMessage
                );

                await this.evolutionService.sendText(
                    env.evolution.systemBotInstance, 
                    targetNumber, 
                    codeMessage
                );
            } catch (error: unknown) {
                // We don't throw here to avoid failing the update if the message fails
                // but we should ideally use a logger instead of console.error
            }
        }
    }

    private normalizeNumber(number: string): string {
        return number.replace(/\D/g, "").replace(/^55/, "");
    }
}
