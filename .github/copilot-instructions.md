# Copilot Instructions

## Build, test, and lint

- No repository-local build, test, or lint commands are defined. There is no `package.json`, test runner config, or lint config in this repo.
- Manual smoke test flow: open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select `src\daring-fireball-without-politics`.

## High-level architecture

- This is a plain Manifest V3 Chromium extension rooted at `src\daring-fireball-without-politics`. `manifest.json` directly wires the runtime pieces; there is no bundling or transpilation step.
- `background.js` is a service worker used only to initialize and migrate synced settings. On install/update it seeds `blockedKeywords` with defaults when storage is empty, and it also corrects the legacy misspelling `"kentanji"` to `"ketanji"`.
- `options.html` and `options.js` implement the extension's only UI. The options page reads and writes `blockedKeywords` in `chrome.storage.sync`, shows one keyword per line, and exposes a reset action back to the default list.
- `content.js` owns the actual filtering behavior on `daringfireball.net`. It reads `blockedKeywords` from sync storage, injects a `.dfwp-hidden` style once, and filters Daring Fireball entry markup by scanning each `dl.linkedlist` block.
- Filtering is paired to the site's `dt`/`dd` structure: each entry matches against combined title and summary text, matching entries are hidden, a whole `dl.linkedlist` is hidden when every `dd` in it matches, and the preceding `.dateline` element is hidden only when its entire list is hidden.
- The content script is designed to survive dynamic rerenders: it reapplies filtering after storage changes and through a debounced `MutationObserver`.

## Key conventions

- `blockedKeywords` in `chrome.storage.sync` is the central cross-file contract. Keep that key name and data shape stable if behavior changes.
- Keyword normalization is intentionally lowercase, trimmed, deduplicated text. The options page also sorts keywords for stable display; the content script only normalizes enough for matching.
- Default keywords are duplicated in `background.js` and `options.js`. If the defaults change, update both files together.
- Matching is substring-based against the combined `dt` title text and `dd` summary text, not exact-word matching and not title-only matching.
- This code assumes Daring Fireball's current DOM conventions (`dl.linkedlist`, paired `dt`/`dd`, preceding `.dateline`). Site markup changes will usually require updates in `content.js`, not in the manifest or options page.
- The README note that no data is sent anywhere else is implemented through exclusive use of `chrome.storage.sync`; preserve that local-only behavior.
