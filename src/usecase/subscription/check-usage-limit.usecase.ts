import { ISubscriptionRepository } from "../repositories/isubscription-repository";
import { IScheduleRepository } from "../repositories/ischedule-repository";
import { ICompanyRepository } from "../repositories/icompany-repository";
import { SubscriptionStatus } from "../../infra/database/entities/subscription.entity";

export class CheckUsageLimitUseCase {
    constructor(
        private readonly subscriptionRepository: ISubscriptionRepository,
        private readonly scheduleRepository: IScheduleRepository,
        private readonly companyRepository: ICompanyRepository
    ) {}

    /**
     * Verifies if the company can still send messages based on their owner's plan.
     * The subscription belongs to the User (owner), not the Company.
     * FREE users are capped at 50 messages/month per company.
     * PRO users have no limit.
     */
    async execute(companyId: string): Promise<{ canSend: boolean; plan: string; count: number; limit: number }> {
        // Resolve company → owner → subscription
        const company = await this.companyRepository.findById(companyId);
        if (!company) {
            // If no company found, treat as FREE with default limits
            return { canSend: true, plan: "FREE", count: 0, limit: 50 };
        }

        const subscription = await this.subscriptionRepository.findByUserId(company.ownerId);
        const plan = subscription?.plan || "FREE";
        const status = subscription?.status || SubscriptionStatus.INACTIVE;

        // PRO plans have unlimited messages if active
        if (status === SubscriptionStatus.ACTIVE && plan === "PRO") {
            return { 
                canSend: true, 
                plan: "PRO", 
                count: 0, 
                limit: -1 
            };
        }

        // Calculate usage for the current month (per company)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        
        const count = await this.scheduleRepository.countMonthlyNotifications(companyId, startOfMonth, endOfMonth);
        const limit = 50;

        return {
            canSend: count < limit,
            plan,
            count,
            limit
        };
    }
}
