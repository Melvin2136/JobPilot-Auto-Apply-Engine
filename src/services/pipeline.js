const { chromium } = require("playwright");
const { collectJobs } = require("./sources");
const { autoApply } = require("./apply/engine");
const { buildReport } = require("./reporter");
const { sendEmailSummary } = require("./mailer");
const { readJson, writeJson, ensureJsonFile } = require("../storage/jsonStore");

async function runPipeline({ config, profile, mode = "full" }) {
  ensureJsonFile(config.dataFiles.jobs, []);
  ensureJsonFile(config.dataFiles.applications, []);
  ensureJsonFile(config.dataFiles.reports, []);

  const existingJobs = readJson(config.dataFiles.jobs, []);
  const existingApplications = readJson(config.dataFiles.applications, []);
  const existingReports = readJson(config.dataFiles.reports, []);

  const collected = await collectJobs({ profile, config });
  const existingIds = new Set(existingJobs.map((j) => j.id));

  const freshJobs = collected.filter((j) => !existingIds.has(j.id));
  const jobsMerged = [...freshJobs, ...existingJobs].slice(0, 3000);
  writeJson(config.dataFiles.jobs, jobsMerged);

  let newApplications = [];
  if (mode !== "scan" && config.autoApplyEnabled) {
    const alreadyAppliedLinks = new Set(
      existingApplications.map((a) => `${a.source}|${a.link}`)
    );
    const candidates = freshJobs.filter(
      (j) => !alreadyAppliedLinks.has(`${j.source}|${j.link}`)
    );

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    try {
      newApplications = await autoApply({ browserContext: context, jobs: candidates, config });
    } finally {
      await context.close();
      await browser.close();
    }

    const combinedApplications = [...newApplications, ...existingApplications].slice(0, 3000);
    writeJson(config.dataFiles.applications, combinedApplications);
  }

  const latestApplications = readJson(config.dataFiles.applications, []);
  const report = buildReport({ applications: latestApplications, newOpenings: freshJobs.length });
  writeJson(config.dataFiles.reports, [report, ...existingReports].slice(0, 365));

  const emailResult = await sendEmailSummary(config.email, report).catch((error) => ({
    sent: false,
    reason: error.message,
  }));

  return {
    collected: collected.length,
    newOpenings: freshJobs.length,
    applied: newApplications.filter((x) => x.status === "applied").length,
    failed: newApplications.filter((x) => x.status === "failed").length,
    report,
    emailResult,
  };
}

module.exports = { runPipeline };
