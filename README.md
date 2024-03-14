<span title="floralyfe logo">
 <p align="center">
  <img width="100px" src="./client/public/doodles-icon.svg" alt="doodles-img">
 </p>
</span>

<h1 align="center" style="margin-top: 0px;">✏️ doodles</h1>

> **Doodles** is a virtual, collraborative, real-time whiteboard application that aims to boost productivity. The application features an intuitive interface that serves as a flexible canvas for drawing shapes, attaching images, generating them with Stable Diffusion, documenting with text-based notes, and annotating files— all of which are supported by rich customization options. The application also supports screen-sharing, and all this functionality is extended in a native desktop application, that doubles as a transparent whiteboard widget.

## Contributors
Floralyfe was developed throughout Fall 2023 - Winter 2024 by \
[Abdalla Abdelhadi](https://github.com/AbdallaAbdelhadi) \
[Dana El Sherif](https://github.com/TheDana1) \
[Ibrahim Almalki](https://github.com/Eebro) \
[Yousef Yassin](https://github.com/Yyassin) \
[Zakariyya Almalki](https://github.com/zackzouk)

## Features
The *Doodles* system enhances the efficacy of online work by streamling virtual collaboration and brainstorming for teams. To facilitate online collaboration, *Doodles* provides the functionality below.

### Functionality
**Drawing Elements:** The system allows users to use a variety of tools to draw geometric shapes, freehand curves, insert text, attach links/files, and insert/generate images.

**Saving and Loading of Boards:** Users can save their board content locally or in the cloud. Cloud boards can be viewed and managed from a central dashboard, while both cloud and locally saved boards can be loaded to resume work.

**Board Customization:** The system allows users to customize board elements via deletion, resizing, translation, rotation, and various drawing styles like stroke sizes, fill colours, fill styles, opacity, etc. Undo and redo of actions is also supported.

**Screen Annotation and Sharing:** The system functions as a native desktop application with a transparent canvas mode that allows users to annotate anything on their desktop. Screensharing desktop and browser screens is also supported for collaborative annotation.

**Board Documentation:** The system allows users to title their boards, add custom tags for search-based retrieval, and add element-specific comments for comprehensive documentation.

**Infinite Canvas:** The system supports an infinite canvas that can be panned, scrolled, and zoomed in/out continuously to ensure ample space for collaboration.

**Board Exporting:** Users have the option to export their work in PDF or PNG formats, making it easier to save and integrate their creations within other documents.


## Development
*Doodles* consists of three primary nodes; a frontend client application which is support by two backend applications, one node REST server, and the other a Python REST server.

### Software Requirements
You'll need a few things before you can start hosting a *Doodles* system. The materials needed to build a single client are provided below.
- [NodeJS v18+](https://nodejs.org/en/download/current/)
- [Python 3.9+](https://www.python.org/downloads/)
- [ngrok](https://ngrok.com/)
- The files in this repository and their dependencies (see instructions below on installing these).

### Extensions
We use `prettier` for formatting, please install the extension from vscode. You may also want to install the `eslint` extension to catch linting issues quickly. We use [tailwindcss](https://tailwindcss.com/docs/guides/vite) for most styling, it should be mostly similar to regular css but with some syntax to get used to.


### Client

The frontend client is found within the `/client` directory, and consists of a React website using the Vite bundler, which is paired to an Electron application. To run the client, you'll need to install Node JS -- we recommend you use [nvm](https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/) to install Node. You'll also need a Node Package Manager to install dependencies, you should have `npm` if you've installed Node. However, we suggest you use [pnpm](https://pnpm.io/installation#using-npm) (using npm) since it's more convenient to work with.

With Node and pnpm installed, navigate to the `client` folder and run `pnpm i` to install the project dependencies. Then run `pnpm run dev` to start the frontend. The Electron application should open and you should be able to find the port the app is being served on in your terminal -- navigating to that local port in any browser should open the application as a website. It's up to you how you'd like to develop, just make sure your changes work in both. This is especially important since some things that work in Electron are not compatible with browsers, but most browser tools are compatible with Electron.

#### Directory Structure

The `/electron` directory stores the files that host the desktop application, and `/src` contains the actual frontend. Our tests are in the `tests` folder. Within `/src`, the `/components` directory holds our interface components, `/hooks` stores various React effects used in various components, and `/stores` contains various state storages. Teh remaining `/api`, `/lib`. `/ipc`, and `/firebaseDB` containing according helper and utility functions used throughout the application.

### Backend Node Server

The backend Node server serves as both a REST server to interface with Firebase, and as a WebSocket Server. The server is found within the `/node` directory and also requires the Node JS install from above. Before installing the packages, you must navigate to the `/mod/FastFire` directory and build `FastFire`, our firebase ORM, by running `yarn install && yarn build` (yes, you need to install `yarn` if you don't have it: `npm i -g yarn`). Once that's done, you can navigate to the `node` directory and install packages with `pnpm i`. Running `pnpm run dev` will start the node server on port `3005`.

#### Directory Structure

The `/test` directory houses all our unit tests, while the source code is in `/src`. The source code is split into the `/api` folder which stores our REST server routers and controller for all our database modes, the `/firebase` folder which contains Firebase connection initialization code, along with `/models` to store our table schemas. The `/lib` directory stores code relating to WebSockets and WebRTC interaction management, and make use of the utility function helpers and classes in `/utils`.

### Firebase Emulator
Our node backend tests make use of a Firebase emulator. Follow these steps to install it:

- Install the Firebase CLI tools: `npm install -g firebase-tools`.
- Check that the install worked correctly by running `firebase --version`.
- Login to your account: `firebase login`
- If you have Java < v11, uninstall it and download a [version 11.0.15](https://www.oracle.com/ca-en/java/technologies/javase/jdk11-archive-downloads.html)

### Backend Python Server

The backend Python server is a Flask server that serves a single REST endpoint to support stable diffusion. The server is found in the `sd` folder. We suggest you use [`pipenv`](https://pipenv.pypa.io/en/latest/) to create a virtual environment to install the dependencies by running `pipenv install` inside the directory. The server is then started by running the bash script `./bootstrap.sh`.

#### Directory Structure
The `/models` directory stores the models of supported REST payload schemas, while the `/util` directory stores a utility for converting between image file types (binary and base64), in addition to the actual stable diffusion pipeline class. Everything is put together in the REST server controller within `index.py`.

## Next Steps
- Automated User Interface Testing with TestCafe
- Rendering Optimization (less reactive, reducing re-renders, and optimizing element selection queries with space-partitioning data structures such as quadtrees)
- Additional Canvas Features: polyfill, layering, background patterns such as grid, lines, dots, etc.
- Language model integration to allow users to ask questions about the content on a board
- Training our own sketch-based Stable Diffusion Model
