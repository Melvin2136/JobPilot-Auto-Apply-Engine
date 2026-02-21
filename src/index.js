const express = require("express");
const path = require("path");
const config = require("./config/env");
const profile = require("./config/profile");
const { runPipeline } = require("./services/pipeline");
const { startScheduler } = require("./services/scheduler");
const { createApiRouter } = require("./api/routes");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", createApiRouter({ config, profile, runPipeline }));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const server = app.listen(config.port, () => {
  console.log(`JobPilot running on http://localhost:${config.port}`);
});

const task = startScheduler({
  config,
  runDaily: () => runPipeline({ config, profile, mode: "full" }),
});

if (process.argv.includes("--run-once")) {
  runPipeline({ config, profile, mode: "full" })
    .then((result) => {
      console.log("Run once completed:", result);
      task.stop();
      server.close(() => process.exit(0));
    })
    .catch((error) => {
      console.error(error);
      task.stop();
      server.close(() => process.exit(1));
    });
}
