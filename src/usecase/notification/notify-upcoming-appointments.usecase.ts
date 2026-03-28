import { IEvolutionService } from "../ports/ievolution-service";
import { IScheduleRepository } from "../repositories/ischedule-repository";
import { IUserConfigRepository } from "../repositories/iuser-config-repository";

export class NotifyUpcomingAppointmentsUseCase {
    constructor(
        private readonly scheduleRepository: IScheduleRepository,
        private readonly userConfigRepository: IUserConfigRepository,
        private readonly evolutionService: IEvolutionService
    ) {}

    async execute(userId: string): Promise<void> {
        const config = await this.userConfigRepository.findByUserId(userId);
        if (!config || !config.whatsappInstanceName) {
            return;
        }

        const now = new Date();
        const next24h = new Date();
        next24h.setHours(now.getHours() + 24);

        const appointments = await this.scheduleRepository.findNextToNotify(userId, now, next24h);

        for (const appointment of appointments) {
            const phoneNumber = this.extractPhoneNumber(`${appointment.title} ${appointment.description || ""}`);
            
            if (phoneNumber) {
                const message = `Olá! Você tem um agendamento para "${appointment.title}" amanhã às ${appointment.startAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}. Podemos confirmar?`;
                
                try {
                    await this.evolutionService.sendText(config.whatsappInstanceName, phoneNumber, message);
                    await this.scheduleRepository.updateNotified(appointment.id, true);
                } catch (error) {
                    console.error(`[NotifyUseCase] Failed to send notification for appointment ${appointment.id}:`, error);
                }
            }
        }
    }

    private extractPhoneNumber(text: string): string | null {
        const regex = /(?:(?:\+|00)55\s?)?(?:\(?([1-9][0-9])\)?\s?)?(?:((?:9\d|[2-9])\d{3})\-?(\d{4}))/g;
        const match = regex.exec(text);

        if (match) {
            const ddd = match[1] || "11";
            const part1 = match[2];
            const part2 = match[3];
            return `55${ddd}${part1}${part2}`;
        }

        return null;
    }
}
