import { getData, postData } from "@services/request";
import { SpellDefinition } from "../characterData";
import { CharacterSheetContext } from "./context";

export function initModalsController(ctx: CharacterSheetContext) {
    const sheet = ctx.sheet;

    // Spell modal elements
    const modalBackdrop = sheet.querySelector<HTMLElement>("#spell-modal-container");
    const modalCloseBtn = sheet.querySelector<HTMLButtonElement>("#spell-modal-close-btn");
    const modalActionCloseBtn = sheet.querySelector<HTMLButtonElement>("#modal-close-action-btn");
    const modalSpellName = sheet.querySelector<HTMLElement>("#modal-spell-name");
    const modalSpellType = sheet.querySelector<HTMLElement>("#modal-spell-type");
    const modalBadges = sheet.querySelector<HTMLElement>("#modal-badges");
    const modalCastingTime = sheet.querySelector<HTMLElement>("#modal-casting-time");
    const modalRange = sheet.querySelector<HTMLElement>("#modal-range");
    const modalDuration = sheet.querySelector<HTMLElement>("#modal-duration");
    const modalComponents = sheet.querySelector<HTMLElement>("#modal-components");
    const modalSpellImageWrap = sheet.querySelector<HTMLElement>("#modal-spell-image-wrap");
    const modalSpellImage = sheet.querySelector<HTMLImageElement>("#modal-spell-image");
    const modalDescription = sheet.querySelector<HTMLElement>("#modal-spell-description");
    const modalSource = sheet.querySelector<HTMLElement>("#modal-spell-source");

    // Item modal elements
    const itemModalBackdrop = sheet.querySelector<HTMLElement>("#item-modal-container");
    const itemModalCloseBtn = sheet.querySelector<HTMLButtonElement>("#item-modal-close-btn");
    const itemModalCloseActionBtn = sheet.querySelector<HTMLButtonElement>("#modal-item-close-action-btn");
    const modalItemName = sheet.querySelector<HTMLElement>("#modal-item-name");
    const modalItemType = sheet.querySelector<HTMLElement>("#modal-item-type");
    const modalItemBadges = sheet.querySelector<HTMLElement>("#modal-item-badges");
    const modalItemDamage = sheet.querySelector<HTMLElement>("#modal-item-damage");
    const modalItemRange = sheet.querySelector<HTMLElement>("#modal-item-range");
    const modalItemProps = sheet.querySelector<HTMLElement>("#modal-item-properties");
    const modalItemWeight = sheet.querySelector<HTMLElement>("#modal-item-weight");
    const modalItemImageWrap = sheet.querySelector<HTMLElement>("#modal-item-image-wrap");
    const modalItemImage = sheet.querySelector<HTMLImageElement>("#modal-item-image");
    const modalItemDescription = sheet.querySelector<HTMLElement>("#modal-item-description");
    const modalItemSource = sheet.querySelector<HTMLElement>("#modal-item-source");

    // Action modal elements
    const actionModalBackdrop = sheet.querySelector<HTMLElement>("#action-modal-container");
    const actionModalCloseBtn = sheet.querySelector<HTMLButtonElement>("#action-modal-close-btn");
    const actionModalCloseActionBtn = sheet.querySelector<HTMLButtonElement>("#modal-action-close-action-btn");
    const modalActionName = sheet.querySelector<HTMLElement>("#modal-action-name");
    const modalActionType = sheet.querySelector<HTMLElement>("#modal-action-type");
    const modalActionRange = sheet.querySelector<HTMLElement>("#modal-action-range");
    const modalActionHitDc = sheet.querySelector<HTMLElement>("#modal-action-hit-dc");
    const modalActionDamage = sheet.querySelector<HTMLElement>("#modal-action-damage");
    const modalActionNotes = sheet.querySelector<HTMLElement>("#modal-action-notes");

    // Custom spell modal elements
    const customSpellModal = sheet.querySelector<HTMLElement>("#custom-spell-modal-container");
    const customSpellCloseBtn = sheet.querySelector<HTMLButtonElement>("#custom-spell-close-btn");
    const customSpellCancelBtn = sheet.querySelector<HTMLButtonElement>("#custom-spell-cancel-btn");
    const customSpellForm = sheet.querySelector<HTMLFormElement>("#custom-spell-form");
    const customSpellStatus = sheet.querySelector<HTMLElement>("#custom-spell-status");

    function showCustomSpellStatus(message: string, isError = false) {
        if (!customSpellStatus) return;
        customSpellStatus.textContent = message;
        customSpellStatus.className = `status-msg ${isError ? 'error' : 'success'}`;
        customSpellStatus.classList.remove("hidden");
    }

    async function openSpellModal(spellName: string, spellId?: number | string) {
        const decodedName = decodeURIComponent(spellName).trim();
        const localSpell = ctx.spellMap.get(decodedName.toLowerCase());
        if (!modalBackdrop) return;

        const displayName = localSpell ? localSpell.name : decodedName;
        const displaySchool = localSpell?.school || "Universal";
        const displayLvl = localSpell ? (localSpell.level === 0 ? "Cantrip" : `Level ${localSpell.level}`) : "Spell";

        if (modalSpellName) modalSpellName.textContent = displayName;
        if (modalSpellType) modalSpellType.textContent = `${displayLvl} • ${displaySchool}`;

        if (modalBadges) {
            let badgesHtml = `<span class="modal-badge school-badge">${displaySchool}</span>`;
            if (localSpell?.source) badgesHtml += `<span class="modal-badge source-badge">${localSpell.source}</span>`;
            if (localSpell?.concentration) {
                badgesHtml += `<span class="modal-badge conc-badge"><i class="fa-solid fa-brain"></i> Concentration</span>`;
            }
            if (localSpell?.ritual) {
                badgesHtml += `<span class="modal-badge ritual-badge"><i class="fa-solid fa-book"></i> Ritual</span>`;
            }
            modalBadges.innerHTML = badgesHtml;
        }

        if (modalCastingTime) modalCastingTime.textContent = localSpell?.castingTime || "1 Action";
        if (modalRange) modalRange.textContent = localSpell?.range || "Self / Touch / Ranged";
        if (modalDuration) modalDuration.textContent = localSpell?.duration || "Instantaneous";
        if (modalComponents) modalComponents.textContent = localSpell?.components || "V, S";

        const initialSpellImg = localSpell?.imageUrl;
        if (modalSpellImage && modalSpellImageWrap) {
            if (initialSpellImg) {
                modalSpellImage.src = initialSpellImg;
                modalSpellImage.alt = displayName;
                modalSpellImageWrap.classList.remove("hidden");
            } else {
                modalSpellImage.src = "";
                modalSpellImageWrap.classList.add("hidden");
            }
        }

        if (modalSource) modalSource.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Loading independent spell info...`;
        if (modalDescription) modalDescription.innerHTML = localSpell ? localSpell.description : "<p><em>Loading spell details...</em></p>";

        modalBackdrop.classList.remove("hidden");
        modalBackdrop.classList.add("visible");
        modalBackdrop.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        modalCloseBtn?.focus();

        try {
            const spellQuery = new URLSearchParams();
            spellQuery.set("name", decodedName);
            if (spellId !== undefined && spellId !== null && String(spellId).trim() !== "") {
                spellQuery.set("id", String(spellId));
            }
            spellQuery.set("preferRules2024", ctx.prefer2024Rules.value ? "1" : "0");

            const independentResponse = await getData<any>(`/get-spell?${spellQuery.toString()}`);
            const independentSpell = independentResponse?.spell || independentResponse;
            const spellSourceTier = independentResponse?.sourceTier || independentSpell?.sourceTier || "Database";

            if (independentSpell && independentSpell.name) {
                if (modalSpellName) modalSpellName.textContent = independentSpell.name;
                const levelStr = independentSpell.level === 0 ? "Cantrip" : `Level ${independentSpell.level}`;
                if (modalSpellType) modalSpellType.textContent = `${levelStr} • ${independentSpell.school || displaySchool}`;

                if (modalBadges) {
                    let badges = `<span class="modal-badge school-badge">${independentSpell.school || displaySchool}</span>`;
                    badges += `<span class="modal-badge tier-badge tier-${String(spellSourceTier).toLowerCase().replace(/[^a-z0-9]/g, '-')}"><i class="fa-solid fa-database"></i> Source: ${spellSourceTier}</span>`;
                    if (independentSpell.concentration) {
                        badges += `<span class="modal-badge conc-badge"><i class="fa-solid fa-brain"></i> Concentration</span>`;
                    }
                    if (independentSpell.ritual) {
                        badges += `<span class="modal-badge ritual-badge"><i class="fa-solid fa-book"></i> Ritual</span>`;
                    }
                    modalBadges.innerHTML = badges;
                }

                if (modalCastingTime) modalCastingTime.textContent = independentSpell.castingTime || localSpell?.castingTime || "1 Action";
                if (modalRange) modalRange.textContent = independentSpell.range || localSpell?.range || "60 ft.";
                if (modalDuration) modalDuration.textContent = independentSpell.duration || localSpell?.duration || "Instantaneous";
                if (modalComponents) modalComponents.textContent = independentSpell.components || localSpell?.components || "V, S";
                if (modalDescription && independentSpell.description) modalDescription.innerHTML = independentSpell.description;

                const finalImg = independentSpell.imageUrl || initialSpellImg;
                if (modalSpellImage && modalSpellImageWrap) {
                    if (finalImg) {
                        modalSpellImage.src = finalImg;
                        modalSpellImage.alt = independentSpell.name;
                        modalSpellImageWrap.classList.remove("hidden");
                    } else {
                        modalSpellImage.src = "";
                        modalSpellImageWrap.classList.add("hidden");
                    }
                }

                if (modalSource) {
                    modalSource.innerHTML = `<strong>Source Tier:</strong> ${spellSourceTier || 'Local Database'} • <em>${independentSpell.source || 'SRD / Custom'}</em>`;
                }

                if (localSpell) {
                    localSpell.description = independentSpell.description;
                    localSpell.castingTime = independentSpell.castingTime || localSpell.castingTime;
                    localSpell.range = independentSpell.range || localSpell.range;
                    localSpell.duration = independentSpell.duration || localSpell.duration;
                    localSpell.components = independentSpell.components || localSpell.components;
                    if (finalImg) localSpell.imageUrl = finalImg;
                }
            }
        } catch (err) {
            console.warn("Could not fetch independent spell payload, kept initial payload:", err);
            if (modalSource) modalSource.textContent = `Source: Initial Character Payload (${localSpell?.source || 'Character'})`;
        }
    }

    function closeSpellModal() {
        if (!modalBackdrop) return;
        modalBackdrop.classList.remove("visible");
        modalBackdrop.classList.add("hidden");
        modalBackdrop.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function openCustomSpellModal() {
        if (!customSpellModal) return;
        if (customSpellStatus) {
            customSpellStatus.className = "status-msg hidden";
            customSpellStatus.textContent = "";
        }
        customSpellModal.classList.remove("hidden");
        customSpellModal.classList.add("visible");
        customSpellModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        sheet.querySelector<HTMLInputElement>("#custom-spell-name")?.focus();
    }

    function closeCustomSpellModal() {
        if (!customSpellModal) return;
        customSpellModal.classList.remove("visible");
        customSpellModal.classList.add("hidden");
        customSpellModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    async function openItemModal(itemName: string, itemId?: number | string, itemType?: string) {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter) return;
        const decodedName = decodeURIComponent(itemName).trim();
        if (!itemModalBackdrop) return;

        const localWeapon = activeCharacter.weapons?.find(w => w.name.toLowerCase() === decodedName.toLowerCase());
        const localEquipment = activeCharacter.equipment.find(e => e.name.toLowerCase() === decodedName.toLowerCase());

        const displayName = localWeapon?.name || localEquipment?.name || decodedName;
        const displayType = localWeapon ? localWeapon.category : (localEquipment?.type || itemType || "Equipment");
        const displayRarity = localWeapon?.rarity || localEquipment?.rarity || "Common";
        const isMagic = !!(localWeapon?.isMagic || localEquipment?.isMagic);

        if (modalItemName) modalItemName.textContent = displayName;
        if (modalItemType) modalItemType.textContent = displayType;

        if (modalItemBadges) {
            let badges = `<span class="modal-badge school-badge">${displayType}</span>`;
            if (displayRarity && displayRarity !== "Common") {
                badges += `<span class="modal-badge rarity-badge">${displayRarity}</span>`;
            }
            if (isMagic) {
                badges += `<span class="modal-badge magic-badge"><i class="fa-solid fa-wand-sparkles"></i> Magic</span>`;
            }
            if (localWeapon?.mastery) {
                badges += `<span class="modal-badge mastery-badge ${localWeapon.mastery.unlocked ? 'unlocked' : ''}"><i class="fa-solid fa-burst"></i> Mastery: ${localWeapon.mastery.name}</span>`;
            }
            modalItemBadges.innerHTML = badges;
        }

        if (modalItemDamage) modalItemDamage.textContent = localWeapon?.damage || "—";
        if (modalItemRange) modalItemRange.textContent = localWeapon?.range || "—";
        if (modalItemProps) modalItemProps.textContent = localWeapon?.properties?.length ? localWeapon.properties.join(", ") : "—";
        if (modalItemWeight) modalItemWeight.textContent = localEquipment?.notes ? localEquipment.notes : "—";

        const initialItemImg = localWeapon?.imageUrl || localEquipment?.imageUrl;
        if (modalItemImage && modalItemImageWrap) {
            if (initialItemImg) {
                modalItemImage.src = initialItemImg;
                modalItemImage.alt = displayName;
                modalItemImageWrap.classList.remove("hidden");
            } else {
                modalItemImage.src = "";
                modalItemImageWrap.classList.add("hidden");
            }
        }

        const localDesc = localWeapon?.description || localEquipment?.description || localWeapon?.notes || localEquipment?.notes;
        if (modalItemDescription) {
            modalItemDescription.innerHTML = localDesc
                ? (localDesc.startsWith("<") ? localDesc : `<p>${localDesc}</p>`)
                : "<p><em>Loading item details...</em></p>";
        }
        if (modalItemSource) {
            modalItemSource.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Loading independent item info...`;
        }

        itemModalBackdrop.classList.remove("hidden");
        itemModalBackdrop.classList.add("visible");
        itemModalBackdrop.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        itemModalCloseBtn?.focus();

        try {
            const queryParams = new URLSearchParams();
            queryParams.set("name", decodedName);
            if (itemId) queryParams.set("id", String(itemId));
            if (itemType) queryParams.set("type", itemType);
            queryParams.set("preferRules2024", ctx.prefer2024Rules.value ? "1" : "0");

            const independentRes = await getData<any>(`/get-item?${queryParams.toString()}`);
            const itemObj = independentRes?.item || independentRes;

            if (itemObj && itemObj.name) {
                if (modalItemName) modalItemName.textContent = itemObj.name;
                if (modalItemType) modalItemType.textContent = itemObj.category || itemObj.filterType || displayType;

                if (modalItemBadges) {
                    let badges = `<span class="modal-badge school-badge">${itemObj.category || itemObj.filterType || displayType}</span>`;
                    const sourceTier = independentRes.sourceTier || (itemObj.isCustom ? 'Custom Database' : 'Database');
                    badges += `<span class="modal-badge tier-badge tier-${sourceTier.toLowerCase().replace(/[^a-z0-9]/g, '-')}"><i class="fa-solid fa-database"></i> Source: ${sourceTier}</span>`;
                    if (itemObj.rarity && itemObj.rarity !== 'Common') {
                        badges += `<span class="modal-badge rarity-badge">${itemObj.rarity}</span>`;
                    }
                    if (itemObj.isMagic) {
                        badges += `<span class="modal-badge magic-badge"><i class="fa-solid fa-wand-sparkles"></i> Magic</span>`;
                    }
                    if (itemObj.mastery) {
                        badges += `<span class="modal-badge mastery-badge unlocked"><i class="fa-solid fa-burst"></i> Mastery: ${itemObj.mastery}</span>`;
                    }
                    modalItemBadges.innerHTML = badges;
                }

                if (modalItemDamage && itemObj.damage) modalItemDamage.textContent = itemObj.damage;
                if (modalItemRange && itemObj.range) modalItemRange.textContent = itemObj.range;
                if (modalItemProps && itemObj.properties) modalItemProps.textContent = itemObj.properties;
                if (modalItemWeight) {
                    const weightStr = itemObj.weight ? `${itemObj.weight} lb.` : '';
                    const costStr = itemObj.cost ? `${itemObj.cost} gp` : '';
                    modalItemWeight.textContent = [weightStr, costStr].filter(Boolean).join(" • ") || "—";
                }

                if (modalItemDescription && itemObj.description) {
                    modalItemDescription.innerHTML = itemObj.description.startsWith("<")
                        ? itemObj.description
                        : `<p>${itemObj.description}</p>`;
                }

                const finalItemImg = itemObj.imageUrl || initialItemImg;
                if (modalItemImage && modalItemImageWrap) {
                    if (finalItemImg) {
                        modalItemImage.src = finalItemImg;
                        modalItemImage.alt = itemObj.name;
                        modalItemImageWrap.classList.remove("hidden");
                    } else {
                        modalItemImage.src = "";
                        modalItemImageWrap.classList.add("hidden");
                    }
                }

                if (modalItemSource) {
                    modalItemSource.innerHTML = `<strong>Source Tier:</strong> ${independentRes.sourceTier || 'Local Database'} • <em>${itemObj.source || 'Standard / SRD'}</em>`;
                }

                if (localWeapon && finalItemImg) localWeapon.imageUrl = finalItemImg;
                if (localEquipment && finalItemImg) localEquipment.imageUrl = finalItemImg;
            }
        } catch (err) {
            console.warn("Could not fetch independent item payload, kept local data:", err);
            if (modalItemSource) {
                modalItemSource.textContent = `Source: Initial Character Payload (${localWeapon ? 'Weapon' : 'Inventory'})`;
            }
        }
    }

    function closeItemModal() {
        if (!itemModalBackdrop) return;
        itemModalBackdrop.classList.remove("visible");
        itemModalBackdrop.classList.add("hidden");
        itemModalBackdrop.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function openActionModal(actionIndex: number) {
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter || !actionModalBackdrop) return;
        const action = activeCharacter.actions?.[actionIndex];
        if (!action) return;

        const renderActionNotesHtml = (rawNotesInput: string): string => {
            const rawNotes = (rawNotesInput || "").trim();
            if (!rawNotes) return "<p>No additional details.</p>";

            const spellButtons: string[] = [];
            const tokenized = rawNotes.replace(/\[spells\]([\s\S]*?)\[\/spells\]/gi, (_match, spellNameRaw: string) => {
                const spellName = (spellNameRaw || "").trim();
                if (!spellName) return "";
                const encodedSpellName = encodeURIComponent(spellName);
                const escapedLabel = spellName
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/\"/g, "&quot;")
                    .replace(/'/g, "&#39;");
                const buttonHtml = `<button type="button" class="action-spell-link inline-spell-link" data-spell-name="${encodedSpellName}" title="Click to view spell details"><i class="fa-solid fa-wand-magic-sparkles"></i> ${escapedLabel}</button>`;
                const token = `__SPELL_LINK_TOKEN_${spellButtons.length}__`;
                spellButtons.push(buttonHtml);
                return token;
            });

            const hasHtml = /<[a-z][\s\S]*>/i.test(tokenized);
            let html = hasHtml
                ? tokenized
                : `<p>${tokenized
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/\"/g, "&quot;")
                    .replace(/'/g, "&#39;")
                    .replace(/\n/g, "<br />")}</p>`;

            spellButtons.forEach((buttonHtml, index) => {
                html = html.replaceAll(`__SPELL_LINK_TOKEN_${index}__`, buttonHtml);
            });

            return html;
        };

        if (modalActionName) modalActionName.textContent = action.name || "Action";
        if (modalActionType) modalActionType.textContent = action.type || "Action";
        if (modalActionRange) modalActionRange.textContent = action.rangeOrReach || "—";
        if (modalActionHitDc) modalActionHitDc.textContent = action.hitOrDc || "—";
        if (modalActionDamage) modalActionDamage.textContent = action.damageOrEffect || "—";
        if (modalActionNotes) {
            modalActionNotes.innerHTML = renderActionNotesHtml(action.notes || "");
            modalActionNotes.querySelectorAll<HTMLButtonElement>(".inline-spell-link[data-spell-name]").forEach(btn => {
                const spellName = btn.getAttribute("data-spell-name");
                if (!spellName) return;

                btn.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    closeActionModal();
                    void openSpellModal(spellName);
                });

                btn.addEventListener("keydown", (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        closeActionModal();
                        void openSpellModal(spellName);
                    }
                });
            });
        }

        actionModalBackdrop.classList.remove("hidden");
        actionModalBackdrop.classList.add("visible");
        actionModalBackdrop.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        actionModalCloseBtn?.focus();
    }

    function closeActionModal() {
        if (!actionModalBackdrop) return;
        actionModalBackdrop.classList.remove("visible");
        actionModalBackdrop.classList.add("hidden");
        actionModalBackdrop.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    // Attach open/close functions to ctx
    ctx.openSpellModal = openSpellModal;
    ctx.closeSpellModal = closeSpellModal;
    ctx.openCustomSpellModal = openCustomSpellModal;
    ctx.closeCustomSpellModal = closeCustomSpellModal;
    ctx.openItemModal = openItemModal;
    ctx.closeItemModal = closeItemModal;
    ctx.openActionModal = openActionModal;
    ctx.closeActionModal = closeActionModal;

    // Listeners
    modalCloseBtn?.addEventListener("click", closeSpellModal);
    modalActionCloseBtn?.addEventListener("click", closeSpellModal);
    modalBackdrop?.addEventListener("click", (event) => {
        if (event.target === modalBackdrop) {
            closeSpellModal();
        }
    });

    itemModalCloseBtn?.addEventListener("click", closeItemModal);
    itemModalCloseActionBtn?.addEventListener("click", closeItemModal);
    itemModalBackdrop?.addEventListener("click", (event) => {
        if (event.target === itemModalBackdrop) {
            closeItemModal();
        }
    });

    actionModalCloseBtn?.addEventListener("click", closeActionModal);
    actionModalCloseActionBtn?.addEventListener("click", closeActionModal);
    actionModalBackdrop?.addEventListener("click", (event) => {
        if (event.target === actionModalBackdrop) {
            closeActionModal();
        }
    });

    customSpellCloseBtn?.addEventListener("click", closeCustomSpellModal);
    customSpellCancelBtn?.addEventListener("click", closeCustomSpellModal);
    customSpellModal?.addEventListener("click", (event) => {
        if (event.target === customSpellModal) {
            closeCustomSpellModal();
        }
    });

    // Custom spell form submission
    customSpellForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const activeCharacter = ctx.getCharacter();
        if (!activeCharacter) {
            showCustomSpellStatus("Load a character before adding custom spells.", true);
            return;
        }
        const nameInput = sheet.querySelector<HTMLInputElement>("#custom-spell-name");
        const levelSelect = sheet.querySelector<HTMLSelectElement>("#custom-spell-level");
        const schoolInput = sheet.querySelector<HTMLInputElement>("#custom-spell-school");
        const timeInput = sheet.querySelector<HTMLInputElement>("#custom-spell-casting-time");
        const rangeInput = sheet.querySelector<HTMLInputElement>("#custom-spell-range");
        const durationInput = sheet.querySelector<HTMLInputElement>("#custom-spell-duration");
        const componentsInput = sheet.querySelector<HTMLInputElement>("#custom-spell-components");
        const concCheck = sheet.querySelector<HTMLInputElement>("#custom-spell-concentration");
        const ritualCheck = sheet.querySelector<HTMLInputElement>("#custom-spell-ritual");
        const descInput = sheet.querySelector<HTMLTextAreaElement>("#custom-spell-description");
        const submitBtn = sheet.querySelector<HTMLButtonElement>("#custom-spell-submit-btn");

        if (!nameInput?.value.trim() || !descInput?.value.trim()) {
            showCustomSpellStatus("Spell Name and Description are required.", true);
            return;
        }

        const spellPayload = {
            name: nameInput.value.trim(),
            level: Number(levelSelect?.value || "0"),
            school: schoolInput?.value.trim() || "Universal",
            castingTime: timeInput?.value.trim() || "1 action",
            range: rangeInput?.value.trim() || "60 feet",
            duration: durationInput?.value.trim() || "Instantaneous",
            components: componentsInput?.value.trim() || "V, S",
            concentration: !!concCheck?.checked,
            ritual: !!ritualCheck?.checked,
            description: descInput.value.trim(),
            source: "Custom Homebrew",
            sourceTier: "Custom Database"
        };

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to Database...';
        }
        showCustomSpellStatus("Saving spell to local database...");

        try {
            const savedSpell = await postData<any>("/create-custom-spell", spellPayload);
            showCustomSpellStatus(`Spell "${spellPayload.name}" saved successfully to database!`);

            const newSpellDef: SpellDefinition = {
                name: spellPayload.name,
                level: spellPayload.level,
                school: spellPayload.school,
                castingTime: spellPayload.castingTime,
                range: spellPayload.range,
                duration: spellPayload.duration,
                components: spellPayload.components,
                concentration: spellPayload.concentration,
                ritual: spellPayload.ritual,
                description: spellPayload.description,
                source: "Custom Homebrew",
                id: savedSpell?.id
            };

            activeCharacter.spells.unshift(newSpellDef);
            ctx.spellMap.set(newSpellDef.name.toLowerCase(), newSpellDef);
            ctx.renderActiveCharacterView();

            setTimeout(() => {
                closeCustomSpellModal();
                customSpellForm.reset();
            }, 800);
        } catch (error: any) {
            console.error("Failed to create custom spell:", error);
            showCustomSpellStatus(`Could not save custom spell: ${error?.message || error}`, true);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Save Spell';
            }
        }
    });

    // Global escape key handler
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (modalBackdrop && !modalBackdrop.classList.contains("hidden")) {
                closeSpellModal();
            }
            if (itemModalBackdrop && !itemModalBackdrop.classList.contains("hidden")) {
                closeItemModal();
            }
            if (customSpellModal && !customSpellModal.classList.contains("hidden")) {
                closeCustomSpellModal();
            }
            if (actionModalBackdrop && !actionModalBackdrop.classList.contains("hidden")) {
                closeActionModal();
            }
        }
    });

    return {
        openSpellModal,
        closeSpellModal,
        openItemModal,
        closeItemModal,
        openActionModal,
        closeActionModal,
        openCustomSpellModal,
        closeCustomSpellModal
    };
}
