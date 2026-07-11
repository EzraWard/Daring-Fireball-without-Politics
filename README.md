# Daring Fireball without Politics
A browser extension that allows for blocking of posts containing political commentary.

## Notes

- Filters Daring Fireball entries by matching blocked keywords against both the post title and summary text.
- Stores blocked keywords in `chrome.storage.sync`; no data is sent anywhere else.
- The options page follows the system light/dark theme automatically.
- Includes a toolbar popup for quick filtering controls and page-level reveal actions.
- Supports a softer collapsed placeholder mode in addition to fully hiding matched posts.

## Loading locally

First build the browser-specific folders:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-packages.ps1
```

Then load the unpacked extension:

- **Chrome:** open `chrome://extensions`, enable Developer mode, click **Load unpacked**, and select `dist\chrome`.
- **Edge:** open `edge://extensions`, enable Developer mode, click **Load unpacked**, and select `dist\edge`.
- **Firefox:** open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and select `dist\firefox\manifest.json`.

## Building store packages

Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-packages.ps1
```

This creates:

- `dist\chrome`
- `dist\edge`
- `dist\firefox`
- zipped packages for each browser in `dist\`

For Firefox store submission, pass a unique add-on ID:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\build-packages.ps1 -FirefoxExtensionId "daring-fireball-without-politics@your-domain.example"
```

## Publishing notes

- **Chrome Web Store:** upload the Chrome zip from `dist\`.
- **Microsoft Edge Add-ons:** upload the Edge zip from `dist\`.
- **Firefox Add-ons:** upload the Firefox zip from `dist\`; the build script adds `browser_specific_settings.gecko.id` for MV3 signing.
