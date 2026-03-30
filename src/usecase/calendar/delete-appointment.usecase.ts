import { IGoogleCalendarService } from "../ports/igoogle-calendar-service";
import { IScheduleRepository } from "../repositories/ischedule-repository";
import { IUserConfigRepository } from "../repositories/iuser-config-repository";

export class DeleteAppointmentUseCase {
    constructor(
        private readonly googleService: IGoogleCalendarService,
        private readonly scheduleRepository: IScheduleRepository,
        private readonly userConfigRepository: IUserConfigRepository
    ) {}

    async execute(id: string, userId: string): Promise<void> {
        const schedule = await this.scheduleRepository.findById(id, userId);
        if (!schedule) {
            return; // Idempotent operacao
        }

        const config = await this.userConfigRepository.findByUserId(userId);
        
        if (!config || !config.googleRefreshToken) {
            throw new Error("Usuário não possui conexão ativa com o Google Calendar.");
        }

        let accessToken = config.googleAccessToken;

        if (this.isTokenExpired(config.googleTokenExpiry)) {
            const tokens = await this.googleService.refreshAccessToken(config.googleRefreshToken);
            
            const newAccessToken = tokens.access_token as string;
            if (!newAccessToken) {
                throw new Error("Falha ao atualizar o token de acesso do Google.");
            }
            
            accessToken = newAccessToken;

            const expiryDate = new Date();
            if (tokens.expires_in) {
                expiryDate.setSeconds(expiryDate.getSeconds() + tokens.expires_in);
            }

            await this.userConfigRepository.update(userId, {
                googleAccessToken: newAccessToken,
                googleTokenExpiry: expiryDate
            });
        }

        if (!accessToken) {
            throw new Error("Token de acesso do Google indisponível.");
        }

        try {
            await this.googleService.deleteEvent(accessToken, schedule.googleEventId);
        } catch (err: any) {
            console.error(`[DeleteAppointmentUseCase] Erro ao deletar no Google: ${err.message}`);
        }

        await this.scheduleRepository.delete(id, userId);
    }

    private isTokenExpired(expiry?: Date): boolean {
        if (!expiry) return true;
        const now = new Date();
        return now.getTime() >= (expiry.getTime() - 300000); // 5 minutes margin
    }
}
