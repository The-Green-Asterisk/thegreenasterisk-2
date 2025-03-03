import { escapeHtml, html } from '@services/elements';

const viewsTemplate = () => html`
    <el-docs>
        <div class="content-slate">
            <section>
                <h1>Views</h1>
                <p>
                    Views consist of two main parts: templates, and controllers. Templates are the HTML structure of the view, and controllers are the JavaScript that controls the view. In Elemental, view templates are written in TypeScript as a const function reference that returns an HTML tagged template literal and the controller is a function that is called after the template is loaded in the Route file. Each view will be put inside of a folder with the same name as the view. This folder will contain <code class="language-typescript">{viewName}.template.ts</code> and <code class="language-typescript">{viewName}.ctrl.ts</code> files and <code class="language-typescript">{viewName}.css</code> if you want to include styles. Views can apply to pages, or to components that are used in multiple pages or multiple times in a page.
                </p>
                <h4>Template</h4>
                <p>
                    View templates should always start out by importing the html template literal tag from the elements service. Once you do that, you can start writing the page in a familiar HTML format after starting with <code class="language-typescript">const {viewName} = () => html</code>. The end result will look something like this:
                </p>
                <pre>
                    <code class="language-typescript">
import { html } from '@services/elements';<br>
<br>
const helloWorldTemplate = () => html${escapeHtml`\``}<br>
${escapeHtml`  <section>`}<br>
${escapeHtml`    <h1>Hello World!</h1>`}<br>
${escapeHtml`  </section>`}<br>
${escapeHtml`\``};<br>
export default helloWorldTemplate;
                    </code>
                </pre>
                <p>
                    There is, however, one important thing missing from the above code. And that's the view name tag. The outter most tag of the template should be named the same as the view name with the 'el-' prefix in front of it. So, if the view name is <code class="language-typescript">helloWorld</code>, the outter most tag should be <code class="language-html">&lt;el-hello-world&gt;</code>. This will end up being how the Elements service and the CSS will look for this view. So, the above code should look like this:
                </p>
                <pre>
                    <code class="language-typescript">
import { html } from '@services/elements';<br>
<br>
const helloWorldTemplate = () => html${escapeHtml`\``}<br>
${escapeHtml`  <el-hello-world>`}<br>
${escapeHtml`    <section>`}<br>
${escapeHtml`      <h1>Hello World!</h1>`}<br>
${escapeHtml`    </section>`}<br>
${escapeHtml`  </el-hello-world>`}<br>
${escapeHtml`\``};<br>
export default helloWorldTemplate;
                    </code>
                </pre>
                <p>
                    After you come up with the tag name, you should set up the new view in the Elements service by creating a new getter and setter like this:
                </p>
                <pre>
                    <code>
public static get helloWorld() {<br>
  ;return this.getElement<HTMLElement>('el-hello-world');<br>
} set helloWorld(helloWorld: HTMLElement) {<br>
  this.helloWorld = helloWorld;<br>
}
                    </code>
                </pre>
                <p>
                    This will allow you to access the view in the controller.
                </p>
                <p>
                    Sometimes you might want to pass some data into the template. That's easily done by providing parameters to the template function. For example, if you wanted to pass a name to the template, you could do it like this:
                </p>
                <pre>
                    <code>
import { html } from '@services/elements';<br>
<br>
const helloWorldTemplate = (name: string) => html${escapeHtml`\``}<br>
${escapeHtml`  <el-hello-world>`}<br>
${escapeHtml`    <section>`}<br>
${escapeHtml`      <h1>Hello $\{name}!</h1>`}<br>
${escapeHtml`    </section>`}<br>
${escapeHtml`  </el-hello-world>`}<br>
${escapeHtml`\``};<br>
export default helloWorldTemplate;
                    </code>
                </pre>
                <p>
                    If you want to manipulate the data that you pass into the template, you will have to provide a return statement in the template function. For example, if you wanted to capitalize the name before it's rendered, you could do it like this:
                </p>
                <pre>
                    <code>
import { html } from '@services/elements';<br>
<br>
const helloWorldTemplate = (name: string) => {<br>
  name = name.toUpperCase();<br>
  return html${escapeHtml`\``}<br>
${escapeHtml`    <el-hello-world>`}<br>
${escapeHtml`      <section>`}<br>
${escapeHtml`        <h1>Hello $\{name}!</h1>`}<br>
${escapeHtml`      </section>`}<br>
${escapeHtml`    </el-hello-world>`}<br>
${escapeHtml`  \``}<br>
};<br>
export default helloWorldTemplate;
                    </code>
                </pre>
                <p>
                    Be careful the amount of functionality you try to provide in the template, though. Most of the functionality should be provided in the controller. The template should remain as simple as possible.
                </p>
                <p>
                    The last thing you should know about templates is how to handle sub-views. When you navigate to a page, sometimes you'll want to organize that section of the app into deeper views. For example, this page is in the <code  class="language-typescript">docs</code> section, with a sub-view of <code class="language-typescript">views</code> because you can see that the URL is <code class="language-typescript">/docs/views</code>. This should be done by creating another view folder within the parent view folder, importing the child view and then tacking it onto the parent view template. For example, if you had a <code class="language-typescript">home</code> view and you wanted to add a <code class="language-typescript">helloWorld</code> view to it, you would do it like this:
                </p>
                <pre>
                    <code class="language-typescript">
import { html } from '@services/elements';<br>
import helloWorldTemplate from './helloWorld/helloWorld.template';<br>
<br>
const homeTemplate = () => html${escapeHtml`\``}<br>
${escapeHtml`  <el-home>`}<br>
${escapeHtml`    <section>`}<br>
${escapeHtml`      <h1>Welcome Home!</h1>`}<br>
${escapeHtml`    </section>`}<br>
${escapeHtml`  </el-home>`}<br>
${escapeHtml`\``};<br>
homeTemplate.helloWorld = helloWorldTemplate;<br>
export default homeTemplate;
                    </code>
                </pre>
                <p>
                    This will allow you to access the <code class="language-typescript">helloWorld</code> view from the Routes file when it detects that a sub-view is being requested. (We'll get into how the Routes file works later.)
                </p>
                <h4>Controller</h4>
                <p>
                    An important thing to remember about a controller is that it's activated <i>after</i> the template is loaded. So anything you create in the template will be available to the controller. And you'll be able to do this by importing the Elements service. The controller should be a function that is exported and called in the Routes file. Let's create a new controller for the <code class="language-typescript">helloWorld</code> view. You would start out doing this:
                </p>
                <pre>
                    <code class="language-typescript">
import el from '@services/elements';<br>
<br>
export function helloWorld() {<br>
  el.title.innerText = 'Hello World!';<br>
  console.log(helloWorld);<br>
}
                    </code>
                </pre>
                <p>
                    The above code will set the title of the page (the text written in the browser tab) to 'Hello World!' and log the function to the console. This is a very simple example, but you can see how you can manipulate the DOM and the data in the view from the controller utilizing the Elements service.
                </p>
                <p>
                    Let's say you created a <code class="language-html">${escapeHtml`<button>`}</code> in the template and you wanted to add an onclick function to it. First you would give it an id in the template like this:
                </p>
                <pre>
                    <code class="language-typescript">
import { html } from '@services/elements';<br>
<br>
const helloWorldTemplate = () => html${escapeHtml`\``}<br>
${escapeHtml`  <el-hello-world>`}<br>
${escapeHtml`    <section>`}<br>
${escapeHtml`      <h1>Hello World!</h1>`}<br>
${escapeHtml`      <button id="hello-button">Say Hello!</button>`}<br>
${escapeHtml`    </section>`}<br>
${escapeHtml`  </el-hello-world>`}<br>
${escapeHtml`\``};<br>
export default helloWorldTemplate;
                    </code>
                </pre>
                <p>
                    Then you would add the function to the button in the controller like this:
                </p>
                <pre>
                    <code class="language-typescript">
import el from '@services/elements';<br>
<br>
export function helloWorld() {<br>
  el.title.innerText = 'Hello World!';<br>
  const button = el.buttons.id('hello-button');<br>
  if (button) button.onclick = () => {<br>
    console.log('Hello!');<br>
  };<br>
}
                    </code>
                </pre>
                <p>
                    I know you're thinking, "But, Steve! I know I put the button on the template, why do I have to check if it exists?" Well, pretty much all of the elements in the Elements service are nullable. This is because the Elements service is a wrapper for the native DOM elements, and sometimes the elements might not exist when you try to access them. So, you should always check if the element exists before you try to manipulate it or else TypeScript will yell at you that it's possibly null. This is a useful practice if you want to use the same controller for multpile views and some of the elements are different. If the element doesn't exist on the page, the Elements service will let you know in the console the moment you try to access it.
                </p>
                <p>
                    Also, if you're unfamiliar with that if statement syntax, it's a shorthand way of writing it that works if you only have one line of code to execute.
                </p>
                <p>
                    Also, also, it's good practice to use <code class="language-typescript">.onclick</code> rather than <code class="language-typescript">.addEventListener('click', () => {})</code>. Event listeners always have to be removed when you're done with them or else they could cause memory leaks. And, although most modern browsers will clean up after you, it's still better to be safe than sorry. The only exception to this is if you wanna add multiple event listeners for the same event to the same element at the same time, or you wanna get fancy with the event propogation. Then you should use <code class="language-typescript">.addEventListener</code> and remove them all when you're done.
                </p>
                <h4>Styles</h4>
                <p>
                    Styles for the view should be written in a CSS file in the same folder with the same name as the view. For example, the styles for the <code class="language-typescript">helloWorld</code> view should be written in a file called <code>helloWorld.css</code>. All CSS files are imported into the base <code>views/index.css</code> file like this:
                </p>
                <pre>
                    <code class="language-css">
@import './helloWorld/helloWorld.css';
                    </code>
                </pre>
                <p>
                    This will ensure that all the CSS files are loaded, but they are still separated by view so it's easier to find and manipulate them. Another good practice is to utilize the view name that you created for the view's tag name when writing CSS that is specific to that view. Like this:
                </p>
                <pre>
                    <code class="language-css">
el-hello-world .example-class {<br>
  display: flex;<br>
  justify-content: center;<br>
  align-items: center;<br>
}
                    </code>
                </pre>
                <p>
                    If you want to write global styles that apply to all views, you can write them in the <code class="language-plaintext">main.css</code> file. This is where you would put things like the body styles or the styles for global text or default buttons, etc.
                </p>
                <h4>View Index</h4>
                <p>
                    The last thing you need to know about views is very simple, but very important. They are all imported and exported into the base <code>views/index.ts</code> file. This is so that the Routes file can access them all at once. This file should look something like this:
                </p>
                <pre>
                    <code class="language-typescript">
import helloWorldTemplate from './helloWorld/helloWorld.template';<br>
import { helloWorld } from './helloWorld/helloWorld.ctrl';<br>
<br>
export { default as helloWorldTemplate } from './helloWorld/helloWorld.template';<br>
export { default as helloWorld } from './helloWorld/helloWorld.ctrl';<br>
<br>
const views = {<br>
  helloWorldTemplate,<br>
  helloWorld<br>
};<br>
<br>
export default views;
                    </code>
                </pre>
                <p>
                    Sub-views make it into this file when they are attached to their parent view, so it's not necessary to import them here.
                </p>
                <h4>Components</h4>
                <p>
                    Sometimes you'll want to create a view that is used in multiple views or multiple times in a view. This is where components come in. It gets tricky when making a view that's supposed to show up inside another view, because the way that we make a view spits out HTML, but you can't spit out HTML inside the HTML string and expect that to be spit out of the main view as the same HTML. At the same time, there are times you'll want to allow the component to stand on its own, and a plain string isn't gonna cut it in that case.
                </p>
                <p>
                    The solution that I've come  up with is pass in a boolean that controls whether or not the view is a string. It'll look like this:
                </p>
                <pre>
                    <code class="language-typescript">
import { html, htmlstring } from '@services/elements';<br>
<br>
const helloWorldButtonComponent = (string: boolean = false) => {<br>
  const button = htmlstring${escapeHtml`\``}<br>
${escapeHtml`    <button>`}<br>
${escapeHtml`      Say Hello!`}<br>
${escapeHtml`    </button>`}<br>
${escapeHtml`  \``};<br>
${escapeHtml`  return string ? button : html\`\${button}\`;`}<br>
};<br>
export default helloWorldButtonComponent;
                    </code>
                </pre>
                <p>
                    The <code class="language-typescript">htmlstring</code> function spits out a regular old string. This can be used to insert the component into the template of another view. The <code class="language-typescript">html</code> function, as you already know, will spit out an actual HTML element so that the view can stand on its own if it needs to. (In the case of a button, that probably won't be the case. But, you get the idea.) Writing the view like this allow us to not have to write the same HTML twice. You can write it first as a string and then use that same string to build an element only if you need to.
                </p>
                <p>
                    Then you can place the component in another view like this:
                </p>
                <pre>
                    <code class="language-typescript">
import views from '@views';<br>
import { html } from '@services/elements';<br>
<br>
const helloWorldTemplate = () => html${escapeHtml`\``}<br>
${escapeHtml`  <el-hello-world>`}<br>
${escapeHtml`    <section>`}<br>
${escapeHtml`      <h1>Hello World!</h1>`}<br>
${escapeHtml`      $\{views.helloWorldButtonComponent(true)}`}<br>
${escapeHtml`    </section>`}<br>
${escapeHtml`  </el-hello-world>`}<br>
${escapeHtml`\``};<br>
export default helloWorldTemplate;
                    </code>
                </pre>
                <p>
                    If you create a controller for the component, you can add that controller to the main view controller like this:
                </p>
                <pre>
                    <code class="language-typescript">
import el from '@services/elements';<br>
import views from '@views';<br>
<br>
export function helloWorld() {<br>
    el.title.innerText = 'Hello World!';<br>
    console.log(helloWorld);<br>
    views.helloWorldButtonComponent();<br>
}
                    </code>
                </pre>
                <p>
                    You can make a separate folder for components if you like, but that's up to you. It kind of depends on how many you're going to use. Just remember to add them to the view index file so your other views can access them.
                </p>
                <p>
                    That's basically how views work in Elemental. Next up, you need to know how the <a href="/docs/routes">Route</a> files work. And, yes, that's plural! You'll see why...
                </p>
            </section>
        </div>
    </el-docs>
`;

export default viewsTemplate;