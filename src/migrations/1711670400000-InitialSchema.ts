import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1711670400000 implements MigrationInterface {
    name = 'InitialSchema1711670400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable uuid-ossp extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Users
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "email" character varying NOT NULL,
                "google_id" character varying NOT NULL,
                CONSTRAINT "PK_users" PRIMARY KEY ("id")
            )
        `);

        // Clients
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "clients" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "phone" character varying NOT NULL,
                "email" character varying,
                "user_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_clients" PRIMARY KEY ("id"),
                CONSTRAINT "FK_clients_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

        // Schedule status enum
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE "public"."schedules_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'CANCELLED');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Schedules
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "schedules" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "google_event_id" character varying NOT NULL,
                "title" character varying NOT NULL,
                "description" text,
                "start_at" TIMESTAMP NOT NULL,
                "end_at" TIMESTAMP NOT NULL,
                "status" "public"."schedules_status_enum" NOT NULL DEFAULT 'PENDING',
                "is_notified" boolean NOT NULL DEFAULT false,
                "user_id" uuid NOT NULL,
                "client_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_schedules" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_schedules_google_event_id" UNIQUE ("google_event_id"),
                CONSTRAINT "FK_schedules_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_schedules_client" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL
            )
        `);

        // User Configs
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user_configs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "whatsapp_number" character varying,
                "whatsapp_instance_name" character varying,
                "google_access_token" text,
                "google_refresh_token" text,
                "google_token_expiry" TIMESTAMP,
                "silent_window_start" character varying NOT NULL DEFAULT '21:00',
                "silent_window_end" character varying NOT NULL DEFAULT '08:00',
                "sync_enabled" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_user_configs" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_user_configs_user_id" UNIQUE ("user_id"),
                CONSTRAINT "FK_user_configs_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

        // TypeORM migrations tracking table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "typeorm_metadata" (
                "type" character varying NOT NULL,
                "database" character varying,
                "schema" character varying,
                "table" character varying,
                "name" character varying,
                "value" text
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "user_configs"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "schedules"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "clients"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "public"."schedules_status_enum"`);
    }
}
