import el, { html } from "@elements";
import { Category, Segment, World, WorldEntity } from "@entities";
import { del, put } from "@services/request";
import commentSection from "@views/commentSection/commentSection.ctrl";

export default async function worldEntityCtrl(entity: WorldEntity, category: Category, world: World) {
    el.title.textContent = `Many Worlds: ${world.name} -- ${entity.name}`;
    const commentSect = commentSection('worldEntity', entity.id);
    
    const segmentDiv = el.divs.id('entity-segments');

    const sortSegments = (segments: Segment[]) => {
        segments.sort((a, b) => a.displayOrder - b.displayOrder);
        segments.forEach((segment, index) => {
            segment.displayOrder = index + 1;
        });
    };

    const createSaveSegmentBtn = (segmentDescription: HTMLElement, segment: Segment, editBtn: HTMLButtonElement) => {
        const saveBtn = html`<button class="save-segment-btn">Save Segment</button>`;
        saveBtn.onclick = () => {
            const newDescription = segmentDescription.innerText.trim();
            if (newDescription && newDescription !== segment.description) {
                segment.description = newDescription;
                put<Segment>('/data/edit-segment', segment).then((res) => {
                    segment = res;
                }).catch(error => {
                    alert('Error updating segment: ' + error.message);
                });
            }
            segmentDescription.contentEditable = 'false';
            saveBtn.remove();
            editBtn.style.display = 'inline-block';
        };
        document.addEventListener('keydown', function handler(e) {
            if (e.key === 'Escape') {
                segmentDescription.contentEditable = 'false';
                saveBtn.remove();
                editBtn.style.display = 'inline-block';
                document.removeEventListener('keydown', handler);
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                saveBtn.click();
                editBtn.style.display = 'inline-block';
                document.removeEventListener('keydown', handler);
            }
        });
        editBtn.parentElement!.insertBefore(saveBtn, editBtn.nextSibling);
    };

    const editSegment = (segment: Segment) => (event: Event) => {
        const segmentDescription = (event.target as HTMLElement).parentElement!.querySelector('p');
        segmentDescription!.contentEditable = 'true';
        segmentDescription!.focus();
        (event.target as HTMLButtonElement).style.display = 'none';

        createSaveSegmentBtn(segmentDescription!, segment, event.target as HTMLButtonElement);
    };

    const deleteSegment = (segment: Segment) => (event: Event) => {
        if (confirm(`Are you sure you want to delete the segment "${segment.name}"? This action cannot be undone.`)) {
            del<void>('/data/delete-segment', segment).then(() => {
                entity.segments = entity.segments.filter(s => s.id !== segment.id);
                (event.target as HTMLButtonElement).parentElement!.remove();
            }).catch(error => {
                alert('Error deleting segment: ' + error.message);
            });
        }
    };

    const createSegmentElement = (segment: Segment) => {
        const displayOrder = `
            <div class="segment-order">
                <label for="display-order-${segment.id}">Order:</label>
                <input type="number" id="display-order-${segment.id}" value="${segment.displayOrder}" min="1" />
            </div>
        `;
        const segmentContent = html`
            <div class="entity-segment">
                ${el.currentUser?.isAdmin ? displayOrder : ''}
                <h3>${segment.name}</h3>
                <p>${segment.description}</p>
                ${el.currentUser?.isAdmin ? `
                    <button class="edit-segment-btn">Edit Segment</button>
                    <button class="delete-segment-btn">Delete Segment</button>
                ` : ''}

            </div>
        `;

        const displayOrderInput = segmentContent.querySelector(`#display-order-${segment.id}`) as HTMLInputElement | undefined;
        if (displayOrderInput) {
            displayOrderInput.onchange = () => {
                let newOrder = parseInt(displayOrderInput.value, 10);
                if (!isNaN(newOrder) && newOrder !== segment.displayOrder) {
                    if (newOrder < 1) newOrder = 1;
                    if (newOrder > entity.segments.length) newOrder = entity.segments.length;
                    if (newOrder === segment.displayOrder) {
                        displayOrderInput.value = segment.displayOrder.toString();
                        return;
                    };
                    if (newOrder < segment.displayOrder) {
                        entity.segments.forEach(s => {
                            if (s.id !== segment.id && s.displayOrder >= newOrder && s.displayOrder < segment.displayOrder) {
                                s.displayOrder += 1;
                            }
                        });
                    } else {
                        entity.segments.forEach(s => {
                            if (s.id !== segment.id && s.displayOrder <= newOrder && s.displayOrder > segment.displayOrder) {
                                s.displayOrder -= 1;
                            }
                        });
                    }
                    segment.displayOrder = newOrder;
                    put<Segment>('/data/edit-segment', segment).then(() => {
                        sortSegments(entity.segments);
                        segmentDiv.innerHTML = '';
                        entity.segments.forEach(createSegmentElement);

                        put<WorldEntity>('/data/edit-entity', entity).catch(error => {
                            alert('Error updating entity with new segment order: ' + error.message);
                        });
                    }).catch(error => {
                        alert('Error updating segment order: ' + error.message);
                    });

                }
            };
        }

        const editSegmentBtn = segmentContent.querySelector('.edit-segment-btn') as HTMLButtonElement | undefined;
        if (editSegmentBtn) editSegmentBtn.onclick = editSegment(segment);

        const deleteSegmentBtn = segmentContent.querySelector('.delete-segment-btn') as HTMLButtonElement | undefined;
        if (deleteSegmentBtn) deleteSegmentBtn.onclick = deleteSegment(segment);

        segmentDiv.appendChild(segmentContent);
    };

    sortSegments(entity.segments);
    entity.segments.forEach(createSegmentElement);

    if (el.currentUser?.isAdmin) {
        const editEntityDescriptionBtn = html`<i class="fas fa-pen-alt edit-entity-description" title="Edit Description"></i>`;
        editEntityDescriptionBtn.onclick = () => {
            editEntityDescriptionBtn.style.display = 'none';
            const descriptionP = el.divs.id('entity-description').querySelector('p')!;
            descriptionP.contentEditable = 'true';
            descriptionP.focus();
            const saveBtn = html`<button id="save-entity-description-btn">Save Description</button>`;
            saveBtn.onclick = () => {
                const newDescription = descriptionP.innerText.trim();
                if (newDescription && newDescription !== entity.description) {
                    entity.description = newDescription;
                    put<WorldEntity>('/data/edit-entity', entity).then((res) => {
                        entity = res;
                        descriptionP.contentEditable = 'false';
                        saveBtn.remove();
                    }).catch(error => {
                        alert('Error updating entity description: ' + error.message);
                    });
                } else {
                    descriptionP.contentEditable = 'false';
                    saveBtn.remove();
                }
                editEntityDescriptionBtn.style.display = 'inline-block';
            };
            document.addEventListener('keydown', function handler(e) {
                if (e.key === 'Escape') {
                    descriptionP.contentEditable = 'false';
                    saveBtn.remove();
                    editEntityDescriptionBtn.style.display = 'inline-block';
                    document.removeEventListener('keydown', handler);
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveBtn.click();
                    editEntityDescriptionBtn.style.display = 'inline-block';
                    document.removeEventListener('keydown', handler);
                }
            });
            descriptionP.parentElement!.appendChild(saveBtn);
        };
        el.divs.id('entity-description').appendChild(editEntityDescriptionBtn);

        const editShortDescBtn = html`<button id="edit-short-description-btn">Edit Short Description</button>`;
        editShortDescBtn.onclick = () => {
            const newShortDesc = prompt('Enter new short description:', entity.shortDescription) || entity.shortDescription;
            if (newShortDesc && newShortDesc !== entity.shortDescription) {
                entity.shortDescription = newShortDesc;
                put<WorldEntity>('/data/edit-entity', entity).then((res) => {
                    entity = res;
                }).catch(error => {
                    alert('Error updating short description: ' + error.message);
                });
            }
        };
        el.divs.id('entity-description').insertAdjacentElement('afterend', editShortDescBtn);

        const addSegmentBtn = html`<button id="add-segment-btn">Add Segment</button>`;
        addSegmentBtn.onclick = () => {
            const segmentName = prompt('Enter segment name:')?.trim();
            if (segmentName) {
                const newSegment = new Segment(segmentName, '', entity.segments.length + 1);
                entity.segments.push(newSegment);
                put<WorldEntity>('/data/edit-entity', entity).then((res) => {
                    entity = res;
                    newSegment.id = entity.segments[entity.segments.length - 1].id;
                    createSegmentElement(newSegment);
                }).catch(error => {
                    alert('Error adding new segment: ' + error.message);
                    console.error(error);
                });
            }
        };
        segmentDiv.appendChild(addSegmentBtn);
    }
}