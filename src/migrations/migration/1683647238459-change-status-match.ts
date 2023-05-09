import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeStatusMatch1683647238459 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "matches" SET status = 'Started' WHERE status = 'Ready'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "matches" SET status = 'Ready' WHERE status = 'Started'`);
  }
}
