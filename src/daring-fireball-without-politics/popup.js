let activeTabId = null;
let currentSettings = DFWP_SHARED.getDefaultSettings();
let currentPageState = {
  supported: false,
  hiddenCount: 0,
  pageRevealAll: false
};

function setPageStatus(message) {
  document.getElementById("pageStatus").textContent = message;
}

function render() {
  const filteringEnabledElement = document.getElementById("filteringEnabled");
  const softHideEnabledElement = document.getElementById("softHideEnabled");
  const togglePageRevealButton = document.getElementById("togglePageReveal");
  const keywordCount = currentSettings.blockedKeywords.length;

  filteringEnabledElement.checked = currentSettings.filteringEnabled;
  softHideEnabledElement.checked = currentSettings.softHideEnabled;
  document.getElementById("keywordCount").textContent = `${keywordCount} blocked keyword${keywordCount === 1 ? "" : "s"} configured.`;

  if (!currentPageState.supported) {
    setPageStatus("Open daringfireball.net to use the page controls.");
    togglePageRevealButton.disabled = true;
    return;
  }

  if (!currentSettings.filteringEnabled) {
    setPageStatus("Filtering is off for all pages.");
    togglePageRevealButton.disabled = true;
    return;
  }

  if (currentPageState.pageRevealAll) {
    setPageStatus("Filtered posts are temporarily revealed on this page.");
    togglePageRevealButton.textContent = "Hide filtered posts again";
    togglePageRevealButton.disabled = false;
    return;
  }

  setPageStatus(
    currentPageState.hiddenCount > 0
      ? `${currentPageState.hiddenCount} post${currentPageState.hiddenCount === 1 ? "" : "s"} currently filtered on this page.`
      : "No posts are currently filtered on this page."
  );

  togglePageRevealButton.textContent = currentPageState.pageRevealAll
    ? "Hide filtered posts again"
    : "Show hidden posts on this page";
  togglePageRevealButton.disabled = currentPageState.hiddenCount === 0 && !currentPageState.pageRevealAll;
}

function withActiveTab(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    activeTabId = tabs[0] ? tabs[0].id : null;
    callback();
  });
}

function sendMessageToActiveTab(message, callback) {
  if (!activeTabId) {
    callback(null);
    return;
  }

  chrome.tabs.sendMessage(activeTabId, message, response => {
    if (chrome.runtime.lastError) {
      callback(null);
      return;
    }

    callback(response || null);
  });
}

function refreshSettings(callback) {
  DFWP_SHARED.getSettings(settings => {
    currentSettings = settings;
    callback();
  });
}

function refreshPageState(callback) {
  sendMessageToActiveTab({ type: "GET_PAGE_STATE" }, response => {
    currentPageState = response || {
      supported: false,
      hiddenCount: 0,
      pageRevealAll: false
    };
    callback();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const filteringEnabledElement = document.getElementById("filteringEnabled");
  const softHideEnabledElement = document.getElementById("softHideEnabled");
  const togglePageRevealButton = document.getElementById("togglePageReveal");
  const openOptionsButton = document.getElementById("openOptions");

  withActiveTab(() => {
    refreshSettings(() => {
      refreshPageState(render);
    });
  });

  filteringEnabledElement.addEventListener("change", () => {
    chrome.storage.sync.set({ filteringEnabled: filteringEnabledElement.checked }, () => {
      refreshSettings(() => {
        refreshPageState(render);
      });
    });
  });

  softHideEnabledElement.addEventListener("change", () => {
    chrome.storage.sync.set({ softHideEnabled: softHideEnabledElement.checked }, () => {
      refreshSettings(() => {
        refreshPageState(render);
      });
    });
  });

  togglePageRevealButton.addEventListener("click", () => {
    sendMessageToActiveTab(
      { type: "SET_PAGE_REVEAL", reveal: !currentPageState.pageRevealAll },
      response => {
        currentPageState = response || currentPageState;
        render();
      }
    );
  });

  openOptionsButton.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") {
      return;
    }

    if (!changes.blockedKeywords && !changes.filteringEnabled && !changes.softHideEnabled) {
      return;
    }

    refreshSettings(() => {
      refreshPageState(render);
    });
  });
});
