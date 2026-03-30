import { FastifyReply, FastifyRequest } from "fastify";
import { FastifyAdapter } from "../adapters/fastfy.adapter";
import { GenerateGoogleAuthUrlUseCase } from "../../usecase/auth/generate-google-auth-url.usecase";
import { AuthenticateGoogleUseCase } from "../../usecase/auth/authenticate-google.usecase";
import { RegisterUserUseCase } from "../../usecase/auth/register-user.usecase";
import { LoginUseCase } from "../../usecase/auth/login.usecase";
import { SendEmailVerificationUseCase } from "../../usecase/auth/send-email-verification.usecase";
import { VerifyEmailSetPasswordUseCase } from "../../usecase/auth/verify-email-set-password.usecase";
import { AuthUserPayload } from "../types/auth.types";
import { z } from "zod";
import { 
    LoginInputSchema, 
    RegisterInputSchema, 
    VerifyRegistrationInputSchema 
} from "../../../shared/schemas/auth.schema";

export class AuthController {
    constructor(
        private readonly fastify: FastifyAdapter,
        private readonly generateAuthUrl: GenerateGoogleAuthUrlUseCase,
        private readonly authenticateGoogle: AuthenticateGoogleUseCase,
        private readonly registerUser: RegisterUserUseCase,
        private readonly login: LoginUseCase,
        private readonly sendEmailVerification: SendEmailVerificationUseCase,
        private readonly verifyEmailSetPassword: VerifyEmailSetPasswordUseCase
    ) {
        this.fastify.logInfo("[AuthController] Initializing...");
        this.registerRoutes();
    }

    private registerRoutes() {
        this.fastify.addRoute("GET", "/auth/google", async (request: FastifyRequest, reply: FastifyReply) => {
            const url = this.generateAuthUrl.execute();
            reply.redirect(url);
        }, {
            tags: ["Auth"],
            summary: "Starts the Google authentication flow",
            description: "Redirects the user to the Google OAuth2 consent page.",
            response: {
                302: {
                    type: "object",
                    description: "Redirect to Google"
                }
            }
        });

        this.fastify.addRoute("GET", "/auth/google/callback", async (request: FastifyRequest, reply: FastifyReply) => {
            const callbackSchema = z.object({
                code: z.string().min(1)
            });

            const parseResult = callbackSchema.safeParse(request.query);

            if (!parseResult.success) {
                return reply.code(400).send({
                    error: "Invalid request",
                    details: parseResult.error.format()
                });
            }

            const { code } = parseResult.data;

            try {
                const { user } = await this.authenticateGoogle.execute(code);

                const token = this.fastify.sign({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                });

                reply.send({
                    message: "Authentication successful!",
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            } catch (error: any) {
                this.fastify.logInfo("[AuthController] Authentication failed:", { error: error.message });
                reply.code(500).send({
                    error: "Authentication failure",
                    message: error.message
                });
            }
        }, {
            tags: ["Auth"],
            summary: "Google authentication callback",
            description: "Receives the code from Google, creates/finds the user, saves tokens, and returns a JWT.",
            querystring: {
                type: "object",
                required: ["code"],
                properties: {
                    code: { type: "string" }
                }
            }
        });

        this.fastify.addProtectedRoute("GET", "/auth/me", async (request: FastifyRequest, reply: FastifyReply) => {
            const user = request.user as AuthUserPayload;
            
            reply.send({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        }, {
            tags: ["Auth"],
            summary: "Obtém dados do usuário autenticado"
        });

        this.fastify.addRoute("POST", "/auth/register", async (request: FastifyRequest, reply: FastifyReply) => {
            const parseResult = RegisterInputSchema.safeParse(request.body);
            if (!parseResult.success) {
                return reply.code(400).send({ error: "Validation failed", details: parseResult.error.format() });
            }

            const { name, email, password } = parseResult.data;

            try {
                const user = await this.registerUser.execute({ name, email, password });

                const token = this.fastify.sign({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                });

                reply.send({
                    message: "Registration successful",
                    token,
                    user: { id: user.id, name: user.name, email: user.email, role: user.role }
                });
            } catch (error: any) {
                if (error.message === "User already exists") {
                    // Try to send verification email for users without password (Google-only users)
                    try {
                        await this.sendEmailVerification.execute(email);
                        return reply.send({
                            status: "PENDING_VERIFICATION",
                            message: "Email verification code sent. Please verify your email to set a password."
                        });
                    } catch (mailError: any) {
                        return reply.code(500).send({ error: "Failed to send verification email", message: mailError.message });
                    }
                }
                return reply.code(400).send({ error: "Registration failed", message: error.message });
            }
        }, {
            tags: ["Auth"],
            summary: "Registers a new user or starts verification for existing Google users"
        });

        this.fastify.addRoute("POST", "/auth/register/verify", async (request: FastifyRequest, reply: FastifyReply) => {
            const parseResult = VerifyRegistrationInputSchema.safeParse(request.body);
            if (!parseResult.success) {
                return reply.code(400).send({ error: "Validation failed", details: parseResult.error.format() });
            }

            const { email, code, password } = parseResult.data;

            try {
                const user = await this.verifyEmailSetPassword.execute(email, code, password);

                const token = this.fastify.sign({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                });

                reply.send({
                    message: "Email verified and password set successfully",
                    token,
                    user: { id: user.id, name: user.name, email: user.email, role: user.role }
                });
            } catch (error: any) {
                return reply.code(400).send({ error: "Verification failed", message: error.message });
            }
        }, {
            tags: ["Auth"],
            summary: "Verifies email and sets password for existing Google users"
        });

        this.fastify.addRoute("POST", "/auth/login", async (request: FastifyRequest, reply: FastifyReply) => {
            const parseResult = LoginInputSchema.safeParse(request.body);
            if (!parseResult.success) {
                return reply.code(400).send({ error: "Validation failed", details: parseResult.error.format() });
            }

            const { email, password } = parseResult.data;

            try {
                const user = await this.login.execute(email, password);

                const token = this.fastify.sign({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                });

                reply.send({
                    message: "Login successful",
                    token,
                    user: { id: user.id, name: user.name, email: user.email, role: user.role }
                });
            } catch (error: any) {
                return reply.code(401).send({ error: "Invalid credentials" });
            }
        }, {
            tags: ["Auth"],
            summary: "Logins a user with email and password"
        });
    }
}
