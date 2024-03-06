# publish-npm-package

This workflow publishes an npm package to SKNUPS Artifact Registry.

### Example usage

`.github/workflows/push-to-main.yml`
```yaml
---
name: Push to main

'on':
  push:
    branches:
      - main
    tags:
      - v*

jobs:

  publish:
    name: Publish
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

      - name: Execute ESLint
        shell: bash
        run: |
          npm run lint

      - name: Generate sources
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
