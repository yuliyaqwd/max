# Max mascot illustrations

The 5×5 mascot sheet has been split into 25 individual transparent PNG assets:

- `assets/max-stage/max-stage-01.png` … `max-stage-25.png`
- Export canvas: 1024 × 1024 px per pose.
- The 25 assets are loaded by `src/MaxView.tsx` through `MAX_STAGE_PHOTOS`.
- Both the Profile and Max tabs render the same `MaxPortrait` component, so they show the same selected pose and equipped cosmetics.

Note on image fidelity: the supplied source sheet was 1254 × 1254 px. Each tile therefore contains roughly 251 × 251 px of original image information and has been enlarged to a 1024 × 1024 PNG canvas using high-quality resampling. This increases the file dimensions but does not create true native 1024 px detail. For genuinely sharper close-ups, each pose should be regenerated individually at high resolution.
