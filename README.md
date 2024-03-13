# publish-npm-package

This is a GitHub Action for publishing npm packages to **Google Cloud Artifact Registry**.

---

## Versioning

This GitHub Action will manage the versioning of the npm packages it publishes.

It is not necessary for developers to manually set the `version` property in `package.json`. 

### branches

If this Action is run from a Git branch, it will publish an npm package with a dynamically generated
version, e.g.

`0.0.1-snapshot.1709644075`

The suffix is the epoch time (in seconds) of the Git commit.

We recommend only using this Action on the `main` branch.

### tags

If this Action is run from a Git tag, it will publish an npm package with using the tag name as the version number, e.g.

tag `v1.2.3` → version `1.2.3`

---

## Google Cloud

We have two npm registries in Google Cloud Artifact Registry:

| npm registry   | npm package scope  | read access | write access |
|----------------|--------------------|-------------|--------------|
| `npm`          | `@sknups`          | public      | needs auth   |
| `npm-internal` | `@sknups-internal` | needs auth  | needs auth   |

We have three service accounts, each allowing GitHub Workflows to authenticate to read / write to the npm registries:

| service account        | purpose                           |
|------------------------|-----------------------------------|
| npm-public-writer-gh   | write to `npm` registry           |
| npm-internal-reader-gh | read from `npm-internal` registry |
| npm-internal-writer-gh | write to `npm-internal` registry  |

We also have a Workload Identity Pool which supports GitHub OpenID Connect, so we dont need to create long-lived credentials as secrets.

We explicitly configure which Git repositories need to read / write to each npm registry, using a Terraform module.

```terraform
module "artifact_registry" {

  source   = "./modules/artifact_registry"
  location = local.location
  project  = local.project
  
  npm_internal_reader_repositories = [
    "sknups/project-one",
    "sknups/project-two"
  ]
  
  npm_internal_writer_repositories = [
    "sknups/project-three",
    "sknups/project-four"
  ]
  
  npm_public_writer_repositories = [
    "sknups/project-five"
  ]
  
  workload_identity_pool_name = module.github_oidc.workload_identity_pool_name
  
}
```

---

## Usage

### .npmrc

In the root of your project, create an `.npmrc` file describing your company's npm registries.

Each registry is associated with a distinct npm package scope.

```npmrc
@sknups:registry=https://europe-west2-npm.pkg.dev/sknups/npm/
@sknups-internal:registry=https://europe-west2-npm.pkg.dev/sknups/npm-internal/
//europe-west2-npm.pkg.dev/sknups/npm-internal/:always-auth=true
engine-strict=true
```
In the example above:

- the package scope `@sknups` is mapped to a registry named `npm`
- the package scope `@sknups-internal` is mapped to a registry named `npm-internal`

Both registries are in Google Cloud Artifact Registry, in the London region (`europe-west2`).

Packages in the `npm` registry may be downloaded by the public.

Packages in the `npm-internal` registry may only be downloaded by authenticated users.

### package.json

```json
{
  "name": "@sknups-internal/project-name",
  "version": "0.0.1-snapshot",
  "private": false,
  ...
}
```
Ensure that your project name is prefixed with the appropriate scope, e.g. `@sknups-internal`.

Ensure that the `version` property is set to `0.0.1-snapshot`, there is no need for developers to manually alter this value.

Ensure that the `private` property is set to `false`, or is absent.

### Example GitHub Workflow

Notice we use `google-github-actions/auth@v2` to authenticate using a service account, then write short-lived credentials to a file consumed by this Action.

`.github/workflows/push-to-main.yml`
```yaml
---
name: Push to main

'on':
  push:
    branches:
      - 'main'
    tags:
      - 'v*'

jobs:

  publish:
  
    name: 'Build & Publish'
    runs-on: ubuntu-22.04
    timeout-minutes: 5

    permissions:
      contents: "read"
      id-token: "write"

    steps:

      - name: Checkout
        uses: actions/checkout@v4

      - name: Install Nodejs 18
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
     
      - name: Configure npm
        shell: bash
        run: |
          npm config set update-notifier false
          npm config set audit false
          npm config set fund false

      - name: Install dependencies
        shell: bash
        run: |
          npm ci

      - name: Build
        shell: bash
        run: |
          npm run build

      - name: Authenticate Google Cloud
        id: 'auth'
        uses: 'google-github-actions/auth@v2'
        with:
          workload_identity_provider: projects/702125700768/locations/global/workloadIdentityPools/github-identity-pool/providers/github-identity-provider
          service_account: npm-public-writer-gh@sknups.iam.gserviceaccount.com

      - name: Publish npm package
        uses: sknups/publish-npm-package@v2
        with:
          credentials_file_path: ${{ steps.auth.outputs.credentials_file_path }}
```
