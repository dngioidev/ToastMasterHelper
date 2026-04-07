import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTableTopicRole1744000005000 implements MigrationInterface {
  name = 'AddTableTopicRole1744000005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."offline_role_enum" ADD VALUE IF NOT EXISTS 'table_topic'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support removing enum values directly.
    // Recreate the enum without 'table_topic' and re-cast the column.
    await queryRunner.query(`
      ALTER TABLE "offline_session_assignments"
        ALTER COLUMN "role" TYPE text
    `);
    await queryRunner.query(`DROP TYPE "public"."offline_role_enum"`);
    await queryRunner.query(`
      CREATE TYPE "public"."offline_role_enum" AS ENUM(
        'toast_master',
        'table_tonic',
        'speaker',
        'evaluator',
        'topic_master',
        'uh_ah_counter',
        'timer',
        'general_evaluator',
        'backup_speaker'
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "offline_session_assignments"
        ALTER COLUMN "role" TYPE "public"."offline_role_enum"
        USING "role"::"public"."offline_role_enum"
    `);
  }
}
