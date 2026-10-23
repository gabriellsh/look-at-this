// Add your demos here. Each entry becomes a card.
//
// id          unique slug
// title       card title
// description one or two sentences
// url         where "Open demo" goes; also embedded in the live preview if `embed` is true
// embed       true to show the url in an iframe preview (the target must allow framing)
// image       optional screenshot path (put files in /public and use './shots/foo.png')
// repo        optional source link
// tags        free-form labels, used by the filter bar
// year        shown on the card
//
// With no `image` and no `embed`, a generative cover is drawn from the id.

export const GITHUB_USER = 'gabriellsh';

export const demos = [
  {
    id: 'sample-orbit',
    title: 'Orbit',
    description: 'Placeholder demo. Replace me with something you built — a tiny physics toy, maybe.',
    url: 'https://github.com/gabriellsh',
    tags: ['sample', 'canvas'],
    year: 2026,
  },
  {
    id: 'sample-palette',
    title: 'Palette Thief',
    description: 'Placeholder demo. Pull dominant colors out of any image, right in the browser.',
    url: 'https://github.com/gabriellsh',
    tags: ['sample', 'tool'],
    year: 2026,
  },
  {
    id: 'sample-wiki',
    title: 'Embedded preview',
    description: 'Placeholder showing a live iframe preview. Set `embed: true` on demos that allow framing.',
    url: 'https://example.com',
    embed: true,
    tags: ['sample', 'embed'],
    year: 2026,
  },
  {
    id: 'sample-synth',
    title: 'Pocket Synth',
    description: 'Placeholder demo. A Web Audio toy with four oscillators and too many knobs.',
    url: 'https://github.com/gabriellsh',
    tags: ['sample', 'audio'],
    year: 2025,
  },
];
