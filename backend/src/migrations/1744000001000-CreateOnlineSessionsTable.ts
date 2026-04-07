import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOnlineSessionsTable1744000001000 implements MigrationInterface {
  name = 'CreateOnlineSessionsTable1744000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "online_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "date" date NOT NULL,
        "main_chairman_id" uuid,
        "sub_chairman_id" uuid,
        "speaker1_id" uuid,
        "speaker2_id" uuid,
        "notes" text,
        "is_cancelled" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_online_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_online_sessions_date" UNIQUE ("date"),
        CONSTRAINT "FK_online_sessions_main_chairman" FOREIGN KEY ("main_chairman_id")
          REFERENCES "members"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_online_sessions_sub_chairman" FOREIGN KEY ("sub_chairman_id")
          REFERENCES "members"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_online_sessions_speaker1" FOREIGN KEY ("speaker1_id")
          REFERENCES "members"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_online_sessions_speaker2" FOREIGN KEY ("speaker2_id")
          REFERENCES "members"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "online_sessions"`);
  }
}
