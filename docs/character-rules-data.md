# Character rules as data: how the creator and sheet work

A guide for AI agents changing The Green Asterisk's D&D 2024 character creator and character sheet. Read it before touching classes, subclasses, species, backgrounds, feats, items, weapons, spells, or any stat on the sheet.

## The rule

**Nothing about a specific class, subclass, species, feat, item, or spell is hard-coded.** If a rules element changes a number on the sheet, grants an action, a spell, a sense, or a resource, that comes from its data. Code reads generic fields (`modifiers`, `resourceUpdates`, `grantedSpells`, ...), never names (`if (name === "Tough")`, `includes("cloak of protection")`, regexes over descriptions).

When a needed effect can't be expressed in the data yet:

1. Add a generic field or modifier target/type (see [Extending the vocabulary](#extending-the-vocabulary)).
2. Put the values in the seed data.
3. Write a seed migration so existing databases get them.
4. Make every path that computes stats read it (creator, importer, sheet).

Don't add a special case "just for now". If an element's effect is conditional in a way the data can't express (for example, Hammer of Thunderbolts' +4 STR only with the belt and gauntlets), leave it out and say so, rather than applying it unconditionally.

## Where the data lives

| What | Source of truth (seed) | Stored in | Served to the client |
|---|---|---|---|
| Classes, subclasses, progression, class options (invocations, fighting styles, maneuvers, ...) | `server/services/database/rulesSeed.ts` (`SEED_CLASSES`) + `server/services/database/rulesProgressionBuilder.ts` (`buildClassProgression`, `buildSubclassProgression`, option tables) | `rule_classes` (`progressionJson`, `featuresJson`, `scalingTraitsJson`, ...), `rule_subclasses` (`progressionJson`) | `/get-rules` → `classes`, `subclasses` |
| Species and lineages | `SEED_SPECIES` in `rulesSeed.ts` | `rule_species` (`traitsJson`, `lineagesJson`, `darkvision`, ...) | `/get-rules` → `species` |
| Backgrounds | `SEED_BACKGROUNDS` | `rule_backgrounds` | `/get-rules` → `backgrounds` |
| Feats (origin, general, fighting styles, epic boons) | `SEED_ORIGIN_FEATS`, `SEED_GENERAL_FEATS`; mechanics stored via `server/services/database/featMechanics.ts` | `rule_feats` (`mechanicsJson`, `skillPicks`) | `/get-rules` → `originFeats`, `generalFeats` |
| Magic item effects | `server/services/database/itemMechanics.ts` (`SEED_ITEM_MECHANICS`) | `item.modifiersJson` (wins over the seed list) | `/get-rules` → `items` (`itemMechanicsRules`) |
| Spells | `server/services/database/spellsSeed.ts` | `spell` table (also filled from D&D Beyond) | `/get-rules` → `spells`, `/get-spells` |

- The server's `/get-rules` (`server/controllers/rulesController.ts`, `getRules`) falls back to the seed when a table is empty.
- The client loads it once through `src/services/classRules.ts`:
  - `getClassRules`, `findClassRule`
  - `getFeatRules`, `findFeatRule`
  - `getSpeciesRules`, `findSpeciesRule`
  - `getBackgroundRules`
  - `findItemRule`, which matches "+N" variants to their base name
- `src/rules/dnd5e_2024/*.ts` (`CLASSES_2024`, `SPECIES_2024`, `ORIGIN_FEATS_2024`, ...) are **offline fallbacks only**. They can lag the server seed; for example, the offline classes have no invocation options, and items have no offline copy at all. Treat the server seed as canonical.
- The server keeps its own copy of the loaded class rules for server-side healing (`server/services/classRulesData.ts`).

### Seed changes need a migration

`seedDefaultRulesIfEmpty` only fills empty tables, and D&D Beyond imports update rule rows (`upsertRulesFromDndBeyond`), so **editing the seed does nothing to an existing database**. Every data change needs a migration in `server/services/database/migration/`, named `<timestamp>-<what>.ts` with class `<Name><timestamp>`. Migrations run during `npm run build` (`migration:run`).

Patterns to copy:

- **Re-seed class or subclass progression:** rebuild `progressionJson` with `buildClassProgression(seed.id, features)` / `buildSubclassProgression(cls.id, sub)` for non-custom rows (`1792790600000-seed_class_sheet_modifiers.ts`, `1792791300000-seed_sense_modifiers.ts`).
- **Merge fields into stored species traits** by trait name or lineage id, keeping descriptions synced from D&D Beyond (`1792791100000-seed_species_spell_ability.ts`).
- **New column plus fill:** `hasColumn` check, `ALTER TABLE`, then `UPDATE ... WHERE ... IS NULL` (`1792791500000-add_item_modifiers.ts`).
- **Rename data, including saved characters' copies** in `saved_character.race` and the payload JSON (`1792791200000-rename_tiefling_lineages.ts`).

Skip rows with `isCustom = 1`. Never overwrite data a user or D&D Beyond supplied unless the migration exists to correct it.

## The three paths that compute a character

Every effect must work in all three. The paths share the resolvers in `src/rules/dnd5e_2024/`.

1. **Creator** (`src/views/characterCreator/`).
   - The player's choices live in `CreatorState` (`characterCreator.types.ts`): `classes`, `subclassFeatureChoices`, `asiChoices`, `classSkills`, `classSpellSelections`, ...
   - `services/persistence.ts#buildPayload` turns them into the saved `CharacterData`, using:
     - `services/progressionModifiers.ts`: unlocked class and subclass features and chosen options with their modifiers. `fromChoice` marks option modifiers.
     - `services/rulesCalculations.ts`: AC, max HP, speed, initiative.
     - `services/skillRules.ts`, `services/spellReconciliation.ts`, `services/speciesChoices.ts`.
     - Chosen options are then applied to the payload with `applyProgressionChoiceOption`.
   - All editing happens here. The sheet has no edit mode.
2. **Importer** (`src/views/characterSheet/characterAdapter.ts#parseDndBeyondCharacter`).
   - D&D Beyond's own numbers and modifiers are the base.
   - Rules data fills in what D&D Beyond didn't give: feat, species and option senses, save effects, resources, scale values, species spell ability.
   - Rules data must not double-count what D&D Beyond already applied: item stats, and senses D&D Beyond already listed.
   - The result is marked `source: "dndbeyond"`.
3. **Sheet changes** (`src/views/characterSheet/`).
   - **Equipping, unequipping or attuning items** runs `services/magicItemBonuses.ts#applyMagicalItemBonuses`.
   - **Class choices changed on the sheet** go through `featureDecisions.ts` / `classChoiceDecisions.ts` → `applyProgressionChoiceOption(character, option, ±1)`.
   - **Anything applied with sign +1 must be fully undone with sign −1.** Effects that aren't simple sums (senses, save effects) keep per-source records for this; see below.
   - **For imported characters, equipment changes re-read the D&D Beyond payload** (`recalculateFromRawPayload`), so item stats come from D&D Beyond there.

### Saving and loading

- A saved character is a JSON payload (`saved_character.payload`) plus relational rows (vitals, classes, abilities, skills, inventory, spells, features, resources, decisions).
- On load, `server/controllers/characterController.ts#hydrateFromRelationalEntities` rebuilds from rows and spreads the payload under them.
- **Rows only have the columns they have.** Vitals and items merge the row over the payload copy (`server/services/characterVitals.ts#mergeVitals`, `server/services/characterItems.ts#mergeRowItems`), so fields without a column survive: Devil's Sight, `otherSenses`, item `modifiers`, `charges`, `definitionId`.
- If you add a field to classes, abilities, skills, spells, features or resources, check it survives a load. Either add a column (migration) or merge it from the payload.
- Saves of one character are serialized server-side (`syncCharacterRelationalEntitiesInOrder`); duplicated rows from older overlapping saves are repaired on load.
- Saving from the creator keeps play state (`importLocks.ts#keepPlayState`):
  - current HP, moved by the change in max HP
  - temp HP, death saves, inspiration
  - conditions, exhaustion, used slots and resources
- **Imported characters edited in the creator** (`services/importLocks.ts`):
  - They stay `source: "dndbeyond"`.
  - Fields the player changed lock automatically (`lockedFields`), and a refresh from D&D Beyond keeps locked fields (`applyLockedFieldsToRefreshedCharacter`).
  - Lock keys:
    - identity: `name`, `alignment`, `avatarUrl`, `details.<field>`, `notes.<field>`
    - build: `race`, `classes`, `background`, `abilities.<ABBR>`, `feats`
    - other: `skills`, `spells`, `equipment`, `vitals.maxHp`

## The modifier vocabulary

Effects are `StatModifier` objects (`src/rules/dnd5e_2024/types.ts`):

```ts
{ target, type, value?, abilitySource?, minimum?, valueByLevel?, perClassLevel?, abilities?, allowsShield?, requires?, condition?, label?, description? }
```

They can sit on:
- class/subclass `ProgressionFeature.modifiers`
- `ProgressionChoiceOption.modifiers` (invocations, fighting styles, maneuvers, ...)
- feat mechanics `modifiers`
- species `SpeciesTrait.modifiers` and `LineageDefinition.modifiers`
- item modifiers

### Values

- Numbers, or templates:
  - `"{{pb}}"`: proficiency bonus
  - `"{{level}}"`: class or character level
  - `"{{str}}"`…`"{{cha}}"`: ability modifiers, minimum 1 where resources use them
  - `"{{plus}}"`: an item's +N
- `valueByLevel[classLevel]` (Unarmored Movement), `perClassLevel` (Tough's +2 HP per level).
- `requires`: `"no-armor"`, `"no-heavy-armor"`, `"no-armor-or-shield"`, or `"armor"`. It limits the modifier to an armor state.
- `condition`: what an advantage applies to ("concentration", "charmed", ...).

### Targets and types that are read today

| Stat | Target | Types | Notes / examples |
|---|---|---|---|
| Armor Class | `vitals.ac` | `unarmored_ac` (`abilities`, `allowsShield`), `bonus` (+`requires`) | Unarmored Defense, Draconic Resilience, Bracers of Defense, Cloak of Protection, Defense (`requires: "armor"`) |
| Armor Class | `vitals.ac.mediumArmorMaxDex` | `set` | Medium Armor Master |
| Max HP | `vitals.maxHp` | `bonus` (`perClassLevel`) | Tough, Dwarven Toughness |
| Speed | `vitals.speed` | `bonus` (`valueByLevel`, `requires`) | Unarmored Movement, Speedy |
| Special speeds | `vitals.climb`, `vitals.swim`, `speeds.fly`, `vitals.fly` | `set` (`"walk"`, `"equal_walk"`, or number) | Athlete, Roving, Aquatic Affinity, Aspect of the Spider/Panther/Pike, Falcon |
| Initiative | `vitals.initiative` | `bonus` (`"{{pb}}"`), `ability_mod`, `advantage` | Alert, Dread Ambusher; item advantage becomes a note |
| Ability scores | `abilities.<ab>` | `set` (at least N), `bonus` | Belts, Amulet of Health, Ioun Stones (items) |
| Saves | `saves.<ab>` | `proficiency_tier`, `bonus`, `advantage`/`disadvantage` (+`condition`) | Disciplined Survivor, War Caster |
| Saves | `saves.all` | `ability_mod` (+`minimum`), `bonus`, `advantage`/`disadvantage` | Aura of Protection, Cloak of Protection |
| Skills | `skills.<skill>` | `proficiency_tier` (`"proficient"`/`"expertise"`), `ability_mod` (+`minimum`), `advantage` | Thaumaturge, Sentinel Shield |
| Skills | `skills.unproficient` | `half_proficiency` | Jack of All Trades |
| Checks | `checks.all` | `bonus` (items) | Luckstone |
| Spells | `spells.attack`, `spells.dc` | `bonus` (items: best counts, no stacking) | Rod of the Pact Keeper `{{plus}}` |
| Weapon attacks | `attacks.ranged`, `attacks.melee` | `bonus` | Archery |
| Weapon attack floor | `attacks.two_handed_damage_floor` | `set` | Great Weapon Fighting (min 3 on damage dice) |
| Weapon damage | `damage.melee_one_handed`, `damage.thrown`, `damage.offhand_ability_mod` | `bonus` | Dueling, Thrown Weapon Fighting, Two-Weapon Fighting |
| Cantrip damage | `damage.cantrips`, `damage.eldritch_blast` | `ability_mod`, `bonus` | Potent Spellcasting (Cleric/Druid), Agonizing Blast |
| Item's own +N | `item.plus` | `set` | Holy Avenger 3, Sun Blade 2, staves 2 |
| Defenses | `defenses.resistance` (`immunity`, `vulnerability` on the options path) | `set` (`value` = damage type) | species lineages, Draconic Sorcery |
| Special senses | `senses.<key>`, or `vitals.darkvision`/`blindsight`/`tremorsense`/`truesight`/`devilsSight` | `set` (at least N ft.), `bonus` (N ft. farther, or N ft.) + `label` for new senses | Umbral Sight, Devil's Sight, Goggles of Night |
| Proficiencies | `proficiencies.armor.*`, `proficiencies.weapons.*` | `set` | applied on the options path only (`statModifierEvaluator`) |
| Spells/features/actions | `spells.grant`, `spells.alwaysPrepared`, `spells.atWill`, `features.grant`, `actions.*`, `reactions.*` | `grant_spell`, `grant_feature`, `grant_action` | options path (Protection, Interception); prefer the structured fields below |

### Structured fields beyond modifiers

- **Class/subclass progression** (`ProgressionLevel`, one per class level):
  - `features[]`, each with `modifiers`, `actionGrant` (an action/bonus action/reaction on the Actions tab), `grantedSpells`, `grantedFeatures`, `spellPicks`, `scaleValue` (e.g. `"{{cha}}+{{level}}"`)
  - `choices[]` (`ProgressionChoice`):
    - `chooseCount`, or `pool` counted by a `scalingTraits` table (`invocationsByLevel`, `metamagicByLevel`, `maneuversByLevel`)
    - options carry `modifiers`, `minLevel`, `prerequisite`, `spellPicks`, `grantedSpells`
    - `legacyKeys`/`legacyIds` read older saves
  - `resourceUpdates[]`: `{ name, total: number | template, die?, resetOn, aliases? }`
  - `badges[]`
- **Class scaling** (`ClassScalingTraits`): `weaponMasteriesByLevel`, `expertiseByLevel`, `asiLevels`, `epicBoonLevel`, `martialArtsDieByLevel`, ...
- **Spellcasting:**
  - the class `spellcasting` block: `ability`, `type` (full/half/third/pact), `spellList`, cantrips/prepared/slots by level
  - a subclass `spellcastingOverride` (Eldritch Knight, Arcane Trickster)
  - `expandedSpellLists`
  - Slots: `src/rules/dnd5e_2024/multiclass.ts#calculateMulticlassSpellSlots`.
- **Granted spells** (`ProgressionGrantedSpell`): `alwaysPrepared`, `atWill`, `ritual`, `usage {count, resetOn}`, a fixed `ability`, `source`. Spell picks (`SpellPick`) let the player choose: `lists`, `levels`, `maxLevel: "castable"`, `orRitual`, `countsAgainstLimit`.
- **Feats** (`FeatMechanics`):
  - `modifiers`, `resource` (Lucky's Luck Points `"{{pb}}"`), `limitedUse`
  - `spellList` / `spellCantrips` / `spellLevel1` / `defaultSpellAbility` (Magic Initiate)
  - `choices` (Elemental Adept), `skillPicks` (`FeatSkillPick`)
  - `spellcastingAbilityOptions`
  - Fighting styles are feats with `category: "fighting-style"`.
- **Species** (`SpeciesTrait`, `LineageDefinition`):
  - trait `modifiers`, `minLevel` (level-gated traits), `resource`, `grantedSpells`, `skillPicks`, `featPicks`, `scaleValues` (Breath Weapon dice), `aliases`
  - `spellcastingAbilityOptions` (the player picks; stored as `speciesSpellAbility`)
  - species/lineage `darkvision` text: a `set` darkvision grant; Drow's 120 replaces Elf's 60
  - lineage `modifiers` / `spellsGranted` / `speedBonus`
  - Resolvers: `src/rules/dnd5e_2024/speciesRules.ts`.
- **Backgrounds:** `allowedAbilities` (the 2024 +2/+1 or +1/+1/+1), `skills`, `tool`, `originFeatId`.
- **Items:**
  - modifiers apply while the item is **equipped, and attuned when it needs attunement**
  - the item's own `modifiers` (custom items, or converted from D&D Beyond's `grantedModifiers`) win over `findItemRule(name)`
  - magic armor and shields add their own +N to AC unless their data sets `vitals.ac`
  - weapons use `item.plus` / the "+N" in their name for attack and damage
  - advantage from items shows as `itemRollNotes`

### Resolvers to reuse (don't re-implement)

`src/rules/dnd5e_2024/`:

- `classResources.ts`: `resolveClassResources`, `resolveClassScaleValues`
- `featRules.ts`: `featModifierNumber`, `featModifiers`, `featBonus`, `resolveFeatResources`
- `speciesRules.ts`: `activeSpeciesTraits`, `speciesModifiers`, `speciesResistances`, `speciesMaxHpBonus`, `resolveSpeciesResources`, `speciesGrantedSpells`, `speciesSenseGrants`, `detectLineage`, `findSpecies`, `resolveSpeciesSpellAbility`
- `classOptions.ts`: `findClassOption`, `findClassOptionByName` (curly and straight apostrophes match)
- `featureUsage.ts`: which features are spent, granted actions, or passive picks, from data
- `spellSources.ts`: `allClassSpellPicks`, `uncountedClassSpellSources`
- `saveEffects.ts`: save advantage/disadvantage/bonuses as `SaveEffect { ability?, effect, value?, against?, sources[] }`
  - Merged by ability, effect and `against`, so War Caster and Eldritch Mind are one effect with two sources.
  - `normalizeAgainst` turns wording into a condition/"concentration"/"spells" key only when the rest is filler.
  - One-ability effects show on that ability's card; all-save effects show in the Saving Throws row.
- `senses.ts`: `SenseGrant { key, type, value, label?, source?, item? }`
  - `resolveSenses(base, grants)`: `set` takes the highest, then `bonus` adds.
  - `applySenseGrants` (per-source add/remove), `applyItemSenses`, `writeSenses` (core senses to `vitals.*`, others to `vitals.otherSenses`), `listSenses`.
  - `baseSenses` is the character's senses before rules grants: the species via grants for site characters, D&D Beyond's for imports.
- `statModifierEvaluator.ts`: `applyStatModifier(character, mod, sign, source?)` / `applyProgressionChoiceOption`, the reversible options path.

## Checklists

**New class or subclass**
1. Add it to `SEED_CLASSES` with features.
2. Express each feature's mechanics in `rulesProgressionBuilder.ts` (modifiers, `resourceUpdates`, choices with options, `actionGrant`, `grantedSpells`, `spellPicks`, scaling traits).
3. Add a migration that inserts or re-seeds the rows.
4. Check the creator, an import of a D&D Beyond character with that class, and the sheet's choice changes.

**New feat, species, background or item effect**
1. Put the modifiers or mechanics in the seed: `rulesSeed.ts` / `featMechanics.ts` / `itemMechanics.ts`.
2. Add a migration for stored rows.
3. If it uses a target or type nothing reads yet, extend the vocabulary first.

**New stat or modifier target**
1. Add it to `ModifierTarget` (client `types.ts`; the server has its own list in `rulesProgressionBuilder.ts`).
2. Handle it in every consumer: the creator calculations, `characterAdapter.ts` (as a fallback to D&D Beyond, never double-counting), `statModifierEvaluator.ts` (applied with sign ±1, so it must be undoable), `magicItemBonuses.ts` if items can carry it.
3. Render it on the sheet (and the PDF in `services/pdfExport.ts`).
4. Make sure it survives save and load.
5. If it isn't a plain sum, record per-source grants like senses and save effects do.

**Tests**
- Use the seeded rules in tests: `tests/src/views/serverRulesClasses.ts`, `setItemRules(SEED_ITEM_MECHANICS)`, `setFeatRules(...)`.
- Prove each path: creator `buildPayload`, `parseDndBeyondCharacter` with a minimal raw payload, and apply/undo on the options path.
- Run `npm run typecheck` (client) and `npx tsc --project server/tsconfig.json --noEmit` (server).
- Run the tests with `DB_HOST=localhost DB_USER=x DB_PASSWORD=x DB_NAME=x npx vitest run`. Two server test files (`characterController`, `routes`) fail to load on master.

## Accessibility

The creator and sheet must meet WCAG 2.2 A/AA:
- color tokens from `src/main.css`
- 24px minimum targets
- buttons for interactive things
- labels on every control
- `aria-pressed` on toggles
- a page title per creator step

New UI for data-driven features follows the same rules.

## Known gaps

- Items that can be wielded as weapons ("can be wielded as a quarterstaff") are still detected from description text (`extractGrantedWeaponFromItem`).
- Conditional item effects aren't expressible yet and were left out: Hammer of Thunderbolts, Defender, Boots of Speed.
- Manuals and Tomes raise ability scores permanently when read. They aren't an equipped effect.
- There's no UI for entering a custom item's `modifiersJson`.
- Characters saved before senses were tracked (no `baseSenses`) don't get item senses until they're re-saved from the creator or refreshed from D&D Beyond. This avoids double-counting.
