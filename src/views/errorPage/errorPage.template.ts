import { html } from "@elements";

const errorPage = (errorCode: number) => html`
    <section>
        <h1>Error ${errorCode}</h1>
        <p>Sorry, something went wrong. Please try again later.</p>
    </section>
`;

export default errorPage;