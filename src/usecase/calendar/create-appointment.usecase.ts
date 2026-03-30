import { IGoogleCalendarService } from "../ports/igoogle-calendar-service";
import { IScheduleRepository } from "../repositories/ischedule-repository";
import { IUserConfigRepository } from "../repositories/iuser-config-repository";
import { Schedule, ScheduleStatus } from "../../infra/database/entities/schedule.entity";

interface CreateAppointmentInput {
    title: string;
    clientName: string;
    clientPhone: string;
    startAt: Date;
    endAt: Date;
    userId: string;
}

export class CreateAppointmentUseCase {
    constructor(
        private readonly googleService: IGoogleCalendarService,
        private readonly scheduleRepository: IScheduleRepository,
        private readonly userConfigRepository: IUserConfigRepository
    ) {}

    async execute(input: CreateAppointmentInput): Promise<Schedule> {
        const config = await this.userConfigRepository.findByUserId(input.userId);
        
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

            await this.userConfigRepository.update(input.userId, {
                googleAccessToken: newAccessToken,
                googleTokenExpiry: expiryDate
            });
        }

        if (!accessToken) {
            throw new Error("Token de acesso do Google indisponível.");
        }

        const description = `Gerado via AgendaOk\nCliente: ${input.clientName}\nTelefone: ${input.clientPhone}`;

        const eventDetails = {
            summary: input.title,
            description: description,
            start: {
                dateTime: input.startAt.toISOString(),
            },
            end: {
                dateTime: input.endAt.toISOString(),
            }
        };

        const googleEvent = await this.googleService.createEvent(accessToken, eventDetails);

        const schedule = new Schedule();
        schedule.googleEventId = googleEvent.id;
        schedule.title = input.title;
        schedule.description = description;
        schedule.startAt = input.startAt;
        schedule.endAt = input.endAt;
        schedule.status = ScheduleStatus.PENDING;
        schedule.userId = input.userId;

        return await this.scheduleRepository.save(schedule);
    }                       

    private isTokenExpired(expiry?: Date): boolean {
        if (!expiry) return true;
        const now = new Date();
        return now.getTime() >= (expiry.getTime() - 300000); // 5 minutes margin
    }
}
