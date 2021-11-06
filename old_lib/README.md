# TypeScript NPM Package
Scaffold TypeScript npm packages using this template to bootstrap your next library.

This project includes:
- [TypeScript](https://www.typescriptlang.org/)
- [Rollup](https://rollupjs.org/)
- [Microsoft API Extractor](https://api-extractor.com/)
- [TypeDoc](https://typedoc.org/)

## Usage

The following tasks are available for `npm run`:

- `dev`: Run Rollup in watch mode to detect changes to files during development
- `build`: Run Rollup to build a production release distributable
- `build:types`: Run Microsoft API Extractor to rollup a types declaration (`d.ts`) file 
- `docs`: Run TypeDoc for TSDoc generated documentation in the "*docs/*" folder
- `clean`: Remove all build artifacts

**From your library project**, issue the `npm link` command:

```
npm link
```

Start Rollup in watch mode:

```
npm run dev
```

**Create a test app project**, by doing the following:

To use your npm package library locally for development, create a new project in a separate folder:

```
mkdir test-app && cd test-app
npm init
```

Take the defaults from `npm init`; then, add TypeScript:

```
npm install typescript --save-dev
```

In the package.json of your test app, add the following two things:
- Set the `type` of your package to `module`
- Add a `start` script to execute your app

```json
"type": "module",
"scripts": {
  "start": "tsc && node index.js",
},
```

Link to your library using the `npm link <name>` command - be sure the `<name>` matches your library's package.json name.  For example:

```
npm link typescript-npm-package
```

Add a "*tsconfig.json*" file to your test app that includes a `baseUrl` and references the `paths` to your npm linked module.  Again, be sure the `paths` name matches your library's package.json name.  For example:

```json
{
  "compilerOptions": {
    "target": "es6",
    "module": "esnext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "typescript-npm-package": ["node_modules/typescript-npm-package/src"],
      "typescript-npm-package/*": ["node_modules/typescript-npm-package/src/*"]
    }
  }
}
```

Now, run your app via `npm start`.

As an example, if your library's "*index.ts*" file contained:

```ts
export const sayHi = () => {
  console.log("Hi");
};
```

...your test app would implement an import using your package name, such as:

```ts
import { sayHi } from "typescript-npm-package";

sayHi();
```
