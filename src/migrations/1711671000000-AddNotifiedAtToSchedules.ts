import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddNotifiedAtToSchedules1711671000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "schedules",
            new TableColumn({
                name: "notified_at",
                type: "timestamp",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("schedules", "notified_at");
    }
}
