import { FastifyAdapter } from "../adapters/fastfy.adapter";
import { AppController } from "../controller/app.controller";
import { UserRepository } from "../database/repositories/user.repository";
import { ClientRepository } from "../database/repositories/client.repository";
import { ScheduleRepository } from "../database/repositories/schedule.repository";
import { UserConfigRepository } from "../database/repositories/user-config.repository";

const adapterInstance = new FastifyAdapter();
const userRepository = new UserRepository();
const clientRepository = new ClientRepository();
const scheduleRepository = new ScheduleRepository();
const userConfigRepository = new UserConfigRepository();

const repositories = {
    user: () => userRepository,
    client: () => clientRepository,
    schedule: () => scheduleRepository,
    userConfig: () => userConfigRepository
}

const adapters = {
    fastify: () => adapterInstance
}

const controllers = {
    app: () => new AppController(adapterInstance)
}

export const factory = {
    adapters: adapters,
    repositories: repositories,
    controller: controllers
}