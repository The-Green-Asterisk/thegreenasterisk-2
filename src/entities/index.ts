import Category from "./Category";
import Comment from "./Comment";
import Item from "./Item";
import Segment from "./Segment";
import Spell from "./Spell";
import Stat from "./Stat";
import Tag from "./Tag";
import User from "./User";
import World from "./World";
import WorldEntity from "./WorldEntity";
import YouTubeVideo from "./YouTubeVideo";

export { default as Category } from "./Category";
export { default as Comment } from "./Comment";
export { default as Item } from "./Item";
export { default as Segment } from "./Segment";
export { default as Spell } from "./Spell";
export { default as Stat } from "./Stat";
export { default as Tag } from "./Tag";
export { default as User } from "./User";
export { default as World } from "./World";
export { default as WorldEntity } from "./WorldEntity";
export { default as YouTubeVideo } from "./YouTubeVideo";

const entities = {
    User,
    Tag,
    YouTubeVideo,
    Category,
    World,
    WorldEntity,
    Segment,
    Comment,
    Stat,
    Spell,
    Item
};
export default entities;