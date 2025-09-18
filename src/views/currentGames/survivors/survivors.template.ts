import { html } from "@elements";

const survivorsTemplate = () => html`
    <el-survivors>
        <div class="content-slate" id="content">
            <section class="current-games-survivors">
                <h1>Survivors of the Emergence</h1>
                <p>100 years after Orcus emerged from the Abyss and wreaked havoc on the land of Cronus, a troup of unlikely heroes discovers a plot to revive the undead</p>
                <div class="player-card">
                    <img class="player-img" light-box src="/storage/images/DMStevev2.png" alt="Steve the DM" />
                    <div>
                        <h3>Steve Beaudry: The DM</h3>
                        <p>Steve has been playing tabletop RPGs for about ten years now and has been DMing for about 8 of those years. Once he started, he couldn't stop. His background includes writing, but never publishing several different kinds of stories, and he has a passion for world-building. He, along with his players, is the creator of the world of Cronus, where Survivors of the Emergence takes place.</p>
                        <p>Steve's DMing style is highly collaborative, and he encourages his players to take an active role in shaping the story. He believes that the best stories are the ones that are created together, and he strives to create a fun and engaging experience for everyone at the table.</p>
                        <p>When you watch Survivors of the Emergence, you are getting a peek into Steve's own home, sitting at his own table, with his own friends.</p>
                    </div>
                </div>
                <div class="player-card">
                    <img class="player-img" light-box src="/storage/images/Jay.jpg" alt="Jay Frank" />
                    <div>
                        <h3>Jay Frank: San-Te</h3>
                        <p>Jay is a cinephile, donut lover, and serial underachiever. When away from the table, he enjoys video games, movies/TV, and spending time with his friends, family, and Quaker parrots. He’d want me to tell you “Don’t panic” and “Keep circulating the tapes/url”.</p>

                        <p>Jay is playing San-Te, a half-High Elf Monk forged in tragedy and refined in an ancient Elven monastery, seeking to bring justice to the oppressed through martial arts. Once driven by vengeance, his journey has left him wounded in spirit, wandering the land as a disillusioned drunk searching for redemption and a renewed sense of purpose.</p>
                    </div>
                </div>
                <div class="player-card">
                    <img class="player-img" light-box src="/storage/images/Dilly.png" alt="Dylan Perry" />
                    <div>
                        <h3>Dylan Perry: Fries "Grim" Grimstone</h3>
                        <p>Dylan is relatively newer to D&D but has always loved tabletop and role-playing games. He likes to dive headfirst into his characters and will use any excuse to pull out a horrible, botched accent. If he's not rolling a d20, you can find him working at the hospital, at the gym, or picking up a big rock outside to look at all the bugs that were hiding under it. He also has a collection of horrible t-shirts that he wears proudly and seems to pull out of thin air.</p>
                        <p>Fries Grimstone is a devoted cleric to the Raven Queen. He has a deep-rooted hatred for all things undead and in violation of the natural order. He takes his work very seriously and oftentimes finds it hard to put it down. He holds the natural cycle of life and death with utmost reverence, and believes it is a gift, perfectly entwined with a curse. In this balance, there is beauty that Grim is willing to sacrifice his life for. When he's not working, he's usually imbibing in whatever he can get his hands on. Grim finds that death likes to follow those who tend to it, and alcohol is one of the few reliefs he can find from the scars his pursuit has left on his mind.</p>
                    </div>
                </div>
                <div class="player-card">
                    <img class="player-img" light-box src="/storage/images/Katie.png" alt="Katie Jean" />
                    <div>
                        <h3>Katie Jean: Seraphina "Sera" Voss</h3>
                        <p>Katie is an artist, parrot mom ("parront," if you will), and avid D&D player of over 16 years. Over the years, Katie has explored every class but has a tendency to favor the more sneaky-sneaky archetypes. Her current character Seraphina Voss — Sera for short — reflects the part of Katie that loves adventure, stands up for what's right, and doesn't let obstacles slow her down. At the heart of Sera is a little bit of Katie, and vice versa. In her spare time, she works on her non-profit organization and loves playing video games.</p>
                    </div>
                </div>
                <div class="player-card">
                    <img class="player-img" light-box src="/storage/images/Sonja.jpg" alt="Sonja De Jessa" />
                    <div>
                        <h3>Sonja De Jessa: Sibella Quinn Melpomene aka Moxxie Cleopatra</h3>
                        <p>Sonja is a performer at heart, whether it's playing a dramatic and sassy D&D character, entertaining behind the kava bar, or practicing hair witchcraft at her salon studio, Sacred Styles by Sonja. When not at the table or doing the aforementioned things, she's being an incredible mom, planning some elaborate event, or falling asleep whilst playing video games.</p>
                        <p>Her character, Moxxie Cleopatra (and a Whole Lotta Halfling™ 🫰) is similar to Sonja in the sense of performing — outgoing, vivacious, and well-known in the realm. Moxxie is going to get down to the bottom of what happened to her Troupe of performers.</p>
                    </div>
                </div>
                <div class="player-card">
                    <img class="player-img" light-box src="/storage/images/Eric.jpg" alt="Eric Long" />
                    <div>
                        <h3>Eric Long: Zee-Bo</h3>
                        <p>Eric has been playing D&D for a few years now. A fan of the dark worlds of Warhammer, to the goofy adventures of One Piece, he creates characters that tend to exist on the outskirts of society, and those that challenge the norm of these strange worlds. He is also an avid reader and spends most of his free time consuming horror novels or epic sci-fi escapades. Of course, he makes time for video games as well, and can often be found playing old-school boomer-shooters and CRPGs.</p>
                        <p>Zee-Bo is an Autognome unlike any other. Crawling out from a secret workshop deep in Dun'Haldur over a century ago, he is one of the last of the emergence era. Having travelled the world in search of self, he eventually made the outskirts of Emberhall his home. There he worked under the tutelage of a Cleric, learning the ways of the world, and the need to help others. Decades have passed since then, and he sets off anew to learn the secrets of his creation, a truth that can only be revealed in the workshop he once resided in.</p>
                    </div>
                </div>
                <p>Join us every other Sunday at 5pm on <a href="https://www.youtube.com/@TheGreenAsterisk">YouTube</a> or <a href="https://discord.gg/PwYVb5R7BF">Discord</a> to watch the live stream, or catch up with the recordings below.</p>
                <div class="survivor-list" id="video-list"></div>
            </section>
        </div>
    </el-survivors>
`;

export default survivorsTemplate;
