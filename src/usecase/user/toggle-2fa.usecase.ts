import { IUserRepository } from "../repositories/iuser-repository";

export class Toggle2FAUseCase {
    constructor(private readonly userRepo: IUserRepository) {}

    async execute(userId: string, enabled: boolean): Promise<void> {
        const user = await this.userRepo.findById(userId);
        
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        user.twoFactorEnabled = enabled;
        
        // In a real scenario, we would generate a secret here if enabled is true
        // and user.twoFactorSecret is null.
        if (enabled && !user.twoFactorSecret) {
            user.twoFactorSecret = "MOCKED_SECRET_FOR_PROTOTYPE"; // This would be a real TOTP secret
        }

        await this.userRepo.save(user);
    }
}
