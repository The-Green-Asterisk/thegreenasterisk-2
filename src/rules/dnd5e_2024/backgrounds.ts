import { BackgroundDefinition } from "./types";

export const BACKGROUNDS_2024: BackgroundDefinition[] = [
    {
        id: "acolyte",
        name: "Acolyte",
        description: "You devoted yourself to service in a temple, learning sacred rites and holy mysteries.",
        allowedAbilities: ["int", "wis", "cha"],
        skills: ["Insight", "Religion"],
        tool: "Calligrapher's Supplies",
        originFeatId: "magic-initiate-cleric",
        equipmentSummary: "A holy symbol, a prayer book, 5 sticks of incense, vestments, and 8 GP."
    },
    {
        id: "artisan",
        name: "Artisan",
        description: "You began as an apprentice to a master crafter, learning a trade and the value of hard work.",
        allowedAbilities: ["str", "dex", "int"],
        skills: ["Investigation", "Persuasion"],
        tool: "Artisan's Tools (one of choice)",
        originFeatId: "crafter",
        equipmentSummary: "Artisan's tools, a letter of introduction from your guild, traveler's clothes, and 25 GP."
    },
    {
        id: "charlatan",
        name: "Charlatan",
        description: "You learned early how people work and how to leverage their desires for your own gain.",
        allowedAbilities: ["dex", "con", "cha"],
        skills: ["Deception", "Sleight of Hand"],
        tool: "Forgery Kit",
        originFeatId: "skilled",
        equipmentSummary: "Fine clothes, a disguise kit, tools of the con (weighted dice/marked cards), and 15 GP."
    },
    {
        id: "criminal",
        name: "Criminal",
        description: "You operated on the other side of the law, surviving through cunning and quick reflexes.",
        allowedAbilities: ["dex", "con", "int"],
        skills: ["Sleight of Hand", "Stealth"],
        tool: "Thieves' Tools",
        originFeatId: "alert",
        equipmentSummary: "A crowbar, dark common clothes with a hood, a set of thieves' tools, and 16 GP."
    },
    {
        id: "entertainer",
        name: "Entertainer",
        description: "You thrive in front of an audience, captivating crowds with song, dance, or drama.",
        allowedAbilities: ["str", "dex", "cha"],
        skills: ["Acrobatics", "Performance"],
        tool: "Musical Instrument (one of choice)",
        originFeatId: "musician",
        equipmentSummary: "A musical instrument, a costume, a token from an admirer, and 8 GP."
    },
    {
        id: "farmer",
        name: "Farmer",
        description: "You grew up tilling soil and tending animals, fostering a deep endurance and practical mindset.",
        allowedAbilities: ["str", "con", "wis"],
        skills: ["Animal Handling", "Nature"],
        tool: "Carpenter's Tools",
        originFeatId: "tough",
        equipmentSummary: "Carpenter's tools, iron pot, shovel, common clothes, and 23 GP."
    },
    {
        id: "guard",
        name: "Guard",
        description: "You served as a city watch officer, sentinel, or bodyguard, staying ever vigilant.",
        allowedAbilities: ["str", "int", "wis"],
        skills: ["Athletics", "Perception"],
        tool: "Gaming Set (one of choice)",
        originFeatId: "alert",
        equipmentSummary: "A spear, a horn to sound alarms, manacles, traveler's clothes, and 12 GP."
    },
    {
        id: "guide",
        name: "Guide",
        description: "You led travelers and expeditions through hazardous wilderness trails and rugged terrain.",
        allowedAbilities: ["dex", "con", "wis"],
        skills: ["Stealth", "Survival"],
        tool: "Cartographer's Tools",
        originFeatId: "magic-initiate-druid",
        equipmentSummary: "A staff, cartographer's tools, a tent, traveler's clothes, and 3 GP."
    },
    {
        id: "hermit",
        name: "Hermit",
        description: "You lived in seclusion in a monastery or the deep wild, contemplating cosmic truths.",
        allowedAbilities: ["con", "wis", "cha"],
        skills: ["Medicine", "Religion"],
        tool: "Herbalism Kit",
        originFeatId: "healer",
        equipmentSummary: "An herbalism kit, a scroll case full of notes, winter blanket, common clothes, and 16 GP."
    },
    {
        id: "merchant",
        name: "Merchant",
        description: "You bought and sold goods across towns and trade routes, developing a keen eye for fortune.",
        allowedAbilities: ["con", "int", "cha"],
        skills: ["Animal Handling", "Persuasion"],
        tool: "Navigator's Tools",
        originFeatId: "lucky",
        equipmentSummary: "Navigator's tools, a mule or pack cart, fine clothes, and 22 GP."
    },
    {
        id: "noble",
        name: "Noble",
        description: "You were born into privilege and high society, educated in statecraft, etiquette, and family lineage.",
        allowedAbilities: ["str", "int", "cha"],
        skills: ["History", "Persuasion"],
        tool: "Gaming Set (one of choice)",
        originFeatId: "skilled",
        equipmentSummary: "Fine clothes, a signet ring, a scroll of pedigree, and 29 GP."
    },
    {
        id: "sage",
        name: "Sage",
        description: "You spent years studying manuscripts and seeking arcane knowledge in grand archives.",
        allowedAbilities: ["con", "int", "wis"],
        skills: ["Arcana", "History"],
        tool: "Calligrapher's Supplies",
        originFeatId: "magic-initiate-wizard",
        equipmentSummary: "A bottle of ink, a quill, small knife, letters of research, common clothes, and 8 GP."
    },
    {
        id: "sailor",
        name: "Sailor",
        description: "You spent years serving aboard seagoing vessels, battling wind, tides, and tavern brawls.",
        allowedAbilities: ["str", "dex", "wis"],
        skills: ["Athletics", "Perception"],
        tool: "Navigator's Tools",
        originFeatId: "tavern-brawler",
        equipmentSummary: "A belaying pin (club), 50 feet of silk rope, a lucky charm, common clothes, and 10 GP."
    },
    {
        id: "scribe",
        name: "Scribe",
        description: "You recorded deeds, contracts, histories, and ledgers for nobles, clergy, or universities.",
        allowedAbilities: ["dex", "int", "wis"],
        skills: ["Investigation", "Perception"],
        tool: "Calligrapher's Supplies",
        originFeatId: "skilled",
        equipmentSummary: "Calligrapher's supplies, ink, fine parchment, a lamp, common clothes, and 23 GP."
    },
    {
        id: "soldier",
        name: "Soldier",
        description: "You trained in the discipline of war, marching under banner and fighting in unit formation.",
        allowedAbilities: ["str", "dex", "con"],
        skills: ["Athletics", "Intimidation"],
        tool: "Gaming Set (one of choice)",
        originFeatId: "savage-attacker",
        equipmentSummary: "An insignia of rank, a trophy from a fallen enemy, gaming set, traveler's clothes, and 14 GP."
    },
    {
        id: "wayfarer",
        name: "Wayfarer",
        description: "You grew up on city streets, wandering gutters and alleys with keen senses and opportunistic luck.",
        allowedAbilities: ["dex", "wis", "cha"],
        skills: ["Insight", "Stealth"],
        tool: "Thieves' Tools",
        originFeatId: "lucky",
        equipmentSummary: "Thieves' tools, 2 daggers, a small pouch of curios, traveler's clothes, and 16 GP."
    },
    {
        id: "custom",
        name: "Custom Background",
        description: "Design your own custom background tailored to your character's unique backstory.",
        allowedAbilities: ["str", "dex", "con", "int", "wis", "cha"],
        skills: ["Any 2 skills"],
        tool: "Any 1 tool or gaming set",
        originFeatId: "skilled",
        equipmentSummary: "50 GP to purchase starting equipment of your choice."
    }
];
