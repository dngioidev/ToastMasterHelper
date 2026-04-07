import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOfflineSessionsTable1744000002000 implements MigrationInterface {
  name = 'CreateOfflineSessionsTable1744000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
      CREATE TABLE "offline_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "date" date NOT NULL,
        "num_speakers" integer NOT NULL DEFAULT 2,
        "num_backup_speakers" integer NOT NULL DEFAULT 1,
        "notes" text,
        "is_cancelled" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_offline_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_offline_sessions_date" UNIQUE ("date")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "offline_session_assignments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "session_id" uuid NOT NULL,
        "member_id" uuid,
        "role" "public"."offline_role_enum" NOT NULL,
        "slot_index" integer NOT NULL DEFAULT 0,
        "passed" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_offline_session_assignments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_assignments_session" FOREIGN KEY ("session_id")
          REFERENCES "offline_sessions"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_assignments_member" FOREIGN KEY ("member_id")
          REFERENCES "members"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "offline_session_assignments"`);
    await queryRunner.query(`DROP TABLE "offline_sessions"`);
    await queryRunner.query(`DROP TYPE "public"."offline_role_enum"`);
  }
}
