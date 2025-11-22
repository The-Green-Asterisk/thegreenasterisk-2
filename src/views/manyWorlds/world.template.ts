import { World } from "@entities";
import { html } from "@services/elements";

const worldTemplate = (world: World) => html`
    <div id="world-content">
        <div id="world-description">
            <p>
                ${world.description || 'No description available for this world.'}
            </p>
        </div>
        <div id="characters-container">
            <h2>Characters</h2>
            <ul id="character-list">
                <li>San-Te: A half-High Elf Monk seeking redemption after a tragic past.</li>
                <li>Fries "Grim" Grimstone: A devoted cleric to the Raven Queen, battling the undead.</li>
                <li>Seraphina "Sera" Voss: A daring rogue with a heart of gold, fighting for justice.</li>
                <li>Sibella Quinn Melpomene aka Moxxie Cleopatra: A charismatic bard uncovering secrets of her troupe.</li>
                <li>Zee-Bo: An Autognome on a quest to discover the truth of his creation.</li>
            </ul>
        </div>
        <div id="locations-container">
            <h2>Locations</h2>
            <ul id="location-list">
                <li>Emberhall: A resilient city that survived Orcus's devastation, now a hub for adventurers.</li>
                <li>The Ashen Wastes: A barren land scarred by war, filled with lurking dangers.</li>
                <li>The Forgotten Monastery: An ancient site where San-Te trained, now a place of mystery.</li>
                <li>The Raven's Perch: Grimstone's sanctuary, dedicated to the Raven Queen.</li>
                <li>The Bard's Haven: A hidden refuge for performers, where Moxxie seeks answers.</li>
                <li>The Clockwork Workshop: Zee-Bo's place of origin, holding secrets of his creation.</li>
            </ul>
        </div>
        <div id="items-container">
            <h2>Items</h2>
            <ul id="item-list">
                <li>Monk's Amulet: A mystical amulet that enhances San-Te's martial abilities.</li>
                <li>Cleric's Mace: A sacred weapon wielded by Grimstone, imbued with divine power.</li>
                <li>Rogue's Dagger: A finely crafted dagger used by Sera for stealth and precision.</li>
                <li>Bard's Lute: Moxxie's instrument, capable of enchanting audiences and foes alike.</li>
                <li>Autognome Toolkit: Zee-Bo's set of tools for repairs and modifications.</li>
            </ul>
        </div>
        <div id="events-container">
            <h2>Key Events</h2>
            <ul id="event-list">
                <li>The Emergence: Orcus's rise from the Abyss, bringing destruction to Cronus.</li>
                <li>The Great Battle: The heroic struggle to defeat Orcus and his undead forces.</li>
                <li>The Rebuilding: The ongoing efforts to restore communities and reclaim the land.</li>
                <li>The Search for Redemption: San-Te's personal journey to find purpose after tragedy.</li>
                <li>The Battle Against Undeath: Grimstone's relentless fight to eradicate undead threats.</li>
                <li>The Quest for Justice: Sera's mission to protect the oppressed and uphold justice.</li>
                <li>The Troupe's Mystery: Moxxie's investigation into the fate of her performance group.</li>
                <li>The Creation's Truth: Zee-Bo's exploration of his origins and purpose.</li>
            </ul>
        </div>
    </div>
`;

export default worldTemplate;