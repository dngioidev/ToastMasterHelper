import { MigrationInterface, QueryRunner } from 'typeorm';

export class SplitOnlineRoles1744000004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "members"
        DROP COLUMN IF EXISTS "attends_online",
        ADD COLUMN IF NOT EXISTS "online_as_chairman" boolean NOT NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS "online_as_speaker"  boolean NOT NULL DEFAULT true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "members"
        DROP COLUMN IF EXISTS "online_as_chairman",
        DROP COLUMN IF EXISTS "online_as_speaker",
        ADD COLUMN IF NOT EXISTS "attends_online" boolean NOT NULL DEFAULT true
    `);
  }
}
