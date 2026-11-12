import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from "typeorm";
import { sanitizeUserContent } from "../userContent";

/**
 * Runs the user-content sanitizer on every save and every load of the entities in USER_CONTENT_FIELDS, so no
 * controller can forget it and rows stored before it existed are cleaned on the way out. A subscriber, unlike
 * entity listeners, also sees plain objects passed to save().
 */
@EventSubscriber()
export class UserContentSubscriber implements EntitySubscriberInterface {
    beforeInsert(event: InsertEvent<any>) {
        sanitizeUserContent(event.metadata.targetName, event.entity);
    }

    beforeUpdate(event: UpdateEvent<any>) {
        sanitizeUserContent(event.metadata.targetName, event.entity as Record<string, unknown> | undefined);
    }

    afterLoad(entity: any, event?: { metadata?: { targetName?: string } }) {
        const name = event?.metadata?.targetName ?? entity?.constructor?.name;
        if (name) sanitizeUserContent(name, entity);
    }
}
