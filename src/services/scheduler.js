const cron = require("node-cron");

function startScheduler({ config, runDaily }) {
  return cron.schedule(
    config.cronExpression,
    async () => {
      try {
        await runDaily();
      } catch (error) {
        console.error("Scheduled run failed:", error.message);
      }
    },
    {
      timezone: config.cronTimezone,
    }
  );
}

module.exports = { startScheduler };
