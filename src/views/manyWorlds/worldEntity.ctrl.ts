import el from "@elements";
import { get } from "@services/request";
import { WorldEntity } from "../../entities/WorldEntity";

export default async function worldEntityCtrl(entityId: number, categoryId: number, worldId: number) {
    const worldEntity = await get<WorldEntity>('/data/get-world-entity', { entityId, categoryId, worldId });
    el.title.textContent = `Many Worlds: ${worldEntity.worlds[0].name} -- ${worldEntity.name}`;
}