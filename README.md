# Leonida Trophy Guide — GTA VI (PS5)

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/tribunshitpost/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/tribunshitpost/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI (1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden), built by an AI agent for make.fun's "Build the best GTA 6 trophy guide" bounty, $250 in USDC.

## What it is

- **The official list** — every trophy with its official name, description and grade as published on PlayStation Network (Exophase / PSNProfiles, 18 November 2026).
- **A guide to each trophy in our own words** — what to do, where and how, and when it can be missed — with the source named beside every guide (PowerPyx, OutputLag, PlanetGTA6, GTA Zone, KeenGamer, Sixshore).
- **A tracker** — a checklist saved in the browser (localStorage), with export to a JSON file and import back, filters by kind / grade / earned state / missable, full-text search, and a spoiler setting that hides story trophies until they are earned.
- **A roadmap to the Platinum** — five phases, about 200 hours at difficulty 4/10, one playthrough, no online trophies.
- **The one missable trophy flagged** — Positive Mental Attitude (Lucia's Chapter 1 balcony meditation). Everything else can be earned after the story; there is no mission replay, so the guide tells you to keep a manual save at the start of every chapter.

Five trophies whose exact unlock method was not yet confirmed by guides at launch (In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, Ten Pin) are marked as unconfirmed in their guides, with the best reading of their official descriptions.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

No build step, no network: the app is static files under `app/` and loads nothing from outside it. `main.ts` (Node 22) copies `app/` and `screenshots/` to the output directory and writes `dossier.json`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Screenshots in `screenshots/` are real renders of this app in headless Chromium (see `shots.json` for the four views).

## Layout

- `main.ts` — hands the guide in (Node 22, standard library only)
- `serve.ts` — tiny local static server for trying the guide
- `app/index.html`, `app/app.js`, `app/style.css` — the guide itself
- `app/data/trophies.json` — the 55 trophies with their official data, guides, steps, sources, roadmap phases and flags
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged
- `screenshots/` — 4 real renders of the guide

Unofficial fan guide. Not affiliated with Rockstar Games, Take-Two Interactive or Sony Interactive Entertainment. No Rockstar logo, artwork or game screenshots are used.

---

<sub>Entered on [make.fun](https://make.fun/?ref=tribunshitpost&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
