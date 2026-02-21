const { isDateToday } = require("./helpers");

function buildReport({ applications, newOpenings }) {
  const platformBreakdown = applications.reduce((acc, app) => {
    const source = app.source || "Unknown";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const failedApplications = applications.filter((x) => x.status === "failed").length;
  const appliedToday = applications.filter((x) => isDateToday(x.appliedAt)).length;

  return {
    date: new Date().toISOString().slice(0, 10),
    totalApplied: applications.filter((x) => x.status === "applied").length,
    appliedToday,
    platformBreakdown,
    newOpenings,
    failedApplications,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { buildReport };
