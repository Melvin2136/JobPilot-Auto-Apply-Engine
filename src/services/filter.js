const { normalize, sha } = require("./helpers");

const parseExperienceYears = (text) => {
  const raw = String(text || "").toLowerCase();
  const found = raw.match(/(\d+)\s*\+?\s*(?:to|-)?\s*(\d+)?\s*(?:years|yrs|year|yr)/i);
  if (!found) return null;
  const low = Number.parseInt(found[1], 10);
  const high = found[2] ? Number.parseInt(found[2], 10) : low;
  return { min: low, max: high };
};

const experienceMatches = (job, profile) => {
  if (!job.experienceText) return true;
  const parsed = parseExperienceYears(job.experienceText);
  if (!parsed) return true;
  return parsed.min <= profile.experienceYearsMax;
};

const keywordMatches = (job, profile) => {
  const haystack = `${job.title || ""} ${job.description || ""}`.toLowerCase();
  return profile.keywords.some((k) => haystack.includes(k.toLowerCase()));
};

const locationMatches = (job, profile) => {
  const location = normalize(job.location);
  return profile.locations.some((loc) => location.includes(normalize(loc)));
};

const enrichAndFilterJobs = (jobs, profile) => {
  return jobs
    .map((job) => ({
      ...job,
      id: sha(`${job.source}|${job.link}|${job.title}|${job.company}`),
      discoveredAt: job.discoveredAt || new Date().toISOString(),
      status: job.status || "new",
    }))
    .filter((job) => keywordMatches(job, profile))
    .filter((job) => experienceMatches(job, profile))
    .filter((job) => locationMatches(job, profile));
};

const dedupeJobs = (jobs) => {
  const byId = new Map();
  for (const job of jobs) {
    if (!byId.has(job.id)) byId.set(job.id, job);
  }
  return [...byId.values()];
};

module.exports = {
  enrichAndFilterJobs,
  dedupeJobs,
};
