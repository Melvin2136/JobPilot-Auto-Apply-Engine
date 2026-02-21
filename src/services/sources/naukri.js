const { safeText, safeHref, absoluteUrl } = require("./common");

async function scrapeNaukri(page, keyword, location, limit) {
  const url = `https://www.naukri.com/${encodeURIComponent(keyword)}-jobs-in-${encodeURIComponent(location)}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);

  const cards = page.locator("article.jobTuple, .jobTuple");
  const count = Math.min(await cards.count(), limit);
  const jobs = [];

  for (let i = 0; i < count; i += 1) {
    const card = cards.nth(i);
    jobs.push({
      source: "Naukri",
      title: await safeText(card.locator("a.title")),
      company: await safeText(card.locator("a.comp-name, .comp-name")),
      location: await safeText(card.locator(".locWdth")),
      link: absoluteUrl(await safeHref(card.locator("a.title")), "https://www.naukri.com"),
      postedDate: await safeText(card.locator(".job-post-day, .job-post-day span")),
      experienceText: await safeText(card.locator(".expwdth"))
    });
  }

  return jobs.filter((j) => j.title && j.link);
}

module.exports = { scrapeNaukri };
