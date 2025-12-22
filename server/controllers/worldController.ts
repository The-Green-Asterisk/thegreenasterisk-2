import http from "http";
import AppDataSource from "services/database";
import { Category } from "services/database/entity/Category";
import { Segment } from "services/database/entity/Segment";
import { Stat } from "services/database/entity/Stat";
import { World } from "services/database/entity/World";
import { WorldEntity } from "services/database/entity/WorldEntity";
import StorageService from "services/storage";
import BaseController from "./baseController";

export default class WorldController extends BaseController {
    constructor() {
        super();
    }

    public static async createWorld(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const newWorld = await this.readBody<World>(req);
            if (!newWorld || !newWorld.name) {
                return {
                    response: JSON.stringify({ error: 'World name is required' }),
                    header: 'application/json',
                    status: 400
                };
            }

            if (!newWorld.description) {
                newWorld.description = '';
            }

            const worldRepository = AppDataSource.getRepository(World);
            const createdWorld = worldRepository.create(newWorld);
            const savedWorld = await worldRepository.save(createdWorld);
            return {
                response: JSON.stringify(savedWorld),
                header: 'application/json',
                status: 201
            };
        } catch (error) {
            console.error("Error creating world:", error);
            return {
                response: 'Internal Server Error',
                header: 'application/json',
                status: 500
            };
        }
    }

    public static async getWorlds(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const worldRepository = AppDataSource.getRepository(World);
            const worlds = await worldRepository.find();
            return {
                response: JSON.stringify(worlds),
                header: 'application/json',
                status: 200
            };
        } catch (error) {
            console.error("Error fetching worlds:", error);
            return {
                response: 'Internal Server Error',
                header: 'application/json',
                status: 500
            };
        }
    }

    public static async editWorld(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const updatedWorld = await this.readBody<World>(req);
            if (!updatedWorld || !updatedWorld.id) {
                return {
                    response: 'World ID is required',
                    header: 'application/json',
                    status: 400
                };
            }
            const worldRepository = AppDataSource.getRepository(World);
            const existingWorld = await worldRepository.findOneBy({ id: updatedWorld.id });
            if (!existingWorld) {
                return {
                    response: 'World not found',
                    header: 'application/json',
                    status: 404
                };
            }
            const mergedWorld = worldRepository.merge(existingWorld, updatedWorld);
            const savedWorld = await worldRepository.save(mergedWorld);
            return {
                response: JSON.stringify(savedWorld),
                header: 'application/json',
                status: 200
            };
        } catch (error) {
            console.error("Error editing world:", error);
            return {
                response: 'Internal Server Error',
                header: 'application/json',
                status: 500
            };
        }
    }

    public static async getCategories(req: http.IncomingMessage, res: http.ServerResponse) {
        const { worldId } = this.parseUrlQuery(req.url);
        if (!worldId || isNaN(Number(worldId)) || Array.isArray(worldId)) {
            return {
                response: 'Invalid worldId parameter',
                header: 'application/json',
                status: 400
            };
        }
        try {
            const categoryRepository = AppDataSource.getRepository(Category);
            const worldEntityRepository = AppDataSource.getRepository(WorldEntity);

            const categories = await categoryRepository.find({
                where: { worlds: { id: Number(worldId) } },
                relations: ['tags']
            });

            
            for (const category of categories) {
                category.worldEntities = await worldEntityRepository.find({
                    where: { worlds: { id: Number(worldId) }, categories: { id: category.id } },
                    relations: ['tags', 'categories'],
                    take: 5
                });
            }

            return {
                response: JSON.stringify(categories),
                header: 'application/json',
                status: 200
            };
        } catch (error) {
            console.error("Error fetching categories:", error);
            return {
                response: 'Internal Server Error',
                header: 'application/json',
                status: 500
            };
        }
    }

    public static async createCategory(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const newCategory = await this.readBody<Category>(req);
            if (!newCategory || !newCategory.name) {
                return {
                    response: 'Category name is required',
                    header: 'application/json',
                    status: 400
                };
            }
            if (!newCategory.worlds || newCategory.worlds.length === 0) {
                return {
                    response: 'At least one world must be associated with the category',
                    header: 'application/json',
                    status: 400
                };
            }
            const categoryRepository = AppDataSource.getRepository(Category);
            // find if category already exists in any of the worlds
            const existingCategory = await categoryRepository.findOne({
                where: { name: newCategory.name }
            });
            if (existingCategory) {
                // attach new world to existing category
                existingCategory.worlds = [...existingCategory.worlds, ...newCategory.worlds];
                const savedCategory = await categoryRepository.save(existingCategory);
                return {
                    response: JSON.stringify(savedCategory),
                    header: 'application/json',
                    status: 200
                };
            }
            const createdCategory = categoryRepository.create(newCategory);
            const savedCategory = await categoryRepository.save(createdCategory);
            return {
                response: JSON.stringify(savedCategory),
                header: 'application/json',
                status: 201
            };
        } catch (error) {
            console.error("Error creating category:", error);
            return {
                response: 'Internal Server Error',
                header: 'application/json',
                status: 500
            };
        }
    }

    public static async getCategory(req: http.IncomingMessage, res: http.ServerResponse) {
        const { categoryId, worldId } = this.parseUrlQuery(req.url);
        if (!categoryId || isNaN(Number(categoryId)) || Array.isArray(categoryId) ||
            !worldId || isNaN(Number(worldId)) || Array.isArray(worldId)) {
            return {
                response: 'Invalid categoryId or worldId parameter',
                header: 'application/json',
                status: 400
            };
        }
        try {
            const categoryRepository = AppDataSource.getRepository(Category);
            const category = await categoryRepository.findOne({
                where: { id: Number(categoryId), worlds: { id: Number(worldId) } },
                relations: ['worlds', 'tags']
            });

            if (!category) {
                return {
                    response: 'Category not found',
                    header: 'application/json',
                    status: 404
                };
            }

            const worldEntityRepository = AppDataSource.getRepository(WorldEntity);
            category.worldEntities = await worldEntityRepository.find({
                where: { worlds: { id: Number(worldId) }, categories: { id: category.id } },
                relations: ['tags']
            });

            return {
                response: JSON.stringify(category),
                header: 'application/json',
                status: 200
            };

        } catch (error) {
            console.error("Error fetching category:", error);
            return {
                response: 'Internal Server Error',
                header: 'application/json',
                status: 500
            };
        }
    }

    public static async getEntities(req: http.IncomingMessage, res: http.ServerResponse) {
        const { categoryId } = this.parseUrlQuery(req.url);
        if (!categoryId || isNaN(Number(categoryId)) || Array.isArray(categoryId)) {
            return {
                response: 'Invalid categoryId parameter',
                header: 'application/json',
                status: 400
            };
        }
        try {
            const worldEntityRepository = AppDataSource.getRepository(WorldEntity);
            const entities = await worldEntityRepository.find({
                where: { categories: { id: Number(categoryId) } },
                relations: ['tags', 'categories', 'worlds']
            });
            if (!entities || entities.length === 0) {
                return {
                    response: JSON.stringify([]),
                    header: 'application/json',
                    status: 200
                };
            }
            // organize entities into an array of arrays based on the first letter of their name
            const organizedEntities: WorldEntity[][] = [];
            for (let i = 0; i < 26; i++) {
                organizedEntities.push([]);
            }
            for (const entity of entities) {
                const firstLetter = entity.name.charAt(0).toUpperCase();
                const index = firstLetter.charCodeAt(0) - 65;
                if (!organizedEntities[index]) {
                    organizedEntities[index] = [];
                }
                organizedEntities[index].push(entity);
            }
            return {
                response: JSON.stringify(organizedEntities),
                header: 'application/json',
                status: 200
            };
        } catch (error) {
            console.error("Error fetching entities:", error);
            return {
                response: 'Internal Server Error',
                header: 'application/json',
                status: 500
            };
        }
    }

    public static async createEntity(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const newEntity = await this.readBody<WorldEntity>(req);
            if (!newEntity || !newEntity.name) {
                return {
                    response: 'Entity name is required',
                    header: 'application/json',
                    status: 400
                };
            }
            const worldEntityRepository = AppDataSource.getRepository(WorldEntity);
            const createdEntity = worldEntityRepository.create(newEntity);
            const savedEntity = await worldEntityRepository.save(createdEntity);
            return {
                response: JSON.stringify(savedEntity),
                header: 'application/json',
                status: 201
            };
        } catch (error) {
            console.error("Error creating entity:", error);
            return {
                response: 'Internal Server Error',
                header: 'application/json',
                status: 500
            };
        }
    }

    public static async getWorldEntity(req: http.IncomingMessage, res: http.ServerResponse) {
        const { entityId, categoryId, worldId } = this.parseUrlQuery(req.url);
        if (!entityId || isNaN(Number(entityId)) || Array.isArray(entityId) ||
            !categoryId || isNaN(Number(categoryId)) || Array.isArray(categoryId) ||
            !worldId || isNaN(Number(worldId)) || Array.isArray(worldId)) {
            return {
                response: 'Invalid entityId, categoryId, or worldId parameter',
                header: 'application/json',
                status: 400
            };
        }
        try {
            const worldEntityRepository = AppDataSource.getRepository(WorldEntity);
            const entity = await worldEntityRepository.findOne({
                where: {
                    id: Number(entityId),
                    categories: { id: Number(categoryId) },
                    worlds: { id: Number(worldId) }
                },
                relations: ['tags', 'categories', 'worlds', 'segments']
            });

            if (!entity) {
                return {
                    response: 'Entity not found',
                    header: 'application/json',
                    status: 404
                };
            }

            if (entity && entity.segments) {
                entity.segments = entity.segments.filter(segment => segment.isActive);
            }

            return {
                response: JSON.stringify(entity),
                header: 'application/json',
                status: 200
            };
        } catch (error) {
            console.error("Error fetching world entity:", error);
            return {
                response: 'Internal Server Error',
                header: 'application/json',
                status: 500
            };
        }
    }

    public static async editEntity(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const updatedEntity = await this.readBody<WorldEntity>(req);
            if (!updatedEntity || !updatedEntity.id) {
                return {
                    response: 'Entity ID is required',
                    header: 'application/json',
                    status: 400
                };
            }
            const worldEntityRepository = AppDataSource.getRepository(WorldEntity);
            const existingEntity = await worldEntityRepository.findOneBy({ id: updatedEntity.id });
            if (!existingEntity) {
                return {
                    response: 'Entity not found',
                    header: 'application/json',
                    status: 404
                };
            }

            if (existingEntity.entityImgUrl !== updatedEntity.entityImgUrl && existingEntity.entityImgUrl) {
                StorageService.deleteFile(existingEntity.entityImgUrl);
            }

            const mergedEntity = worldEntityRepository.merge(existingEntity, updatedEntity);
            const savedEntity = await worldEntityRepository.save(mergedEntity);
            return {
                response: JSON.stringify(savedEntity),
                header: 'application/json',
                status: 200
            };
        } catch (error) {
            console.error("Error editing entity:", error);
            return {
                response: 'Internal Server Error',
                header: 'application/json',
                status: 500
            };
        }
    }

    public static async editSegment(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const updatedSegment = await this.readBody<Segment>(req);
            if (!updatedSegment || !updatedSegment.id) {
                return {
                    response: 'Segment ID is required',
                    header: 'application/json',
                    status: 400
                };
            }
            const segmentRepository = AppDataSource.getRepository(Segment);
            const existingSegment = await segmentRepository.findOneBy({ id: updatedSegment.id });
            if (!existingSegment) {
                return {
                    response: 'Segment not found',
                    header: 'application/json',
                    status: 404
                };
            }
            const mergedSegment = segmentRepository.merge(existingSegment, updatedSegment);
            const savedSegment = await segmentRepository.save(mergedSegment);
            return {
                response: JSON.stringify(savedSegment),
                header: 'application/json',
                status: 200
            };
        } catch (error) {
            console.error("Error editing segment:", error);
            return {
                response: 'Internal Server Error',
                header: 'application/json',
                status: 500
            };
        }
    }

    public static async deleteSegment(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const segment = await this.readBody<Segment>(req);

            if (!segment || !segment.id) {
                return {
                    response: 'Segment ID is required',
                    header: 'application/json',
                    status: 400
                };
            }
            const segmentRepository = AppDataSource.getRepository(Segment);
            const existingSegment = await segmentRepository.findOneBy({ id: segment.id });
            if (!existingSegment) {
                return {
                    response: 'Segment not found',
                    header: 'application/json',
                    status: 404
                };
            }
            existingSegment.isActive = false;
            await segmentRepository.save(existingSegment);
            return {
                response: 'Segment deleted successfully',
                header: 'application/json',
                status: 200
            };
        } catch (error) {
            console.error("Error deleting segment:", error);
            return {
                response: 'Internal Server Error',
                header: 'application/json',
                status: 500
            };
        }
    }

    public static async addStat(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const stat = await this.readBody<Stat>(req);
            if (!stat || !stat.name || !stat.value || !stat.worldEntity || !stat.worldEntity.id) {
                return {
                    response: 'Stat name, value, and associated WorldEntity are required',
                    header: 'application/json',
                    status: 400
                };
            }

            const worldEntityRepository = AppDataSource.getRepository(WorldEntity);
            const associatedEntity = await worldEntityRepository.findOneBy({ id: stat.worldEntity.id });
            if (!associatedEntity) {
                return {
                    response: 'Associated WorldEntity not found',
                    header: 'application/json',
                    status: 404
                };
            }

            const statRepository = AppDataSource.getRepository(Stat);
            const newStat = statRepository.create(stat);
            newStat.worldEntity = associatedEntity;
            const savedStat = await statRepository.save(newStat);

            return {
                response: JSON.stringify(savedStat),
                header: 'application/json',
                status: 201
            };
        } catch (error) {
            console.error("Error adding stat:", error);
            return {
                response: 'Internal Server Error',
                header: 'application/json',
                status: 500
            };
        }
    }

    public static async editStat(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const updatedStat = await this.readBody<Stat>(req);
            if (!updatedStat || !updatedStat.id) {
                return {
                    response: 'Stat ID is required',
                    header: 'application/json',
                    status: 400
                };
            }

            const statRepository = AppDataSource.getRepository(Stat);
            const existingStat = await statRepository.findOneBy({ id: updatedStat.id });
            if (!existingStat) {
                return {
                    response: 'Stat not found',
                    header: 'application/json',
                    status: 404
                };
            }

            const mergedStat = statRepository.merge(existingStat, updatedStat);
            const savedStat = await statRepository.save(mergedStat);

            return {
                response: JSON.stringify(savedStat),
                header: 'application/json',
                status: 200
            };
        } catch (error) {
            console.error("Error editing stat:", error);
            return {
                response: 'Internal Server Error',
                header: 'application/json',
                status: 500
            };
        }
    }

    public static async deleteStat(req: http.IncomingMessage, res: http.ServerResponse) {
        try {
            const stat = await this.readBody<Stat>(req);
            if (!stat?.id) {
                return {
                    response: 'Stat ID is required',
                    header: 'application/json',
                    status: 400
                };
            }
            const statRepository = AppDataSource.getRepository(Stat);
            const existingStat = await statRepository.findOneBy({ id: stat.id });
            if (!existingStat) {
                return {
                    response: 'Stat not found',
                    header: 'application/json',
                    status: 404
                };
            }
            await statRepository.remove(existingStat);
            return {
                response: 'Stat deleted successfully',
                header: 'application/json',
                status: 200
            };
        } catch (error) {
            console.error("Error deleting stat:", error);
            return {
                response: 'Internal Server Error',
                header: 'application/json',
                status: 500
            };
        }
    }
}