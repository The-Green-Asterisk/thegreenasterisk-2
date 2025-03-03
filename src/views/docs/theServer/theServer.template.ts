import { html } from "@services/elements";

const theServer = () => html`
    <el-docs>
        <div class="content-slate">
            <section>
                <h1>The Server</h1>
                <p>
                    The server is just a simple Node.js application. Elemental is largely focused on the front end, but understanding the backend will help you build more complex applications and, if you want to, integrate a database.
                </p>
                <p>
                    If you've already downloaded Elemental, go ahead and open up <code class="language-plaintext">server/main.ts</code> to follow along. Alternatively, you can follow along on <a href="https://github.com/lordsteve/elemental/blob/master/server/main.ts" target="_blank">github</a>.
                </p>
                <h4>Follow the Data</h4>
                <p>
                    Whenever I'm debugging, I always tell myself to "follow the data". This means to trace through the code in your head and see what parts of it are being hit based on what you believe the data should be. So you can see in the <code class="language-plaintext">main.ts</code> file that we're importing a few things and setting up the server. The <code class="language-typescript">CreateServer()</code> function takes two arguments: <code class="language-typescript">req</code> and <code class="language-typescript">res</code>. These are the request and response objects that are passed to the server when a request is made. The data that you are following here is the <code class="language-typescript">req</code>.
                </p>
                <p>
                    As you can see, we're extracting three things from the <code class="language-typescript">req</code> object: the <code class="language-typescript">url</code>, the <code class="language-typescript">headers</code>, and the <code class="language-typescript">method</code>. The <code class="language-typescript">url</code> is the path that the user is trying to access, the <code class="language-typescript">headers</code> are the headers that the user is sending with the request, and the <code class="language-typescript">method</code> is the type of request that the user is making (GET, POST, etc.). We're using these three pieces of data to determine what to do with the request. The <code class="language-typescript">headers</code> and the <code class="language-typescript">method</code> are consts; they should never change. The <code class="language-typescript">url</code>, on the other hand, is a let, because we're going to have to manipulate it a bit to get to what we want.
                </p>
                <p>
                    After we extract those, we use NodeCache to create a cache session. This will be used to store a unique CSRF token and sessionId. Ideally, these these will be held onto for no longer than five minutes. If the method is not GET, the application will first request a CSRF token (via GET), and <i>then</i> it will send the actual request with the CSRF token in the headers. Then the server will take the token and match it up to the sessionId in the cache. If the token is correct, the data will keep on moving through the code, otherwise the server will return a 403 Forbidden error.
                </p>
                <p>
                    The next thing the data hits is a simple switch statement. Based on what the url is, it will either get the favicon, get the CSRF token, or, in the default instance, continue on to either get something or store something. This is where it'll look to see if the url is in the <code class="language-plaintext">/views/</code>, <code class="language-plaintext">/storage/</code>, or <code class="language-plaintext">/data/</code> directories. If it's in the <code class="language-plaintext">/views/</code> directory, it'll serve an HTML file. If it's in the <code class="language-plaintext">/storage/</code> directory, it'll serve a file from the <code class="language-plaintext">www/storage</code> directory. If it's in the <code class="language-plaintext">/data/</code> directory, it'll serve data from a database.
                </p>
                <h4>Views</h4>
                <p>
                    When the code gets to this point, it'll check the headers for the <code class="language-plaintext">x-requested-with</code> header which should be "Elemental". This is just another precaution to make sure that the request is coming from your application and not from a malicious source. If the header is not "Elemental", the server will return a 403 Forbidden error.
                </p>
                <p>
                    If the url is in the <code class="language-plaintext">/views/</code> directory. The server will look for the file in the <code class="language-plaintext">www/views</code> directory and serve it up. Look in your <code class="language-plaintext">src/views</code> directory and you'll see a bunch of template.ts files. These are the views that the server can see. If the server doesn't find one of these files, it'll default to the <code class="language-plaintext">index.html</code> file. Which is how you get to see the site in the first place!
                </p>
                <h4>Storage</h4>
                <p>
                    Storage is real simple. If the url is in the <code class="language-plaintext">/storage/</code> directory, the server will look for the file in the <code class="language-plaintext">www/storage</code> directory and serve it up. This is useful for serving pictures or downloadables like pdfs or docs or whatever.
                </p>
                <h4>Data</h4>
                <p>
                    The <code class="language-plaintext">/data/</code> directory is a little more complex. At its very basic, the server will pass the request to the <code class="language-typescript">Routes</code> class and get a response back. I know you learned about a Routes class in the <a href="/docs/routes">Routes</a> section, but that was for the front end. This is a little different, but is based on the same principles. You can see that after a new Routes class is made, it will call up the <code class="language-typescript">response</code> property and extract the <code class="language-typescript">response</code>, <code class="language-typescript">header</code>, and <code class="language-typescript">status</code> from it. The <code class="language-typescript">response</code> is the data that the server will send back to the client, the <code class="language-typescript">header</code> is the type of data that the server will send back, and the <code class="language-typescript">status</code> is the status code that the server will send back. These are attached to the <code class="language-typescript">res</code> object and thereby served up to the client.
                </p>
                <p>
                    Go ahead and open up the <code class="language-plaintext">server/routes.ts</code> file. You'll see that the <code class="language-typescript">Routes</code> class will take the url from the request, remove the <code class="language-plaintext">/data/</code> part, and then use the rest to find the right controller and method to call. The controller will then return the data that the server will send back to the client.
                </p>
                <p>
                    You'll also see a <code class="language-typescript">@Method</code> decorator. This is a little bit of TypeScript magic that will check the method of the request and make sure that it's the right one. If it's not, the server will return a 405 Method Not Allowed error. If it is, the server will call the controller and get the data to send back to the client.
                </p>
                <h2>Controllers</h2>
                <p>
                    The controller is where the magic happens. It's where the server will take the request and do something with it. All new controllers should inherit from the <code class="language-typescript">BaseController</code> class. This class has a few methods that will help you build your controller. <code class="language-typescript">readBody()</code> will take the request and return the JSON data that the client sent in an easy-to-use object. <code class="language-typescript">parseUrlQuery()</code> will take the request and return the query parameters that the client sent in an easy-to-use object.
                </p>
                <p>
                    From there you can just build your own methods based on whatever it is that you need the app to do. If you're familiar with the concept of controllers already, you may be expecting to see a connection to a database here. At its most basic, Elemental doesn't have a database connection, however, if you do want to use one, we implement TypeORM to set up whatever databse you want to use. <a href="https://typeorm.io/" target="_blank">TypeORM</a> has its own documentation that you can follow to set up your database, but there are a few things that are specific to Elemental that you should know.
                </p>
                <h4>TypeORM Setup</h4>
                <p>
                    When you create new entities, you should put them in the <code class="language-plaintext">server/services/database/entity</code> directory. This is where the server will look for them. After you create or edit your entities, the migration for them should go in the <code class="language-plaintext">server/services/database/migration</code> directory, but you're not gonna just create a new file and put it in there. We've got a script set up for generating migrations. You can run <code class="language-plaintext">npm run migration:generate server/services/database/migration/{migration name}</code> to create a new migration file. This will create a new file in the <code class="language-plaintext">server/services/database/migration</code> directory that you can then run with <code class="language-plaintext">npm run migration:run</code>. And if you mess it up, you can run <code class="language-plaintext">npm run migration:revert</code> to revert the last migration.
                </p>
                <p>
                    <code class="language-plaintext">data-source.ts</code> will use environment variables to connect to the database. If your system doesn't have environment variables, you can use a <code class="language-plaintext">.env</code> file to set them up. You can see an example of this in the <code class="language-plaintext">.env.example</code> file. You must have variables for, <code>DB_HOST</code>, <code>DB_PORT</code>, <code>DB_USER</code>, <code>DB_PASS</code>, and <code>DB_NAME</code>. In <code class="language-plaintext">data-source.ts</code> you can also set the type of database that you're using. By default we use mysql, but you can change it to whatever you want that's supported by TypeORM. You could also set that up to use an environment variable if you're into that kind of thing.
                </p>
            </section>
        </div>
    </el-docs>
`;

export default theServer;