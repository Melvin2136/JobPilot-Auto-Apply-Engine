async function getJson(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

async function refresh() {
  const metrics = await getJson("/api/metrics");
  setText("totalJobs", metrics.totalJobsDetected || 0);
  setText("totalApplied", metrics.totalJobsApplied || 0);
  setText("appliedToday", metrics.jobsAppliedToday || 0);
  setText("newOpenings", metrics.latestReport?.newOpenings || 0);

  const platformList = document.getElementById("platformList");
  platformList.innerHTML = "";
  const entries = Object.entries(metrics.jobsPerPlatform || {});
  if (entries.length === 0) {
    platformList.innerHTML = "<li>No applications yet</li>";
  } else {
    for (const [platform, count] of entries) {
      const li = document.createElement("li");
      li.textContent = `${platform}: ${count}`;
      platformList.appendChild(li);
    }
  }

  const latest = await getJson("/api/reports/latest");
  setText("reportBox", latest ? JSON.stringify(latest, null, 2) : "No report yet.");
}

async function run(endpoint, label) {
  setText("statusText", `Status: ${label}...`);
  try {
    const result = await getJson(endpoint, { method: "POST" });
    setText("statusText", `Status: done (${label})`);
    console.log(result);
    await refresh();
  } catch (error) {
    setText("statusText", `Status: failed (${error.message})`);
  }
}

document.getElementById("scanBtn").addEventListener("click", () => run("/api/run-scan", "scan"));
document.getElementById("applyBtn").addEventListener("click", () => run("/api/run-apply", "apply"));

refresh();
