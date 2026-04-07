import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMemberSessionType1744000003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "members"
        ADD COLUMN IF NOT EXISTS "attends_online"  boolean NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS "attends_offline" boolean NOT NULL DEFAULT true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "members"
        DROP COLUMN IF EXISTS "attends_online",
        DROP COLUMN IF EXISTS "attends_offline"
    `);
  }
}
