const { absoluteUrl } = require("./common");

const hasRoleIntent = (text, profileKeywords) => {
  const raw = String(text || "").toLowerCase();
  if (!raw) return false;

  const directTokens = ["qa", "tester", "test", "automation", "devops", "aws"];
  if (directTokens.some((t) => raw.includes(t))) return true;
  return profileKeywords.some((k) => raw.includes(String(k).toLowerCase()));
};

const compact = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

const asIso = (value) => {
  const txt = compact(value);
  if (!txt) return "";
  const parsed = new Date(txt);
  return Number.isNaN(parsed.getTime()) ? txt : parsed.toISOString().slice(0, 10);
};

const collectFromDataPage = async (page, feed) => {
  return page.evaluate((feedMeta) => {
    const safe = (v) => String(v || "").replace(/\s+/g, " ").trim();
    const app = document.querySelector("#app");
    const dataRaw = app?.getAttribute("data-page");
    if (!dataRaw) return [];

    let parsed;
    try {
      parsed = JSON.parse(dataRaw);
    } catch {
      return [];
    }

    const out = [];
    const stack = [parsed];

    while (stack.length) {
      const node = stack.pop();
      if (!node || typeof node !== "object") continue;
      if (Array.isArray(node)) {
        for (const child of node) stack.push(child);
        continue;
      }

      const title =
        node.title || node.job_title || node.role || node.name || node.position;
      const company = node.company || node.company_name || node.organisation || "";
      const linkCandidate = node.link || node.url || node.slug || node.apply_link;
      const dateCandidate =
        node.posted_at || node.created_at || node.date || node.updated_at || "";

      if (title && linkCandidate) {
        out.push({
          source: feedMeta.name,
          title: safe(title),
          company: safe(company) || "Unknown",
          location: feedMeta.location,
          link: String(linkCandidate),
          postedDate: safe(dateCandidate),
          experienceText: "",
        });
      }

      for (const key of Object.keys(node)) {
        stack.push(node[key]);
      }
    }

    return out;
  }, { name: feed.name, location: feed.location });
};

const collectFromAnchors = async (page, feed, profile) => {
  return page.evaluate(
    ({ feedMeta, keywords }) => {
      const text = (v) => String(v || "").replace(/\s+/g, " ").trim();
      const hasKeyword = (value) => {
        const raw = value.toLowerCase();
        const fixed = ["qa", "tester", "automation", "devops", "aws"];
        if (fixed.some((t) => raw.includes(t))) return true;
        return keywords.some((k) => raw.includes(String(k).toLowerCase()));
      };

      const items = [];
      const anchors = Array.from(document.querySelectorAll("a[href]"));
      for (const a of anchors) {
        const label = text(a.textContent);
        if (label.length < 8 || label.length > 180) continue;
        if (!hasKeyword(label)) continue;

        const href = a.getAttribute("href");
        if (!href) continue;
        items.push({
          source: feedMeta.name,
          title: label,
          company: "Unknown",
          location: feedMeta.location,
          link: href,
          postedDate: "",
          experienceText: "",
        });
      }
      return items;
    },
    { feedMeta: { name: feed.name, location: feed.location }, keywords: profile.keywords }
  );
};

async function scrapeTechParkFeed(page, feed, profile, limit) {
  await page.goto(feed.url, { waitUntil: "domcontentloaded", timeout: 70000 });
  await page.waitForTimeout(2000);

  const byDataPage = await collectFromDataPage(page, feed).catch(() => []);
  const byAnchor = await collectFromAnchors(page, feed, profile).catch(() => []);

  const merged = [...byDataPage, ...byAnchor]
    .map((job) => ({
      ...job,
      title: compact(job.title),
      company: compact(job.company) || "Unknown",
      postedDate: asIso(job.postedDate),
      link: absoluteUrl(job.link, feed.url),
    }))
    .filter((job) => hasRoleIntent(job.title, profile.keywords))
    .filter((job) => job.title && job.link);

  const seen = new Set();
  const deduped = [];
  for (const job of merged) {
    const key = `${job.source}|${job.link}|${job.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(job);
    if (deduped.length >= limit) break;
  }

  return deduped;
}

module.exports = { scrapeTechParkFeed };
