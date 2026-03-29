import { IGoogleCalendarService } from "../ports/igoogle-calendar-service";
import { IUserConfigRepository } from "../repositories/iuser-config-repository";
import { UserConfig } from "../../infra/database/entities/user-config.entity";

export class ExchangeGoogleCodeUseCase {
    constructor(
        private readonly googleService: IGoogleCalendarService,
        private readonly userConfigRepository: IUserConfigRepository
    ) {}

    async execute(userId: string, tokens: any): Promise<void> {
        const expiryDate = new Date();
        if (tokens.expires_in) {
            expiryDate.setSeconds(expiryDate.getSeconds() + tokens.expires_in);
        }

        let config = await this.userConfigRepository.findByUserId(userId);

        if (!config) {
            config = new UserConfig();
            config.userId = userId;
        }

        config.googleAccessToken = tokens.access_token;
        
        if (tokens.refresh_token) {
            config.googleRefreshToken = tokens.refresh_token;
        }
        
        config.googleTokenExpiry = expiryDate;
        config.syncEnabled = true;

        await this.userConfigRepository.save(config);
    }
}
