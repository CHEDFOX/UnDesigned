# Campaigns

One folder per campaign, for example `campaigns/2026-11-launch/`:

```
campaigns/2026-11-launch/
├── brief.md              copy of templates/briefs/creative-brief.md, filled in
├── poster.copy.json      words for each piece, checked with `npm run check:copy`
└── story.copy.json
```

A `.copy.json` file holds one piece (`{ "format": "poster", "headline": "...", ... }`) or a list of them. See foundations/messaging/README.md.
