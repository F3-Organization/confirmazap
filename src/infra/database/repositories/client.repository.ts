import { Repository } from "typeorm";
import { AppDataSource } from "../../config/data-source";
import { Client } from "../entities/client.entity";
import { IClientRepository } from "../../../usecase/repositories/iclient-repository";

export class ClientRepository implements IClientRepository {
    private repository: Repository<Client>;

    constructor() {
        this.repository = AppDataSource.getRepository(Client);
    }

    async save(client: Client): Promise<Client> {
        return await this.repository.save(client);
    }

    async findById(id: string, userId: string): Promise<Client | null> {
        return await this.repository.findOne({ where: { id, userId } });
    }

    async findByUserId(userId: string): Promise<Client[]> {
        return await this.repository.find({ where: { userId } });
    }

    async findByNameOrEmail(userId: string, term: string): Promise<Client | null> {
        return await this.repository.findOne({
            where: [
                { userId, name: term },
                { userId, email: term },
            ],
        });
    }
}
