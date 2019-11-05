import {MigrationInterface, QueryRunner, Table} from "typeorm";


export class AddAuthTable1572880566396 implements MigrationInterface {
  public tableName = "test.auth";

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.dropTable(this.tableName);
  }

  public async up(queryRunner: QueryRunner): Promise<any> {
    const table = new Table({
      name: this.tableName,
      columns: [
        {
          name: "id",
          type: "serial",
          isPrimary: true,
        },
        {
          name: "user_id",
          type: "int",
        },
        {
          name: "refresh_token",
          type: "varchar",
        },
        {
          name: "created_at",
          type: "timestamptz",
        },
      ],
      foreignKeys: [
        {
          columnNames: ["user_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "test.user",
          onDelete: "CASCADE",
        },
      ],
    });

    await queryRunner.createTable(table, true);

    await queryRunner.query(`
      CREATE FUNCTION delete_expired_tokens() RETURNS trigger
      LANGUAGE plpgsql
      AS $$
        BEGIN
          DELETE FROM test.auth WHERE created_at < NOW() - INTERVAL '30 days';
          RETURN NEW;
        END;
      $$;
    `);

    await queryRunner.query(`
      CREATE TRIGGER delete_expired_tokens_trigger
      AFTER INSERT ON test.auth
      EXECUTE PROCEDURE delete_expired_tokens()
    `);
  }
}
