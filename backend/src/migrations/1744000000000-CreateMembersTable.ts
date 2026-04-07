import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMembersTable1744000000000 implements MigrationInterface {
  name = 'CreateMembersTable1744000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."members_status_enum" AS ENUM('Active', 'Leave')
    `);
    await queryRunner.query(`
      CREATE TABLE "members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "status" "public"."members_status_enum" NOT NULL DEFAULT 'Active',
        "project_level" integer NOT NULL DEFAULT 0,
        "role_counts" jsonb NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_members" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "members"`);
    await queryRunner.query(`DROP TYPE "public"."members_status_enum"`);
  }
}
