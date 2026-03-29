import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserEntity1711670600000 implements MigrationInterface {
    name = 'UpdateUserEntity1711670600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "google_id" DROP NOT NULL`);
        // Add unique constraint to google_id if not exists
        await queryRunner.query(`
            DO $$ BEGIN
                ALTER TABLE "users" ADD CONSTRAINT "UQ_users_google_id" UNIQUE ("google_id");
            EXCEPTION
                WHEN duplicate_table THEN null;
                WHEN duplicate_object THEN null;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_google_id"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "google_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
    }
}
