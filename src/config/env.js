const path = require("path");
const fs = require("fs");
require("dotenv").config();

const toBool = (value, fallback) => {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === "true";
};

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const appRoot = process.cwd();
const dataDir = path.join(appRoot, "src", "storage", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

module.exports = {
  port: toInt(process.env.PORT, 3000),
  autoApplyEnabled: toBool(process.env.AUTO_APPLY_ENABLED, true),
  dryRun: toBool(process.env.DRY_RUN, true),
  cronExpression: process.env.CRON_EXPRESSION || "0 9 * * *",
  cronTimezone: process.env.CRON_TIMEZONE || "Asia/Kolkata",
  maxJobsPerSource: toInt(process.env.MAX_JOBS_PER_SOURCE, 25),
  maxJobsPerTechParkFeed: toInt(process.env.MAX_JOBS_PER_TECHPARK_FEED, 40),
  searchDaysBack: toInt(process.env.SEARCH_DAYS_BACK, 2),
  defaultLocations: (process.env.DEFAULT_LOCATION || "Remote,India")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean),
  resumePath: path.resolve(appRoot, process.env.RESUME_PATH || "./assets/resume.pdf"),
  coverLetterTemplate: path.resolve(
    appRoot,
    process.env.COVER_LETTER_TEMPLATE || "./src/templates/cover-letter.txt"
  ),
  email: {
    host: process.env.SMTP_HOST,
    port: toInt(process.env.SMTP_PORT, 587),
    secure: toBool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: process.env.EMAIL_TO || "melvingeorgedaniel7@gmail.com",
  },
  techParkFeeds: [
    {
      name: "Technopark Trivandrum",
      location: "Trivandrum",
      url:
        process.env.TECHPARK_TRIVANDRUM_URL ||
        "https://technopark.in/job-search/",
    },
    {
      name: "Infopark Kochi",
      location: "Kochi",
      url:
        process.env.TECHPARK_KOCHI_URL ||
        "https://infopark.in/public/index.php/companies/job-search/1",
    },
    {
      name: "Bagmane Tech Park Bangalore",
      location: "Bangalore",
      url:
        process.env.TECHPARK_BANGALORE_URL ||
        "https://www.bagmanegroup.com/careers",
    },
  ],
  dataFiles: {
    jobs: path.join(dataDir, "jobs.json"),
    applications: path.join(dataDir, "applications.json"),
    reports: path.join(dataDir, "reports.json"),
  },
};
