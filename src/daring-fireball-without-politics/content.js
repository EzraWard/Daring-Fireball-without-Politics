let settings = DFWP_SHARED.getDefaultSettings();
let hiddenMatchCount = 0;
let pageRevealAll = false;
let rerenderTimeout = null;
let observer = null;
const individuallyRevealedEntries = new Set();

function findMatchingKeyword(text, keywords) {
  return keywords.find(keyword => text.includes(keyword)) || null;
}

function getEntryKey(dt, dd, listIndex, entryIndex) {
  const link = dt ? dt.querySelector("a[href]") : null;

  if (link && link.href) {
    return `href:${link.href}`;
  }

  const title = dt ? dt.textContent.trim() : "";
  const summary = dd.textContent.trim().slice(0, 80);

  return `entry:${listIndex}:${entryIndex}:${title}|${summary}`;
}

function findPlaceholder(list, entryKey) {
  return Array.from(list.querySelectorAll(".dfwp-placeholder")).find(
    placeholder => placeholder.dataset.entryKey === entryKey
  ) || null;
}

function removePlaceholder(list, entryKey) {
  const placeholder = findPlaceholder(list, entryKey);

  if (placeholder) {
    placeholder.remove();
  }
}

function renderPlaceholder(placeholder, matchedKeyword) {
  placeholder.textContent = "";

  const label = document.createElement("span");
  label.className = "dfwp-placeholder-label";
  label.textContent = `Filtered post matching "${matchedKeyword}".`;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "dfwp-placeholder-button";
  button.textContent = "Show";

  placeholder.append(label, button);
}

function upsertPlaceholder(list, anchorNode, entryKey, matchedKeyword) {
  let placeholder = findPlaceholder(list, entryKey);

  if (!placeholder) {
    placeholder = document.createElement("div");
    placeholder.className = "dfwp-placeholder";
    placeholder.dataset.entryKey = entryKey;
    anchorNode.parentNode.insertBefore(placeholder, anchorNode);
  }

  renderPlaceholder(placeholder, matchedKeyword);

  return placeholder;
}

function ensureHiddenStyle() {
  if (document.getElementById("dfwp-style")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "dfwp-style";
  style.textContent = `
    .dfwp-hidden { display: none !important; }
    .dfwp-placeholder {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin: 0 0 16px;
      padding: 12px 14px;
      border: 1px solid rgba(127, 127, 127, 0.35);
      border-radius: 8px;
      background: rgba(127, 127, 127, 0.08);
      font: inherit;
    }
    .dfwp-placeholder-label {
      color: inherit;
    }
    .dfwp-placeholder-button {
      border: 1px solid rgba(127, 127, 127, 0.5);
      border-radius: 999px;
      background: transparent;
      color: inherit;
      cursor: pointer;
      font: inherit;
      padding: 4px 12px;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

function filterDF(nextSettings) {
  const items = document.querySelectorAll("dl.linkedlist");
  hiddenMatchCount = 0;

  items.forEach((list, listIndex) => {
    const dts = list.querySelectorAll("dt");
    const dds = list.querySelectorAll("dd");
    let hiddenCount = 0;
    const activeEntryKeys = new Set();

    dds.forEach((dd, index) => {
      const dt = dts[index];
      const entryKey = getEntryKey(dt, dd, listIndex, index);
      const anchorNode = dt || dd;
      const combinedText = `${dt ? dt.textContent : ""} ${dd.textContent}`.toLowerCase();
      const matchedKeyword = nextSettings.filteringEnabled
        ? findMatchingKeyword(combinedText, nextSettings.blockedKeywords)
        : null;
      const isMatch = Boolean(matchedKeyword);
      const isEntryRevealed = pageRevealAll || individuallyRevealedEntries.has(entryKey);
      const shouldHideEntry = isMatch && !isEntryRevealed;

      activeEntryKeys.add(entryKey);

      if (shouldHideEntry) {
        hiddenMatchCount += 1;
        hiddenCount += 1;
      }

      dd.classList.toggle("dfwp-hidden", shouldHideEntry);
      if (dt) {
        dt.classList.toggle("dfwp-hidden", shouldHideEntry);
      }

      if (shouldHideEntry && nextSettings.softHideEnabled) {
        upsertPlaceholder(list, anchorNode, entryKey, matchedKeyword);
      } else {
        removePlaceholder(list, entryKey);
      }
    });

    Array.from(list.querySelectorAll(".dfwp-placeholder")).forEach(placeholder => {
      if (!activeEntryKeys.has(placeholder.dataset.entryKey)) {
        placeholder.remove();
      }
    });

    const hideList = !nextSettings.softHideEnabled && dds.length > 0 && hiddenCount === dds.length;
    list.classList.toggle("dfwp-hidden", hideList);

    const previousElement = list.previousElementSibling;
    if (previousElement && previousElement.classList.contains("dateline")) {
      previousElement.classList.toggle("dfwp-hidden", hideList);
    }
  });
}

function applyFilter() {
  if (observer) {
    observer.disconnect();
  }

  ensureHiddenStyle();
  filterDF(settings);

  if (observer && document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

function scheduleApplyFilter() {
  if (rerenderTimeout) {
    clearTimeout(rerenderTimeout);
  }

  rerenderTimeout = setTimeout(() => {
    rerenderTimeout = null;
    applyFilter();
  }, 100);
}

function loadKeywordsAndApply() {
  DFWP_SHARED.getSettings(nextSettings => {
    settings = nextSettings;
    applyFilter();
  });
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") {
    return;
  }

  settings = DFWP_SHARED.normalizeSettings({
    blockedKeywords: changes.blockedKeywords ? changes.blockedKeywords.newValue : settings.blockedKeywords,
    filteringEnabled: changes.filteringEnabled ? changes.filteringEnabled.newValue : settings.filteringEnabled,
    softHideEnabled: changes.softHideEnabled ? changes.softHideEnabled.newValue : settings.softHideEnabled
  });
  applyFilter();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.type !== "string") {
    return;
  }

  if (message.type === "GET_PAGE_STATE") {
    sendResponse({
      supported: true,
      hiddenCount: hiddenMatchCount,
      pageRevealAll,
      filteringEnabled: settings.filteringEnabled,
      softHideEnabled: settings.softHideEnabled
    });
    return;
  }

  if (message.type === "SET_PAGE_REVEAL") {
    pageRevealAll = Boolean(message.reveal);
    applyFilter();

    sendResponse({
      supported: true,
      hiddenCount: hiddenMatchCount,
      pageRevealAll
    });
  }
});

document.addEventListener("click", event => {
  const button = event.target.closest(".dfwp-placeholder-button");

  if (!button) {
    return;
  }

  const placeholder = button.closest(".dfwp-placeholder");

  if (!placeholder) {
    return;
  }

  individuallyRevealedEntries.add(placeholder.dataset.entryKey);
  applyFilter();
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadKeywordsAndApply, { once: true });
} else {
  loadKeywordsAndApply();
}

observer = new MutationObserver(scheduleApplyFilter);

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
} else {
  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, { childList: true, subtree: true });
  }, { once: true });
}
