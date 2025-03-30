import { html } from "@elements";

const errorPage = (errorCode: number) => html`
    <section>
        <div class="content-slate">
            <section>
                <h1>Error ${errorCode}</h1>
                <p>Sorry, something went wrong. Please try again later.</p>
            </section>
        </div>
    </section>
`;

export default errorPage;