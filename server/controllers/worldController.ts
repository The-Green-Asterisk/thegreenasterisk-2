import http from "http";
import AppDataSource from "services/database";
import { Category } from "services/database/entity/Category";
import { World } from "services/database/entity/World";
import { WorldEntity } from "services/database/entity/WorldEntity";
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
                response: JSON.stringify({ error: 'Internal Server Error' }),
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
                response: JSON.stringify({ error: 'Internal Server Error' }),
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
                    response: JSON.stringify({ error: 'World ID is required' }),
                    header: 'application/json',
                    status: 400
                };
            }
            const worldRepository = AppDataSource.getRepository(World);
            const existingWorld = await worldRepository.findOneBy({ id: updatedWorld.id });
            if (!existingWorld) {
                return {
                    response: JSON.stringify({ error: 'World not found' }),
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
                response: JSON.stringify({ error: 'Internal Server Error' }),
                header: 'application/json',
                status: 500
            };
        }
    }

    public static async getCategories(req: http.IncomingMessage, res: http.ServerResponse) {
        const { worldId } = this.parseUrlQuery(req.url);
        if (!worldId || isNaN(Number(worldId)) || Array.isArray(worldId)) {
            return {
                response: JSON.stringify({ error: 'Invalid worldId parameter' }),
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
                response: JSON.stringify({ error: 'Internal Server Error' }),
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
                    response: JSON.stringify({ error: 'Category name is required' }),
                    header: 'application/json',
                    status: 400
                };
            }
            if (!newCategory.worlds || newCategory.worlds.length === 0) {
                return {
                    response: JSON.stringify({ error: 'At least one world must be associated with the category' }),
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
                response: JSON.stringify({ error: 'Internal Server Error' }),
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
                response: JSON.stringify({ error: 'Invalid categoryId or worldId parameter' }),
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
                    response: JSON.stringify({ error: 'Category not found' }),
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
                response: JSON.stringify({ error: 'Internal Server Error' }),
                header: 'application/json',
                status: 500
            };
        }
    }
}