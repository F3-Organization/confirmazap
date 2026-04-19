import { ICompanyConfigRepository } from "../repositories/icompany-config-repository";
import { CompanyConfig } from "../../infra/database/entities/company-config.entity";

interface UpdateBotConfigInput {
    companyId: string;
    businessType?: string;
    businessDescription?: string;
    botGreeting?: string;
    botInstructions?: string;
    address?: string;
    workingHours?: Record<string, Array<{ start: string; end: string }>>;
    servicesOffered?: string[];
    botEnabled?: boolean;
}

export class ManageBotConfigUseCase {
    constructor(
        private readonly companyConfigRepository: ICompanyConfigRepository
    ) {}

    async get(companyId: string): Promise<Partial<CompanyConfig> | null> {
        const config = await this.companyConfigRepository.findByCompanyId(companyId);
        if (!config) return null;

        return {
            businessType: config.businessType,
            businessDescription: config.businessDescription,
            botGreeting: config.botGreeting,
            botInstructions: config.botInstructions,
            address: config.address,
            workingHours: config.workingHours,
            servicesOffered: config.servicesOffered,
            botEnabled: config.botEnabled,
        };
    }

    async update(input: UpdateBotConfigInput): Promise<void> {
        const config = await this.companyConfigRepository.findByCompanyId(input.companyId);
        if (!config) {
            throw new Error("Company config not found");
        }

        const data: Partial<CompanyConfig> = {};
        if (input.businessType !== undefined) data.businessType = input.businessType;
        if (input.businessDescription !== undefined) data.businessDescription = input.businessDescription;
        if (input.botGreeting !== undefined) data.botGreeting = input.botGreeting;
        if (input.botInstructions !== undefined) data.botInstructions = input.botInstructions;
        if (input.address !== undefined) data.address = input.address;
        if (input.workingHours !== undefined) data.workingHours = input.workingHours;
        if (input.servicesOffered !== undefined) data.servicesOffered = input.servicesOffered;
        if (input.botEnabled !== undefined) data.botEnabled = input.botEnabled;

        await this.companyConfigRepository.updateByCompanyId(input.companyId, data);
    }
}
