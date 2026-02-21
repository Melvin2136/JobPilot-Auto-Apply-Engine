const express = require("express");
const { readJson } = require("../storage/jsonStore");

function createApiRouter({ config, profile, runPipeline }) {
  const router = express.Router();

  router.get("/health", (req, res) => {
    res.json({ ok: true, now: new Date().toISOString() });
  });

  router.get("/profile", (req, res) => {
    res.json(profile);
  });

  router.get("/jobs", (req, res) => {
    const jobs = readJson(config.dataFiles.jobs, []);
    const status = req.query.status;
    if (!status) return res.json(jobs);
    return res.json(jobs.filter((j) => j.status === status));
  });

  router.get("/applications", (req, res) => {
    res.json(readJson(config.dataFiles.applications, []));
  });

  router.get("/reports/latest", (req, res) => {
    const reports = readJson(config.dataFiles.reports, []);
    res.json(reports[0] || null);
  });

  router.get("/metrics", (req, res) => {
    const jobs = readJson(config.dataFiles.jobs, []);
    const applications = readJson(config.dataFiles.applications, []);
    const reports = readJson(config.dataFiles.reports, []);

    const jobsAppliedToday = applications.filter((a) => {
      const d = new Date(a.appliedAt || 0);
      const n = new Date();
      return d.toDateString() === n.toDateString();
    }).length;

    const jobsPerPlatform = applications.reduce((acc, app) => {
      acc[app.source] = (acc[app.source] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalJobsDetected: jobs.length,
      totalJobsApplied: applications.filter((a) => a.status === "applied").length,
      jobsAppliedToday,
      jobsPerPlatform,
      latestReport: reports[0] || null,
    });
  });

  router.post("/run-scan", async (req, res) => {
    const result = await runPipeline({ config, profile, mode: "scan" });
    res.json(result);
  });

  router.post("/run-apply", async (req, res) => {
    const result = await runPipeline({ config, profile, mode: "full" });
    res.json(result);
  });

  return router;
}

module.exports = { createApiRouter };
