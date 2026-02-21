const { safeText, safeHref, absoluteUrl } = require("./common");

async function scrapeLinkedIn(page, keyword, location, limit) {
  const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);

  const cards = page.locator(".base-card");
  const count = Math.min(await cards.count(), limit);
  const jobs = [];

  for (let i = 0; i < count; i += 1) {
    const card = cards.nth(i);
    jobs.push({
      source: "LinkedIn",
      title: await safeText(card.locator(".base-search-card__title")),
      company: await safeText(card.locator(".base-search-card__subtitle")),
      location: await safeText(card.locator(".job-search-card__location")),
      link: absoluteUrl(await safeHref(card.locator("a.base-card__full-link")), "https://www.linkedin.com"),
      postedDate: await safeText(card.locator("time")),
      experienceText: ""
    });
  }

  return jobs.filter((j) => j.title && j.link);
}

module.exports = { scrapeLinkedIn };
