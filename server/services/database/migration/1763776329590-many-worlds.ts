import { MigrationInterface, QueryRunner } from "typeorm";

export class ManyWorlds1763776329590 implements MigrationInterface {
    name = 'ManyWorlds1763776329590'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`category\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`world\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`stat\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`value\` varchar(255) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`segment\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`world_entity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`shortDescription\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`category_worlds_world\` (\`categoryId\` int NOT NULL, \`worldId\` int NOT NULL, INDEX \`IDX_1622b70298bfe35777e8cd7841\` (\`categoryId\`), INDEX \`IDX_b53fdad184af1980a13d3c110f\` (\`worldId\`), PRIMARY KEY (\`categoryId\`, \`worldId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`category_tags_tag\` (\`categoryId\` int NOT NULL, \`tagId\` int NOT NULL, INDEX \`IDX_8744a0a3d7cfe4c05ea8b37437\` (\`categoryId\`), INDEX \`IDX_73d55448198d6acc88f9c2fbad\` (\`tagId\`), PRIMARY KEY (\`categoryId\`, \`tagId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`world_categories_category\` (\`worldId\` int NOT NULL, \`categoryId\` int NOT NULL, INDEX \`IDX_ba60e88ba2438571c3a9de9c4e\` (\`worldId\`), INDEX \`IDX_f2828c0e0fdd642a1f0c889564\` (\`categoryId\`), PRIMARY KEY (\`worldId\`, \`categoryId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`world_tags_tag\` (\`worldId\` int NOT NULL, \`tagId\` int NOT NULL, INDEX \`IDX_5c6a2ddd6054f23e5ae3f29443\` (\`worldId\`), INDEX \`IDX_0b2767a36fe5ec173be68a19cd\` (\`tagId\`), PRIMARY KEY (\`worldId\`, \`tagId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`world_entity_worlds_world\` (\`worldEntityId\` int NOT NULL, \`worldId\` int NOT NULL, INDEX \`IDX_36a68168a469f1da629a1c959e\` (\`worldEntityId\`), INDEX \`IDX_6eeaf7cf5993b4cd4ee3bc0055\` (\`worldId\`), PRIMARY KEY (\`worldEntityId\`, \`worldId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`world_entity_categories_category\` (\`worldEntityId\` int NOT NULL, \`categoryId\` int NOT NULL, INDEX \`IDX_5673045bf69a73c696be8da814\` (\`worldEntityId\`), INDEX \`IDX_8b9a3d70b393a5f4d076a9af44\` (\`categoryId\`), PRIMARY KEY (\`worldEntityId\`, \`categoryId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`world_entity_stats_stat\` (\`worldEntityId\` int NOT NULL, \`statId\` int NOT NULL, INDEX \`IDX_88995aa641140dc25718f3fc0d\` (\`worldEntityId\`), INDEX \`IDX_51101bc5f7c566522fa7d5fb19\` (\`statId\`), PRIMARY KEY (\`worldEntityId\`, \`statId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`world_entity_segments_segment\` (\`worldEntityId\` int NOT NULL, \`segmentId\` int NOT NULL, INDEX \`IDX_208dbb191801ae1812e9b915e6\` (\`worldEntityId\`), INDEX \`IDX_96c3278d4f1fc9021c5e95230d\` (\`segmentId\`), PRIMARY KEY (\`worldEntityId\`, \`segmentId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`world_entity_tags_tag\` (\`worldEntityId\` int NOT NULL, \`tagId\` int NOT NULL, INDEX \`IDX_da559c34494625e6cee867ca73\` (\`worldEntityId\`), INDEX \`IDX_8f5b8c0ea28daeccf6aec28cf2\` (\`tagId\`), PRIMARY KEY (\`worldEntityId\`, \`tagId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`category_worlds_world\` ADD CONSTRAINT \`FK_1622b70298bfe35777e8cd78417\` FOREIGN KEY (\`categoryId\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`category_worlds_world\` ADD CONSTRAINT \`FK_b53fdad184af1980a13d3c110ff\` FOREIGN KEY (\`worldId\`) REFERENCES \`world\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`category_tags_tag\` ADD CONSTRAINT \`FK_8744a0a3d7cfe4c05ea8b374372\` FOREIGN KEY (\`categoryId\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`category_tags_tag\` ADD CONSTRAINT \`FK_73d55448198d6acc88f9c2fbadc\` FOREIGN KEY (\`tagId\`) REFERENCES \`tag\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`world_categories_category\` ADD CONSTRAINT \`FK_ba60e88ba2438571c3a9de9c4e4\` FOREIGN KEY (\`worldId\`) REFERENCES \`world\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`world_categories_category\` ADD CONSTRAINT \`FK_f2828c0e0fdd642a1f0c889564d\` FOREIGN KEY (\`categoryId\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`world_tags_tag\` ADD CONSTRAINT \`FK_5c6a2ddd6054f23e5ae3f294433\` FOREIGN KEY (\`worldId\`) REFERENCES \`world\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`world_tags_tag\` ADD CONSTRAINT \`FK_0b2767a36fe5ec173be68a19cd7\` FOREIGN KEY (\`tagId\`) REFERENCES \`tag\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`world_entity_worlds_world\` ADD CONSTRAINT \`FK_36a68168a469f1da629a1c959e1\` FOREIGN KEY (\`worldEntityId\`) REFERENCES \`world_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`world_entity_worlds_world\` ADD CONSTRAINT \`FK_6eeaf7cf5993b4cd4ee3bc0055d\` FOREIGN KEY (\`worldId\`) REFERENCES \`world\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`world_entity_categories_category\` ADD CONSTRAINT \`FK_5673045bf69a73c696be8da8149\` FOREIGN KEY (\`worldEntityId\`) REFERENCES \`world_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`world_entity_categories_category\` ADD CONSTRAINT \`FK_8b9a3d70b393a5f4d076a9af44c\` FOREIGN KEY (\`categoryId\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`world_entity_stats_stat\` ADD CONSTRAINT \`FK_88995aa641140dc25718f3fc0d0\` FOREIGN KEY (\`worldEntityId\`) REFERENCES \`world_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`world_entity_stats_stat\` ADD CONSTRAINT \`FK_51101bc5f7c566522fa7d5fb19e\` FOREIGN KEY (\`statId\`) REFERENCES \`stat\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`world_entity_segments_segment\` ADD CONSTRAINT \`FK_208dbb191801ae1812e9b915e69\` FOREIGN KEY (\`worldEntityId\`) REFERENCES \`world_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`world_entity_segments_segment\` ADD CONSTRAINT \`FK_96c3278d4f1fc9021c5e95230d3\` FOREIGN KEY (\`segmentId\`) REFERENCES \`segment\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`world_entity_tags_tag\` ADD CONSTRAINT \`FK_da559c34494625e6cee867ca730\` FOREIGN KEY (\`worldEntityId\`) REFERENCES \`world_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`world_entity_tags_tag\` ADD CONSTRAINT \`FK_8f5b8c0ea28daeccf6aec28cf25\` FOREIGN KEY (\`tagId\`) REFERENCES \`tag\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`world_entity_tags_tag\` DROP FOREIGN KEY \`FK_8f5b8c0ea28daeccf6aec28cf25\``);
        await queryRunner.query(`ALTER TABLE \`world_entity_tags_tag\` DROP FOREIGN KEY \`FK_da559c34494625e6cee867ca730\``);
        await queryRunner.query(`ALTER TABLE \`world_entity_segments_segment\` DROP FOREIGN KEY \`FK_96c3278d4f1fc9021c5e95230d3\``);
        await queryRunner.query(`ALTER TABLE \`world_entity_segments_segment\` DROP FOREIGN KEY \`FK_208dbb191801ae1812e9b915e69\``);
        await queryRunner.query(`ALTER TABLE \`world_entity_stats_stat\` DROP FOREIGN KEY \`FK_51101bc5f7c566522fa7d5fb19e\``);
        await queryRunner.query(`ALTER TABLE \`world_entity_stats_stat\` DROP FOREIGN KEY \`FK_88995aa641140dc25718f3fc0d0\``);
        await queryRunner.query(`ALTER TABLE \`world_entity_categories_category\` DROP FOREIGN KEY \`FK_8b9a3d70b393a5f4d076a9af44c\``);
        await queryRunner.query(`ALTER TABLE \`world_entity_categories_category\` DROP FOREIGN KEY \`FK_5673045bf69a73c696be8da8149\``);
        await queryRunner.query(`ALTER TABLE \`world_entity_worlds_world\` DROP FOREIGN KEY \`FK_6eeaf7cf5993b4cd4ee3bc0055d\``);
        await queryRunner.query(`ALTER TABLE \`world_entity_worlds_world\` DROP FOREIGN KEY \`FK_36a68168a469f1da629a1c959e1\``);
        await queryRunner.query(`ALTER TABLE \`world_tags_tag\` DROP FOREIGN KEY \`FK_0b2767a36fe5ec173be68a19cd7\``);
        await queryRunner.query(`ALTER TABLE \`world_tags_tag\` DROP FOREIGN KEY \`FK_5c6a2ddd6054f23e5ae3f294433\``);
        await queryRunner.query(`ALTER TABLE \`world_categories_category\` DROP FOREIGN KEY \`FK_f2828c0e0fdd642a1f0c889564d\``);
        await queryRunner.query(`ALTER TABLE \`world_categories_category\` DROP FOREIGN KEY \`FK_ba60e88ba2438571c3a9de9c4e4\``);
        await queryRunner.query(`ALTER TABLE \`category_tags_tag\` DROP FOREIGN KEY \`FK_73d55448198d6acc88f9c2fbadc\``);
        await queryRunner.query(`ALTER TABLE \`category_tags_tag\` DROP FOREIGN KEY \`FK_8744a0a3d7cfe4c05ea8b374372\``);
        await queryRunner.query(`ALTER TABLE \`category_worlds_world\` DROP FOREIGN KEY \`FK_b53fdad184af1980a13d3c110ff\``);
        await queryRunner.query(`ALTER TABLE \`category_worlds_world\` DROP FOREIGN KEY \`FK_1622b70298bfe35777e8cd78417\``);
        await queryRunner.query(`DROP INDEX \`IDX_8f5b8c0ea28daeccf6aec28cf2\` ON \`world_entity_tags_tag\``);
        await queryRunner.query(`DROP INDEX \`IDX_da559c34494625e6cee867ca73\` ON \`world_entity_tags_tag\``);
        await queryRunner.query(`DROP TABLE \`world_entity_tags_tag\``);
        await queryRunner.query(`DROP INDEX \`IDX_96c3278d4f1fc9021c5e95230d\` ON \`world_entity_segments_segment\``);
        await queryRunner.query(`DROP INDEX \`IDX_208dbb191801ae1812e9b915e6\` ON \`world_entity_segments_segment\``);
        await queryRunner.query(`DROP TABLE \`world_entity_segments_segment\``);
        await queryRunner.query(`DROP INDEX \`IDX_51101bc5f7c566522fa7d5fb19\` ON \`world_entity_stats_stat\``);
        await queryRunner.query(`DROP INDEX \`IDX_88995aa641140dc25718f3fc0d\` ON \`world_entity_stats_stat\``);
        await queryRunner.query(`DROP TABLE \`world_entity_stats_stat\``);
        await queryRunner.query(`DROP INDEX \`IDX_8b9a3d70b393a5f4d076a9af44\` ON \`world_entity_categories_category\``);
        await queryRunner.query(`DROP INDEX \`IDX_5673045bf69a73c696be8da814\` ON \`world_entity_categories_category\``);
        await queryRunner.query(`DROP TABLE \`world_entity_categories_category\``);
        await queryRunner.query(`DROP INDEX \`IDX_6eeaf7cf5993b4cd4ee3bc0055\` ON \`world_entity_worlds_world\``);
        await queryRunner.query(`DROP INDEX \`IDX_36a68168a469f1da629a1c959e\` ON \`world_entity_worlds_world\``);
        await queryRunner.query(`DROP TABLE \`world_entity_worlds_world\``);
        await queryRunner.query(`DROP INDEX \`IDX_0b2767a36fe5ec173be68a19cd\` ON \`world_tags_tag\``);
        await queryRunner.query(`DROP INDEX \`IDX_5c6a2ddd6054f23e5ae3f29443\` ON \`world_tags_tag\``);
        await queryRunner.query(`DROP TABLE \`world_tags_tag\``);
        await queryRunner.query(`DROP INDEX \`IDX_f2828c0e0fdd642a1f0c889564\` ON \`world_categories_category\``);
        await queryRunner.query(`DROP INDEX \`IDX_ba60e88ba2438571c3a9de9c4e\` ON \`world_categories_category\``);
        await queryRunner.query(`DROP TABLE \`world_categories_category\``);
        await queryRunner.query(`DROP INDEX \`IDX_73d55448198d6acc88f9c2fbad\` ON \`category_tags_tag\``);
        await queryRunner.query(`DROP INDEX \`IDX_8744a0a3d7cfe4c05ea8b37437\` ON \`category_tags_tag\``);
        await queryRunner.query(`DROP TABLE \`category_tags_tag\``);
        await queryRunner.query(`DROP INDEX \`IDX_b53fdad184af1980a13d3c110f\` ON \`category_worlds_world\``);
        await queryRunner.query(`DROP INDEX \`IDX_1622b70298bfe35777e8cd7841\` ON \`category_worlds_world\``);
        await queryRunner.query(`DROP TABLE \`category_worlds_world\``);
        await queryRunner.query(`DROP TABLE \`world_entity\``);
        await queryRunner.query(`DROP TABLE \`segment\``);
        await queryRunner.query(`DROP TABLE \`stat\``);
        await queryRunner.query(`DROP TABLE \`world\``);
        await queryRunner.query(`DROP TABLE \`category\``);
    }

}
