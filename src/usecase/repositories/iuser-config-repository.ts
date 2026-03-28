import { UserConfig } from "../../infra/database/entities/user-config.entity";

export interface IUserConfigRepository {
    save(config: UserConfig): Promise<UserConfig>;
    findByUserId(userId: string): Promise<UserConfig | null>;
    update(userId: string, data: Partial<UserConfig>): Promise<void>;
}
