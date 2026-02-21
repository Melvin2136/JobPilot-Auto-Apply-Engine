const { chromium } = require("playwright");
const { scrapeLinkedIn } = require("./linkedin");
const { scrapeNaukri } = require("./naukri");
const { scrapeFoundit } = require("./foundit");
const { scrapeGlassdoor } = require("./glassdoor");
const { scrapeTechParkFeed } = require("./techparks");
const { dedupeJobs, enrichAndFilterJobs } = require("../filter");

async function collectJobs({ profile, config }) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const all = [];
  const locations = profile.locations?.length ? profile.locations : config.defaultLocations;

  const runOnPage = async (fn) => {
    const page = await context.newPage();
    try {
      return await fn(page);
    } finally {
      await page.close();
    }
  };

  try {
    for (const keyword of profile.keywords) {
      for (const location of locations) {
        const [naukriJobs, linkedInJobs, founditJobs, glassdoorJobs] = await Promise.all([
          runOnPage((page) =>
            scrapeNaukri(page, keyword, location, config.maxJobsPerSource).catch(() => [])
          ),
          runOnPage((page) =>
            scrapeLinkedIn(page, keyword, location, config.maxJobsPerSource).catch(() => [])
          ),
          runOnPage((page) =>
            scrapeFoundit(page, keyword, location, config.maxJobsPerSource).catch(() => [])
          ),
          runOnPage((page) =>
            scrapeGlassdoor(page, keyword, location, config.maxJobsPerSource).catch(() => [])
          ),
        ]);

        all.push(...naukriJobs, ...linkedInJobs, ...founditJobs, ...glassdoorJobs);
      }
    }

    if (Array.isArray(config.techParkFeeds)) {
      for (const feed of config.techParkFeeds) {
        if (!feed?.url) continue;
        const techParkJobs = await runOnPage((page) =>
          scrapeTechParkFeed(
            page,
            feed,
            profile,
            config.maxJobsPerTechParkFeed || config.maxJobsPerSource
          ).catch(() => [])
        );
        all.push(...techParkJobs);
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  return dedupeJobs(enrichAndFilterJobs(all, profile));
}

module.exports = { collectJobs };
