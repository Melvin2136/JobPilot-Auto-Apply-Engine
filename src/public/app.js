async function getJson(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

function renderJobs(jobs) {
  const root = document.getElementById("jobsList");
  root.innerHTML = "";

  if (!jobs.length) {
    root.textContent = "No openings available yet. Run a scan to populate this section.";
    return;
  }

  for (const job of jobs) {
    const row = document.createElement("article");
    row.className = "job-row";

    const left = document.createElement("div");
    const title = document.createElement("p");
    title.className = "job-title";
    title.textContent = job.title || "Untitled role";

    const meta = document.createElement("p");
    meta.className = "job-meta";
    meta.textContent = `${job.company || "Unknown"} | ${job.location || "N/A"} | ${job.source || "N/A"}`;

    left.appendChild(title);
    left.appendChild(meta);

    const link = document.createElement("a");
    link.href = job.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open job";

    row.appendChild(left);
    row.appendChild(link);
    root.appendChild(row);
  }
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

  const jobs = await getJson("/api/jobs");
  const sorted = jobs
    .slice()
    .sort((a, b) => new Date(b.discoveredAt || 0) - new Date(a.discoveredAt || 0));
  const preferred = sorted.filter((j) =>
    /technopark|infopark|bagmane|bangalore/i.test(`${j.source} ${j.location}`)
  );
  renderJobs((preferred.length ? preferred : sorted).slice(0, 12));
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
