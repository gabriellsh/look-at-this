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

Demos that live in this repo are separate pages of the same Vite build:

1. Add `demos/<slug>/index.html` pointing at `src/demos/<slug>/main.jsx`.
2. Register the page in `build.rollupOptions.input` in `vite.config.js`.
3. Add an entry to `src/demos.js` with `url: './demos/<slug>/'` and `embed: true`.

## Demos

- **Background Blur Lab** (`src/demos/background-blur-lab/`) — MediaPipe selfie segmentation
  with Meet-style blur and background replacement, all on-device. The MediaPipe version is
  read from the installed `@mediapipe/tasks-vision` package, so the CDN WASM always matches it.
  Camera access needs HTTPS or `localhost`.

## Deploy

`npm run build` outputs a static site to `dist/`. The included workflow
(`.github/workflows/deploy.yml`) builds and publishes it on every push to `main` —
enable it under **Settings → Pages → Source: GitHub Actions**.
