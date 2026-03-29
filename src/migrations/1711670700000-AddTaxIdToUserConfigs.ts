import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTaxIdToUserConfigs1711670700000 implements MigrationInterface {
    name = 'AddTaxIdToUserConfigs1711670700000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_configs" ADD "tax_id" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_configs" DROP COLUMN "tax_id"`);
    }
}
