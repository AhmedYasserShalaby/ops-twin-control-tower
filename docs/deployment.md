# Deployment

OpsTwin is a static Vite app deployed through GitHub Pages.

Expected public URL:

- https://haloxd1.github.io/ops-twin-control-tower/

## GitHub Pages

1. Repository must be public.
2. Repository Settings -> Pages.
3. Source: GitHub Actions.
4. Push to `main`.

The workflow builds the app and uploads `dist/`.

## Local Production Check

```bash
npm run build
npm run test:e2e
```
