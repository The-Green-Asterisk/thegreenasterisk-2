import el from "@elements";
import { Category } from "@entities";
import { get } from "@services/request";

export default async function categoryCtrl(categoryId: number, worldId: number) {
    const category = await get<Category>('/data/get-category', { categoryId, worldId });
    el.title.textContent = `Many Worlds: ${category.worlds[0].name} -- ${category.name}`;
}