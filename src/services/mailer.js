const nodemailer = require("nodemailer");

async function sendEmailSummary(emailConfig, report) {
  if (!emailConfig.host || !emailConfig.user || !emailConfig.pass || !emailConfig.to) {
    return { sent: false, reason: "Email config missing" };
  }

  const transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass,
    },
  });

  const lines = [
    `Date: ${report.date}`,
    `Total jobs applied: ${report.totalApplied}`,
    `Jobs applied today: ${report.appliedToday}`,
    `New openings detected: ${report.newOpenings}`,
    `Failed applications: ${report.failedApplications}`,
    "",
    "Platform breakdown:",
    ...Object.entries(report.platformBreakdown).map(([k, v]) => `- ${k}: ${v}`),
  ];

  await transporter.sendMail({
    from: emailConfig.from || emailConfig.user,
    to: emailConfig.to,
    subject: `JobPilot Daily Report - ${report.date}`,
    text: lines.join("\n"),
  });

  return { sent: true };
}

module.exports = { sendEmailSummary };
