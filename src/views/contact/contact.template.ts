import Helpers from "@services/helpers";

const html = Helpers.html;

const contactTemplate = () => html`
    <el-contact>
        <div class="content-slate">
            <section>
                <h1>Contact Us</h1>
                <p>Questions, ideas, or want to join a game? Send us a message and we'll get back to you.</p>
                <form id="contact-form">
                    <label for="contact-name">Name</label>
                    <input id="contact-name" name="name" required maxlength="100" autocomplete="name" />
                    <label for="contact-email">Email</label>
                    <input id="contact-email" name="email" type="email" required maxlength="254" autocomplete="email" />
                    <label for="contact-message">Message</label>
                    <textarea id="contact-message" name="message" required maxlength="5000" rows="8"></textarea>
                    <div class="website" aria-hidden="true">
                        <label for="contact-website">Website</label>
                        <input id="contact-website" name="_website" tabindex="-1" autocomplete="off" />
                    </div>
                    <button type="submit">Send</button>
                    <p class="contact-status" role="status"></p>
                </form>
            </section>
        </div>
    </el-contact>
`;

export default contactTemplate;
