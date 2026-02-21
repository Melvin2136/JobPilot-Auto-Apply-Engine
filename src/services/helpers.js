const crypto = require("crypto");

const normalize = (value) => String(value || "").trim().toLowerCase();

const sha = (value) =>
  crypto.createHash("sha256").update(String(value)).digest("hex");

const isDateToday = (isoDate) => {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

module.exports = {
  normalize,
  sha,
  isDateToday,
};
