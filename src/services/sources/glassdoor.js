const { safeText, safeHref, absoluteUrl } = require("./common");

async function scrapeGlassdoor(page, keyword, location, limit) {
  const url = `https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=${encodeURIComponent(keyword)}&locKeyword=${encodeURIComponent(location)}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000);

  const cards = page.locator("li[data-test='jobListing'], .react-job-listing");
  const count = Math.min(await cards.count(), limit);
  const jobs = [];

  for (let i = 0; i < count; i += 1) {
    const card = cards.nth(i);
    jobs.push({
      source: "Glassdoor",
      title: await safeText(card.locator("a[data-test='job-link'], a.jobLink")),
      company: await safeText(card.locator("[data-test='employer-name'], .employerName")),
      location: await safeText(card.locator("[data-test='emp-location'], .location")),
      link: absoluteUrl(await safeHref(card.locator("a[data-test='job-link'], a.jobLink")), "https://www.glassdoor.co.in"),
      postedDate: await safeText(card.locator("[data-test='job-age'], .job-age")),
      experienceText: ""
    });
  }

  return jobs.filter((j) => j.title && j.link);
}

module.exports = { scrapeGlassdoor };
