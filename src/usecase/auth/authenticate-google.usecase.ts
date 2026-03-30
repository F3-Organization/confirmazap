import { IGoogleCalendarService } from "../ports/igoogle-calendar-service";
import { IUserRepository } from "../repositories/iuser-repository";
import { User } from "../../infra/database/entities/user.entity";
import { ExchangeGoogleCodeUseCase } from "./exchange-google-code.usecase";

export class AuthenticateGoogleUseCase {
    constructor(
        private readonly googleService: IGoogleCalendarService,
        private readonly userRepo: IUserRepository,
        private readonly exchangeCode: ExchangeGoogleCodeUseCase
    ) {}

    async execute(code: string): Promise<{ user: User, tokens: any }> {
        const tokens = await this.googleService.getTokens(code);
        const profile = await this.googleService.getUserProfile(tokens.access_token);

        let user = await this.userRepo.findByGoogleId(profile.id);
        
        if (!user) {
            // Check if user exists with same email (maybe they registered normally before)
            user = await this.userRepo.findByEmail(profile.email);
            
            if (!user) {
                user = new User();
                user.email = profile.email;
                user.name = profile.name;
            }
            
            user.googleId = profile.id;
            user = await this.userRepo.save(user);
        }

        // Save/Update tokens via ExchangeGoogleCodeUseCase
        await this.exchangeCode.execute(user.id, tokens);

        return { user, tokens };
    }
}
