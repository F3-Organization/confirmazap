import { FastifyAdapter } from "../adapters/fastfy.adapter";
import { AppController } from "../controller/app.controller";
import { UserRepository } from "../database/repositories/user.repository";

const adapterInstance = new FastifyAdapter();
const userRepository = new UserRepository();

const repositories = {
    user: () => userRepository
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