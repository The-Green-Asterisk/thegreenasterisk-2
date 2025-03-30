import { html } from "@services/elements";

const profileTemplate = () => html`
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
            </section>
        </div>
    </el-profile>
`;

export default profileTemplate;