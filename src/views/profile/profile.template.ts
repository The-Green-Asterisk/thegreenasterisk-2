import Helpers from "@services/helpers";

const profileTemplate = () => Helpers.html`
    <el-profile>
        <div class="content-slate">
            <div class="hero-slate" bg="/storage/images/spelljammer.jpg">
                <h1>Profile</h1>
            </div>
            <section>
                <img src="https://cdn.discordapp.com/embed/avatars/0.png" id="profile-picture"  title="Username and profile picture is controlled by Discord and cannot be edited here" />
                <button id="edit-profile" class="btn btn-primary">Edit Profile</button>
                <div class="profile-card">
                    <div>
                        <h2>Name:</h2>
                        <p id="profile-name"></p>
                    </div>
                    <div>
                        <h2>Email:</h2>
                        <p id="profile-email"></p>
                    </div>
                    <div>
                        <h2>Username:</h2>
                        <p id="profile-username" title="Username and profile picture is controlled by Discord and cannot be edited here"></p>
                    </div>
                    <div>
                        <h2>Age:</h2>
                        <p id="profile-age"></p>
                    </div>
                </div>
            </section>
            <section id="profile-links-section">
                <div class="profile-links-header">
                    <h2>Links</h2>
                    <a id="profile-links-page" class="profile-links-page" href="/links">View Links Page <i class="fa fa-external-link"></i></a>
                </div>
                <div id="profile-links-list" class="user-links-list"></div>
            </section>
        </div>
    </el-profile>
`;

export default profileTemplate;