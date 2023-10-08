# doodles

## Development

This project consists of a frontend client application which is supported by a backend server.

### Extensions

We use `prettier` for formatting, please install the extension from vscode.

### Client

The client consists of a React website using the Vite bundler, which is paired to an Electron application. To run the client, you'll need to install Node JS -- we recommend you use [nvm](https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/) to install Node. You'll also need a Node Package Manager to install dependencies, you should have `npm` if you've installed Node. However, we suggest you use [pnpm](https://pnpm.io/installation#using-npm) (using npm) since it's more convenient to work with.

With Node and pnpm installed, navigate to the `client` folder and run `pnpm i` to install the project dependencies. Then run `pnpm run dev` to start the frontend. The Electron application should open and you should be able to find the port the app is being served on in your terminal -- navigating to that local port in any browser should open the application as a website. It's up to you how you'd like to develop, just make sure your changes work in both. This is especially important since some things that work in Electron are not compatible with browsers, but most browser tools are compatible with Electron.

We also use [tailwindcss](https://tailwindcss.com/docs/guides/vite) for most styling, it should be mostly similar to regular css but with some syntax to get used to.

### Server

Doesn't matter yet.

### Firebase Emulator

- Install the Firebase CLI tools: `npm install -g firebase-tools`.
- Check that the install worked correctly by running `firebase --version`.
- Login to your account: `firebase login`
- If you have Java < v11, uninstall it and download a [version 11.0.15](https://www.oracle.com/ca-en/java/technologies/javase/jdk11-archive-downloads.html)
