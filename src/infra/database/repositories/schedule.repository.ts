import { Repository, Between } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { Schedule, ScheduleStatus } from "../entities/schedule.entity";
import { IScheduleRepository } from "../../../usecase/repositories/ischedule-repository";

export class ScheduleRepository implements IScheduleRepository {
    private repository: Repository<Schedule>;

    constructor() {
        this.repository = AppDataSource.getRepository(Schedule);
    }

    async save(schedule: Schedule): Promise<Schedule> {
        return await this.repository.save(schedule);
    }

    async findByGoogleEventId(googleEventId: string): Promise<Schedule | null> {
        return await this.repository.findOneBy({ googleEventId });
    }

    async findByUserId(userId: string): Promise<Schedule[]> {
        return await this.repository.find({ where: { userId } });
    }

    async findNextToNotify(userId: string, startRange: Date, endRange: Date): Promise<Schedule[]> {
        return await this.repository.find({
            where: {
                userId,
                startAt: Between(startRange, endRange),
                status: ScheduleStatus.PENDING,
            },
        });
    }

    async updateStatus(id: string, status: ScheduleStatus): Promise<void> {
        await this.repository.update(id, { status });
    }
}
