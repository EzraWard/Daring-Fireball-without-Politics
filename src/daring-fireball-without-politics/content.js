function filterDF(keywords) {
  const items = document.querySelectorAll("dl.linkedlist");

  items.forEach(list => {
    const dts = list.querySelectorAll("dt");
    const dds = list.querySelectorAll("dd");

    let hiddenCount = 0;

    dds.forEach((dd, i) => {
      const text = dd.innerText.toLowerCase();
      if (keywords.some(k => text.includes(k.toLowerCase().trim()))) {
        dd.style.display = "none";
        if (dts[i]) dts[i].style.display = "none";
        hiddenCount++;
      }
    });

    // If all entries in this <dl> are hidden, hide the <dl> itself
    if (hiddenCount === dds.length) {
      list.style.display = "none";

      // Also hide the date header before this list, if present
      const prev = list.previousElementSibling;
      if (prev && prev.classList.contains("dateline")) {
        prev.style.display = "none";
      }
    }
  });
}

// Load keywords from storage and run
function runFilter() {
  chrome.storage.sync.get({ blockedKeywords: [] }, data => {
    filterDF(data.blockedKeywords);
  });
}

document.addEventListener("DOMContentLoaded", runFilter);

const observer = new MutationObserver(runFilter);
observer.observe(document.body, { childList: true, subtree: true });
