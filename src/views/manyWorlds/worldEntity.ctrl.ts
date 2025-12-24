import el, { html } from "@elements";
import { Category, Segment, User, World, WorldEntity } from "@entities";
import FileService from "@services/fileService";
import { del, get, post, put } from "@services/request";
import commentSection from "@views/commentSection/commentSection.ctrl";
import Stat from "../../entities/Stat";

export default async function worldEntityCtrl(entity: WorldEntity, category: Category, world: World) {
    el.title.textContent = `Many Worlds: ${world.name} -- ${entity.name}`;
    const commentSect = commentSection('worldEntity', entity.id);
    
    const segmentDiv = el.divs.id('entity-segments')!;

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
                segment.description = newDescription.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
                put<Segment>('/data/edit-segment', segment).then((res) => {
                    segment = res;
                }).catch(error => {
                    alert('Error updating segment: ' + error);
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
            if (e.key === 'Enter' && e.shiftKey) {
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
                alert('Error deleting segment: ' + error);
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
                            alert('Error updating entity with new segment order: ' + error);
                        });
                    }).catch(error => {
                        alert('Error updating segment order: ' + error);
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

    const entityStatsDiv = el.divs.id('entity-stats')!;
    const statsList = entityStatsDiv.querySelector('ul')!;
    entityStatsDiv.appendChild(statsList);

    if (entity.stats.length > 0) {
        statsList.innerHTML = ''
        entity.stats.forEach(stat => {
            const statItem = buildStatItem(stat);
            statsList.appendChild(statItem);
        });
    } else {
        statsList.appendChild(html`<li id="no-stats-msg">This Entity Has No Stats</li>`);
    }

    sortSegments(entity.segments);
    entity.segments.forEach(createSegmentElement);

    if (entity.entityImgUrl) {
        el.imgs.id('entity-thumbnail')!.title = 'Click to enlarge image';
        el.setLightBox();
    }

    if (el.currentUser?.isAdmin || entity.editors.find(e => e.id === el.currentUser?.id)) {
        const editEntityDescriptionBtn = html`<i class="fas fa-pencil edit-entity-description" title="Edit Description"></i>`;
        editEntityDescriptionBtn.onclick = () => {
            editEntityDescriptionBtn.style.display = 'none';
            const descriptionP = el.divs.id('entity-description')!.querySelector('p')!;
            descriptionP.contentEditable = 'true';
            descriptionP.focus();
            const saveBtn = html`<button id="save-entity-description-btn">Save Description</button>`;
            saveBtn.onclick = () => {
                const newDescription = descriptionP.innerText.trim();
                if (newDescription && newDescription !== entity.description) {
                    entity.description = newDescription.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
                    put<WorldEntity>('/data/edit-entity', entity).then((res) => {
                        entity = res;
                        descriptionP.contentEditable = 'false';
                        saveBtn.remove();
                    }).catch(error => {
                        alert('Error updating entity description: ' + error);
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
                if (e.key === 'Enter' && e.shiftKey) {
                    e.preventDefault();
                    saveBtn.click();
                    editEntityDescriptionBtn.style.display = 'inline-block';
                    document.removeEventListener('keydown', handler);
                }
            });
            descriptionP.parentElement!.appendChild(saveBtn);
        };
        el.divs.id('entity-description')!.appendChild(editEntityDescriptionBtn);

        const editShortDescBtn = html`<button id="edit-short-description-btn">Edit Short Description</button>`;
        editShortDescBtn.onclick = () => {
            const newShortDesc = prompt('Enter new short description:', entity.shortDescription) || entity.shortDescription;
            if (newShortDesc && newShortDesc !== entity.shortDescription) {
                entity.shortDescription = newShortDesc.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
                put<WorldEntity>('/data/edit-entity', entity).then((res) => {
                    entity = res;
                }).catch(error => {
                    alert('Error updating short description: ' + error);
                });
            }
        };
        el.divs.id('entity-description')!.insertAdjacentElement('afterend', editShortDescBtn);

        const addSegmentBtn = html`<button id="add-segment-btn">Add Segment</button>`;
        addSegmentBtn.onclick = () => {
            const segmentName = prompt('Enter segment name:')?.trim();
            if (segmentName) {
                const newSegment = new Segment(segmentName.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ''), '', entity.segments.length + 1);
                entity.segments.push(newSegment);
                put<WorldEntity>('/data/edit-entity', entity).then((res) => {
                    entity = res;
                    newSegment.id = res.segments[res.segments.length - 1].id;
                    createSegmentElement(newSegment);
                }).catch(error => {
                    alert('Error adding new segment: ' + error);
                    console.error(error);
                });
            }
        };
        segmentDiv.appendChild(addSegmentBtn);
        
        const addStatBtn = html`<button id="add-stat-btn">Add Stat</button>`;
        addStatBtn.onclick = () => {
            const statName = prompt('Enter stat name:')?.trim().replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
            const statValue = prompt('Enter stat value:')?.trim().replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
            if (statName && statValue) {
                post<Stat>('/data/add-stat', new Stat(statName, statValue, true, entity)).then(response => {
                    const noStatsMessage = statsList.querySelector('#no-stats-msg');
                    if (noStatsMessage) noStatsMessage.remove();
                    entity.stats.push(response);
                    const statItem = buildStatItem(response);
                    statsList.appendChild(statItem);
                }).catch(error => {
                    alert('Error creating stat: ' + error);
                });
            } else {
                alert('Stat name and value are required to add a new stat.');
            }
        };
        entityStatsDiv.appendChild(addStatBtn);

        const entityThumbnail = el.imgs.id('entity-thumbnail')!;
        if (!entity.entityImgUrl) {
            entityThumbnail.title = 'Click to change entity image';
            entityThumbnail.onclick = () => uploadImage(entity, entityThumbnail);
        }

        const removeImageBtn = html`<button id="remove-entity-image-btn">Remove Image</button>`;
        removeImageBtn.onclick = () => {
            if (!entity.entityImgUrl) {
                alert('No entity image to remove.');
                return;
            }
            if (confirm('Are you sure you want to remove the entity image?')) {
                entity.entityImgUrl = '';
                put<WorldEntity>('/data/edit-entity', entity).then((res) => {
                    entity = res;
                    entityThumbnail.src = '/storage/images/default-thumbnail.jpg';
                    entityThumbnail.style.cursor = 'pointer';
                    entityThumbnail.title = 'Click to change entity image';
                    entityThumbnail.onclick = () => uploadImage(entity, entityThumbnail);
                }).catch(error => {
                    alert('Error removing entity image: ' + error);
                });
            }
        };
        entityThumbnail.insertAdjacentElement('afterend', removeImageBtn);

        if (el.currentUser?.isAdmin) {
            // add multiple selection for editors
            let allUsers: User[] = [];
            const editEditors = html`<select multiple id="edit-entity-editors"></select>` as HTMLSelectElement;
            get<User[]>('/data/get-all-users').then(allUsersRes => {
                allUsers = allUsersRes;
                allUsers.forEach(user => {
                    const option = html`<option value="${user.id}">${user.firstName} ${user.lastName} (${user.username})</option>` as HTMLOptionElement;
                    if (entity.editors.find(e => e.id === user.id)) {
                        option.selected = true;
                    }
                    editEditors.appendChild(option);
                });
            }).catch(error => {
                alert('Error fetching users for editors list: ' + error);
            });
            editEditors.onchange = () => {
                const selectedOptions = Array.from(editEditors.selectedOptions).map(option => Number(option.value));
                const selectedUsers = selectedOptions.map(id => {
                    return allUsers.find(user => user.id === id);
                }).filter(user => user !== undefined) as User[];
                entity.editors = selectedUsers;
                put<WorldEntity>('/data/edit-entity', entity).then((res) => {
                    entity = res;
                }).catch(error => {
                    alert('Error updating entity editors: ' + error);
                });
            }

            entityStatsDiv.appendChild(html`<label for="edit-entity-editors" style="display:block;width:100%">Entity Editors:</label>`);

            entityStatsDiv.appendChild(editEditors);
        }
    }
}

const buildStatItem = (stat: Stat) => {
    const statElement = html`
        <li>
            <span><b>${stat.name}:</b> ${stat.value}</span>
            ${el.currentUser?.isAdmin ? `
                <span>
                    <span class="fa fa-pencil" title="Edit Stat" style="cursor: pointer;"></span>
                    <span class="fa fa-times" title="Delete Stat" style="cursor: pointer;"></span>
                </span>
            ` : ''}
        </li>
    `;

    if (el.currentUser?.isAdmin) {
        const editBtn = statElement.querySelector('.fa-pencil') as HTMLElement;
        editBtn.onclick = () => {
            const newName = prompt('Enter new stat name:', stat.name)?.trim();
            const newValue = prompt('Enter new stat value:', stat.value)?.trim();
            if (newName && newValue && (newName !== stat.name || newValue !== stat.value)) {
                stat.name = newName.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
                stat.value = newValue.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
                put<Stat>('/data/edit-stat', stat).then((res) => {
                    stat = res;
                    statElement.querySelector('span')!.innerHTML = `<b>${stat.name}:</b> ${stat.value}`;
                }).catch(error => {
                    alert('Error updating stat: ' + error);
                });
            }
        };

        const deleteBtn = statElement.querySelector('.fa-times') as HTMLElement;
        deleteBtn.onclick = () => {
            if (confirm(`Are you sure you want to delete the stat "${stat.name}"? This action cannot be undone.`)) {
                del<void>('/data/delete-stat', stat).then(() => {
                    statElement.parentElement!.querySelectorAll('li').length === 1 &&
                    statElement.parentElement!.appendChild(html`<li id="no-stats-msg">This Entity Has No Stats</li>`);
                    statElement.remove();
                }).catch(error => {
                    alert('Error deleting stat: ' + error);
                });
            }
        };
    }

    return statElement;
}

const uploadImage = (entity: WorldEntity, entityThumbnail: HTMLImageElement) => {
    const fileInput = html`<input type="file" accept="image/*" style="display: none;" />` as HTMLInputElement;
    document.body.appendChild(fileInput);
    fileInput.onchange = () => {
        const file = fileInput.files ? fileInput.files[0] : null;
        if (file) {
            FileService.uploadFile(file, 'images').then(filePath => {
                entity.entityImgUrl = filePath;
                put<WorldEntity>('/data/edit-entity', entity).then((res) => {
                    entity = res;
                    entityThumbnail.src = entity.entityImgUrl;
                    entityThumbnail.title = 'Click to elarge image';
                    el.setLightBox();
                }).catch(error => {
                    alert('Error updating entity with new image URL: ' + error);
                });
            }).catch(error => {
                alert('Error uploading image: ' + error);
            });
        } else {
            alert('No file selected.');
        }
        document.body.removeChild(fileInput);
    };
    fileInput.click();
};