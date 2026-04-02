export interface CreateCustomerRequest {
    name: string;
    email: string;
    cellphone: string;
    taxId: string;
}

export interface CreateBillingRequest {
    customerId: string;
    externalId: string;
    name: string;
    description: string;
    price: number;
    returnUrl: string;
    completionUrl: string;
    methods?: ('PIX' | 'CARD')[];
    metadata?: Record<string, any>;
    frequency?: 'ONE_TIME' | 'MULTIPLE_PAYMENTS';
}

export interface IPaymentGateway {
    createCustomer(request: CreateCustomerRequest): Promise<{ id: string }>;
    getCustomer(id: string): Promise<any | null>;
    createBilling(request: CreateBillingRequest): Promise<{ id: string, url: string }>;
    createSubscription(customerId: string, name: string, price: number, returnUrl: string): Promise<{ id: string, url: string }>;
    getBilling(id: string): Promise<any>;
}
