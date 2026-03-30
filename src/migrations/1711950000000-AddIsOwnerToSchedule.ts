import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsOwnerToSchedule1711950000000 implements MigrationInterface {
    name = 'AddIsOwnerToSchedule1711950000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedules" ADD COLUMN IF NOT EXISTS "is_owner" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN IF EXISTS "is_owner"`);
    }
}
