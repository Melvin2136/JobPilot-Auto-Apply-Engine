const { chromium } = require("playwright");
const { scrapeLinkedIn } = require("./linkedin");
const { scrapeNaukri } = require("./naukri");
const { scrapeFoundit } = require("./foundit");
const { scrapeGlassdoor } = require("./glassdoor");
const { dedupeJobs, enrichAndFilterJobs } = require("../filter");

async function collectJobs({ profile, config }) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const all = [];
  const locations = profile.locations?.length ? profile.locations : config.defaultLocations;

  try {
    for (const keyword of profile.keywords) {
      for (const location of locations) {
        const [naukriJobs, linkedInJobs, founditJobs, glassdoorJobs] = await Promise.all([
          scrapeNaukri(page, keyword, location, config.maxJobsPerSource).catch(() => []),
          scrapeLinkedIn(page, keyword, location, config.maxJobsPerSource).catch(() => []),
          scrapeFoundit(page, keyword, location, config.maxJobsPerSource).catch(() => []),
          scrapeGlassdoor(page, keyword, location, config.maxJobsPerSource).catch(() => []),
        ]);

        all.push(...naukriJobs, ...linkedInJobs, ...founditJobs, ...glassdoorJobs);
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  return dedupeJobs(enrichAndFilterJobs(all, profile));
}

module.exports = { collectJobs };