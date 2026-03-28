import { Client } from "../../infra/database/entities/client.entity";

export interface IClientRepository {
    save(client: Client): Promise<Client>;
    findById(id: string): Promise<Client | null>;
    findByUserId(userId: string): Promise<Client[]>;
    findByNameOrEmail(userId: string, term: string): Promise<Client | null>;
}
