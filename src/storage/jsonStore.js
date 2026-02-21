const fs = require("fs");

const ensureJsonFile = (filePath, fallbackValue = []) => {
  if (fs.existsSync(filePath)) return;
  fs.writeFileSync(filePath, JSON.stringify(fallbackValue, null, 2), "utf8");
};

const readJson = (filePath, fallbackValue = []) => {
  ensureJsonFile(filePath, fallbackValue);
  const content = fs.readFileSync(filePath, "utf8");
  try {
    return JSON.parse(content);
  } catch {
    return fallbackValue;
  }
};

const writeJson = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};

module.exports = {
  ensureJsonFile,
  readJson,
  writeJson,
};
