# Leonida Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/tribunshitpost/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/tribunshitpost/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for every PlayStation 5 trophy in **Grand Theft Auto VI** — all 55 of them (1 Platinum, 2 Gold, 6 Silver, 46 Bronze), with a guide to each one written in our own words, a checklist that saves in your browser, and a five-phase road to the Platinum.

## What it does

- **Every trophy, exactly as PlayStation lists it.** Names, descriptions and grades are the official ones, including all 28 hidden trophies.
- **A guide per trophy, in our own words.** Each one explains how to earn it, lists the steps, and names the guide or list it draws on. Five trophies are marked **method unconfirmed** — no public guide had pinned their method down at launch, and this guide says so instead of guessing.
- **A checklist that remembers you.** Tick trophies off as you earn them; progress is saved in your browser (localStorage) and can be exported as JSON and imported again.
- **Find it fast.** Full-text search, filters by kind (story, activities, collectibles, robbery, money, exploration), grade, earned status, hidden-only and missable-only.
- **A spoiler guard, on by default.** Story trophy names and descriptions stay hidden until you earn them, so browsing the list cannot spoil the plot.
- **The one missable trophy, up front.** *Positive Mental Attitude* — meditate at every spot across Leonida — can be missed in Chapter 1 (Lucia's balcony meditation), and there is no mission replay. The guide says so before anything else, and suggests keeping a manual save at the start of every chapter.
- **A five-phase roadmap to the Platinum.** About 200 hours, difficulty 4/10, one playthrough, no online trophies.

## Run it locally

```sh
node serve.ts        # http://localhost:8080 (or: node serve.ts --port 3000)
```

The app is fully offline: it loads `app/data/trophies.json` from its own server and makes no network requests at all. Open `app/index.html` straight from disk and the checklist will not load — the data file needs a server, even a local one, so use `serve.ts`.

## Build the submission

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` into the output directory and writes `dossier.json` with the vendored make.fun library.

## Files

| Path | What it is |
| --- | --- |
| `app/index.html` | The page: header, progress, filters, roadmap, checklist, sources |
| `app/style.css` | The dark "Vice nights" design |
| `app/app.js` | Checklist, filters, spoiler guard, export/import, deep links |
| `app/data/trophies.json` | All 55 trophies, guides, steps, sources, and the roadmap |
| `main.ts` | Copies the app and screenshots, writes `dossier.json` |
| `serve.ts` | Tiny static server for local development |
| `shots.json` | The four screenshots and what each one shows |
| `screenshots/` | 1280×800 screenshots of the guide in use |

## Deep links

The guide understands a few URL parameters: `?open=<id>` opens one trophy, `?kind=robbery` filters by kind, `?q=fishing` searches, and `?spoiler=off` turns the spoiler guard off.

## Honest limits

GTA VI is not out yet. This guide is built from the official trophy list and the published guides linked beside each trophy, and it will be wrong in places — especially the five trophies marked **method unconfirmed**. Where a method is a community guess rather than a confirmed unlock, the guide says so. If you find a method that contradicts one here, the cited source is the place to check first.

## Sources

Official trophy names, descriptions and grades are shown exactly as PlayStation publishes them. Each guide cites its sources beside the trophy; the guides this project drew on include PowerPyx, OutputLag, PlanetGTA6, GTA Zone, KeenGamer, Sixshore, Exophase and PSNProfiles.

## License

MIT — see `LICENSE`. Unofficial fan guide, not affiliated with Rockstar Games, Take-Two Interactive or Sony Interactive Entertainment. No Rockstar logo, artwork or game screenshots are used.
