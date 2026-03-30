import { ISubscriptionRepository } from "../repositories/isubscription-repository";
import { SubscriptionStatus } from "../../infra/database/entities/subscription.entity";

export interface SubscriptionStatusResponse {
    status: SubscriptionStatus;
    plan: string;
    currentPeriodEnd?: Date;
    checkoutUrl?: string;
}

export class GetSubscriptionStatusUseCase {
    constructor(private readonly subscriptionRepo: ISubscriptionRepository) {}

    async execute(userId: string): Promise<SubscriptionStatusResponse> {
        const subscription = await this.subscriptionRepo.findByUserId(userId);

        if (!subscription) {
            return {
                status: SubscriptionStatus.INACTIVE,
                plan: "FREE"
            };
        }

        return {
            status: subscription.status,
            plan: subscription.plan,
            currentPeriodEnd: subscription.currentPeriodEnd,
            checkoutUrl: subscription.checkoutUrl
        };
    }
}
