# look-at-this

A tiny gallery for previewing my demos before opening them. Built with React + Vite, deployed as a static site to GitHub Pages.

## Develop

```sh
npm install
npm run dev
```

## Add a demo

Edit `src/demos.js`. Each entry becomes a card; clicking the cover opens a preview modal
(live iframe if `embed: true`, otherwise a screenshot from `image`, otherwise a generative cover).
Screenshots go in `public/` and are referenced as `./shots/name.png`.

## Deploy

`npm run build` outputs a static site to `dist/`. The included workflow
(`.github/workflows/deploy.yml`) builds and publishes it on every push to `main` —
enable it under **Settings → Pages → Source: GitHub Actions**.
