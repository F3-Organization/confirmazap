import { IUserRepository } from "../repositories/iuser-repository";
import * as bcrypt from "bcrypt";
import { ChangePasswordDTO } from "../../../shared/schemas/user.schema";

export class ChangePasswordUseCase {
    constructor(private readonly userRepo: IUserRepository) {}

    async execute(userId: string, data: ChangePasswordDTO): Promise<void> {
        const user = await this.userRepo.findById(userId);
        
        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        if (!user.password) {
            throw new Error("Este usuário não possui uma senha definida (Login via Google). Use a recuperação de senha.");
        }

        const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
        
        if (!isPasswordValid) {
            throw new Error("Senha atual incorreta");
        }

        const hashedNewPassword = await bcrypt.hash(data.newPassword, 10);
        user.password = hashedNewPassword;

        await this.userRepo.save(user);
    }
}
