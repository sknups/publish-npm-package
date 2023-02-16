# javascript-template

Template for directly authoring a JavaScript program at SKNUPS.

JavaScript may be authored directly for execution on Node.js .

---

## Quickstart

Execute the local build script:

```shell
./build.sh
```

Run the example program:

```shell
node index.js
```

---

## Writing an executable program

To create a program which can be executed:

- modify the `name` and `repository.url` properties in `package.json` to suit your project
- write your business logic under the `src` directory
- write your unit tests under the `test` directory
- modify executable code in `index.js`
- run the local build script (`build.sh`)

---

## Writing a library package

To create an npm package which can be published to Artifact Registry:

- modify the `name` and `repository.url` properties in `package.json` to suit your project
- write your business logic under the `src` directory
- write your unit tests under the `test` directory
- delete executable code from `index.js`
- write some `export` declarations in `index.js`
- delete the line `private: true` from `package.json`
- run the local build script (`build.sh`)

N.B. do not modify the `version` property in `package.json`, leave it as `0.0.1-snapshot`.


### Publish a pre-release artifact (a "snapshot")

- create a Pull Request
- merge your changes to `main` branch

This causes a pre-release artifact to be published, e.g. version
`0.0.1-snapshot.1665506815`.

### Publish a versioned artifact

- create a new tag in GitHub e.g. `v1.0.0`

This causes a release artifact to be published, e.g. version `1.0.0`.

---

