import Tag from "./Tag";
import User from "./User";
import YouTubeVideo from "./YouTubeVideo";
import Category from "./Category";
import World from "./World";
import WorldEntity from "./WorldEntity";
import Segment from "./Segment";
import Comment from "./Comment";
import Stat from "./Stat";

export { default as Tag } from "./Tag";
export { default as User } from "./User";
export { default as YouTubeVideo } from "./YouTubeVideo";
export { default as Category } from "./Category";
export { default as World } from "./World";
export { default as WorldEntity } from "./WorldEntity";
export { default as Segment } from "./Segment";
export { default as Comment } from "./Comment";
export { default as Stat } from "./Stat";

const entities = {
    User,
    Tag,
    YouTubeVideo,
    Category,
    World,
    WorldEntity,
    Segment,
    Comment,
    Stat
};
export default entities;