import { IScheduleRepository } from "../repositories/ischedule-repository";
import { Schedule } from "../../infra/database/entities/schedule.entity";

export class GetAppointmentsUseCase {
    constructor(private readonly scheduleRepo: IScheduleRepository) {}

    async execute(userId: string): Promise<Schedule[]> {
        return await this.scheduleRepo.findByUserId(userId);
    }
}
