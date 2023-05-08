import { MigrationInterface, QueryRunner } from 'typeorm';

export class changeStatusBadmintonSession1683561340206 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE badminton_session SET status = 'New' WHERE status = 'Pending'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE badminton_session SET status = 'Pending' WHERE status = 'New'`);
  }
}
