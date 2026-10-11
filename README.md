# yanneshmeijman.com

Static rebuild of the Cargo site (original design by Studio SMS). No build step:
every page is a plain HTML file, so what you see in the folder is what gets published.

```
index.html                      home (background loop + draggable business card)
projects/index.html             project list, one full-height row per project
about/index.html                biography, CV columns, flying pigeon
<project-slug>/index.html       one page per project
assets/css/site.css             all styling (fonts, sizes, colours at the top)
assets/js/site.js               background videos, drag, pigeon, image zoom
assets/media/                   images and videos (web-optimised)
assets/fonts/                   VCR OSD Mono
_cargo-backup/                  original files downloaded from Cargo (not published)
```

## Preview locally

```bash
python3 -m http.server 8420
```

Then open http://localhost:8420.

## Common edits

- **Background loop**: a `<div class="backdrop" data-youtube="VIDEO_ID">` plays a muted
  YouTube loop. Use `data-video="/assets/media/file.mp4"` for a self-hosted clip.
  `data-fit="cover"` fills the box; `contain` fits the whole frame.
- **New project**: copy a section in `projects/index.html` and a folder like `incendios/`.
- **Fonts**: Gravity and Walter Neue were licensed to Cargo only. Archivo and Inter stand
  in for them. To switch, change `--font-display` and `--font-body` in `site.css`.
