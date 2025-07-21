import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVideoTags1752667947667 implements MigrationInterface {
    name = 'AddVideoTags1752667947667'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`tag\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`code\` varchar(255) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 0, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`you_tube_video_tags_tag\` (\`youTubeVideoId\` int NOT NULL, \`tagId\` int NOT NULL, INDEX \`IDX_ac5e1c730d2ca619e8be4c0291\` (\`youTubeVideoId\`), INDEX \`IDX_54fc21fcf09f72461f8b7ed65b\` (\`tagId\`), PRIMARY KEY (\`youTubeVideoId\`, \`tagId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`you_tube_video_tags_tag\` ADD CONSTRAINT \`FK_ac5e1c730d2ca619e8be4c0291b\` FOREIGN KEY (\`youTubeVideoId\`) REFERENCES \`you_tube_video\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`you_tube_video_tags_tag\` ADD CONSTRAINT \`FK_54fc21fcf09f72461f8b7ed65b0\` FOREIGN KEY (\`tagId\`) REFERENCES \`tag\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`you_tube_video_tags_tag\` DROP FOREIGN KEY \`FK_54fc21fcf09f72461f8b7ed65b0\``);
        await queryRunner.query(`ALTER TABLE \`you_tube_video_tags_tag\` DROP FOREIGN KEY \`FK_ac5e1c730d2ca619e8be4c0291b\``);
        await queryRunner.query(`DROP INDEX \`IDX_54fc21fcf09f72461f8b7ed65b\` ON \`you_tube_video_tags_tag\``);
        await queryRunner.query(`DROP INDEX \`IDX_ac5e1c730d2ca619e8be4c0291\` ON \`you_tube_video_tags_tag\``);
        await queryRunner.query(`DROP TABLE \`you_tube_video_tags_tag\``);
        await queryRunner.query(`DROP TABLE \`tag\``);
    }

}
