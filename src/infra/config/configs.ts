import 'dotenv/config'

export const env = {
    environment: process.env.NODE_ENV || 'development',
    debug: () => env.environment === 'development',
    port: parseInt(process.env.PORT || '3000'),
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'agendaok',
    }
}