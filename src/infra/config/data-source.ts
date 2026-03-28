import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./configs";
import { User } from "../database/entities/user.entity";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: env.database.host,
    port: env.database.port,
    username: env.database.user,
    password: env.database.password,
    database: env.database.database,
    synchronize: env.debug(),
    logging: true,
    entities: [User],
    subscribers: [],
    migrations: [],
})
