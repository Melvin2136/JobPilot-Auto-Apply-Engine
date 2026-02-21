const fs = require("fs");

const readCoverLetter = (templatePath, job) => {
  if (!fs.existsSync(templatePath)) {
    return `Hello Hiring Team,\n\nI am interested in the ${job.title} role at ${job.company}.\n\nRegards,\nMelvin`;
  }
  const template = fs.readFileSync(templatePath, "utf8");
  return template
    .replaceAll("{{jobTitle}}", job.title || "Role")
    .replaceAll("{{company}}", job.company || "Company");
};

async function uploadResumeIfNeeded(page, resumePath) {
  const input = page.locator("input[type='file']").first();
  if ((await input.count()) === 0) return false;
  await input.setInputFiles(resumePath);
  return true;
}

async function fillCoverLetterIfNeeded(page, coverLetterText) {
  const area = page.locator("textarea, [contenteditable='true']").first();
  if ((await area.count()) === 0) return false;
  await area.fill(coverLetterText);
  return true;
}

async function clickApply(page, dryRun) {
  const button = page
    .locator("button, a")
    .filter({ hasText: /easy apply|apply now|apply/i })
    .first();

  if ((await button.count()) === 0) {
    return { success: false, reason: "No apply button found" };
  }

  await button.click();
  await page.waitForTimeout(1200);

  if (dryRun) {
    return { success: true, reason: "Dry run mode: form open only" };
  }

  const submit = page
    .locator("button, input[type='submit']")
    .filter({ hasText: /submit|send|apply/i })
    .first();

  if ((await submit.count()) > 0) {
    await submit.click();
    await page.waitForTimeout(1200);
    return { success: true, reason: "Application submitted" };
  }

  return { success: true, reason: "Apply flow started (submit not detected)" };
}

async function autoApply({ browserContext, jobs, config }) {
  const results = [];

  for (const job of jobs) {
    const page = await browserContext.newPage();
    try {
      await page.goto(job.link, { waitUntil: "domcontentloaded", timeout: 60000 });
      const coverLetter = readCoverLetter(config.coverLetterTemplate, job);
      await uploadResumeIfNeeded(page, config.resumePath).catch(() => false);
      await fillCoverLetterIfNeeded(page, coverLetter).catch(() => false);
      const applyResult = await clickApply(page, config.dryRun);

      results.push({
        ...job,
        appliedAt: new Date().toISOString(),
        status: applyResult.success ? "applied" : "failed",
        note: applyResult.reason,
      });
    } catch (error) {
      results.push({
        ...job,
        appliedAt: new Date().toISOString(),
        status: "failed",
        note: error.message,
      });
    } finally {
      await page.close();
    }
  }

  return results;
}

module.exports = { autoApply };
