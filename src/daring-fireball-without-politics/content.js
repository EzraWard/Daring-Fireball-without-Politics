function filterDF(keywords) {
  const items = document.querySelectorAll("dl.linkedlist");

  items.forEach(list => {
    const dts = list.querySelectorAll("dt");
    const dds = list.querySelectorAll("dd");

    dds.forEach((dd, i) => {
      const text = dd.innerText.toLowerCase();
      if (keywords.some(k => text.includes(k.toLowerCase().trim()))) {
        dd.style.display = "none";
        if (dts[i]) dts[i].style.display = "none";
      }
    });
  });
}

// Load keywords from storage and run
function runFilter() {
  chrome.storage.sync.get({ blockedKeywords: [] }, data => {
    filterDF(data.blockedKeywords);
  });
}

document.addEventListener("DOMContentLoaded", runFilter);

// Watch for new content
const observer = new MutationObserver(runFilter);
observer.observe(document.body, { childList: true, subtree: true });