const webroot = document.querySelector("meta[name='webroot']")?.content || "";
const jobId = window.location.pathname.split("/").pop();
const main = document.querySelector("main");

let pollingTimer = null;
const refreshData = () => {
  const isPending = document.querySelector("[data-job-pending='true']");
  if (isPending) {
    fetch(`${webroot}/progress/${jobId}`, {
      method: "POST",
    })
      .then((res) => res.text())
      .then((html) => {
        main.innerHTML = html;
        const stillPending = document.querySelector("[data-job-pending='true']");
        if (stillPending) {
          pollingTimer = setTimeout(refreshData, 800);
        }
      })
      .catch((err) => {
        console.error("Polling error:", err);
        pollingTimer = setTimeout(refreshData, 1500);
      });
  }
};

setTimeout(refreshData, 800);

window.downloadAll = function () {
  const downloadLinks = document.querySelectorAll("tbody a[download]");
  downloadLinks.forEach((link, index) => {
    setTimeout(() => {
      const event = new MouseEvent("click");
      link.dispatchEvent(event);
    }, index * 300);
  });
};
