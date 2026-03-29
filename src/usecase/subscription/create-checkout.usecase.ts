import { SubscriptionRepository } from "../../infra/database/repositories/subscription.repository";
import { UserRepository } from "../../infra/database/repositories/user.repository";
import { IPaymentGateway } from "../ports/ipayment-gateway";
import { env } from "../../infra/config/configs";
import { UserConfigRepository } from "../../infra/database/repositories/user-config.repository";
import { SubscriptionStatus } from "../../infra/database/entities/subscription.entity";

export class CreateSubscriptionCheckoutUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly subscriptionRepository: SubscriptionRepository,
        private readonly userConfigRepository: UserConfigRepository,
        private readonly paymentGateway: IPaymentGateway
    ) {}

    async execute(userId: string) {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new Error("User not found");

        let subscription = await this.subscriptionRepository.findByUserId(userId);

        // Se já tem assinatura ativa, não cria nova
        if (subscription?.status === SubscriptionStatus.ACTIVE) {
            return { url: subscription.checkoutUrl || `${env.domain}/dashboard` };
        }

        // Criar customer no gateway se necessário
        let customerId = subscription?.abacateCustomerId;
        if (!customerId) {
            const userConfig = await this.userConfigRepository.findByUserId(userId);

            if (!userConfig?.whatsappNumber || !userConfig?.taxId) {
                throw new Error("User must configure WhatsApp Number and Tax ID (CPF/CNPJ) before checkout.");
            }

            const customer = await this.paymentGateway.createCustomer({
                name: user.name,
                email: user.email,
                cellphone: userConfig.whatsappNumber,
                taxId: userConfig.taxId
            });
            customerId = customer.id;
        }

        // Criar cobrança
        const billing = await this.paymentGateway.createBilling({
            customerId,
            externalId: `sub_${userId}_${Date.now()}`,
            name: env.abacatePay.planName,
            description: "Plano de assinatura mensal AgendaOk",
            price: env.abacatePay.planPrice,
            returnUrl: `https://${env.domain}/dashboard`,
            completionUrl: `https://${env.domain}/dashboard`
        });

        // Salvar/Atualizar subscription
        await this.subscriptionRepository.createOrUpdate(userId, {
            abacateBillingId: billing.id,
            abacateCustomerId: customerId,
            checkoutUrl: billing.url,
            status: SubscriptionStatus.INACTIVE
        });

        return { url: billing.url };
    }
}
