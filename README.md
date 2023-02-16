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
    steps:
      - name: Publish npm package
        uses: sknups/publish-npm-package@v1
        with:
          service-account-key-json: ${{ secrets.YOUR_SERVICE_ACCOUNT_KEY_JSON }}
```
