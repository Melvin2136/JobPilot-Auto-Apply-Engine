const { safeText, safeHref, absoluteUrl } = require("./common");

async function scrapeFoundit(page, keyword, location, limit) {
  const url = `https://www.foundit.in/srp/results?query=${encodeURIComponent(keyword)}&locations=${encodeURIComponent(location)}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);

  const cards = page.locator(".srpResultCard");
  const count = Math.min(await cards.count(), limit);
  const jobs = [];

  for (let i = 0; i < count; i += 1) {
    const card = cards.nth(i);
    jobs.push({
      source: "Foundit",
      title: await safeText(card.locator(".jobTitle a, a.jobTitle")),
      company: await safeText(card.locator(".companyName")),
      location: await safeText(card.locator(".location")),
      link: absoluteUrl(await safeHref(card.locator(".jobTitle a, a.jobTitle")), "https://www.foundit.in"),
      postedDate: await safeText(card.locator(".postedDate")),
      experienceText: await safeText(card.locator(".exp"))
    });
  }

  return jobs.filter((j) => j.title && j.link);
}

module.exports = { scrapeFoundit };
