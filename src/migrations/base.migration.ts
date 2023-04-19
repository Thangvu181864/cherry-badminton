import { MigrationInterface, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

import { config } from '@config';

export class BaseMigration implements MigrationInterface {
  constructor(protected queries: string[]) {}

  protected static readSqlFile = (filename: string): string =>
    fs
      .readFileSync(path.join(config.ROOT_PATH, 'templates', 'sql_scripts', filename))
      .toString()
      .replace(/(\r\n|\n|\r)/gm, ' ') // remove newlines
      .replace(/\s+/g, ' '); // excess white space

  protected static readQueries = (filename: string): string[] =>
    // @ts-ignore
    this.readSqlFile(filename)
      .split(';')
      .filter((query) => query?.length);

  public async up(queryRunner: QueryRunner): Promise<void> {
    this.queries.map(async (qs) => await queryRunner.query(qs));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    this.queries.map(async (qs) => await queryRunner.query(qs));
  }
}
