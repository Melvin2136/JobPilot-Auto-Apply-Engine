const safeText = async (locator) => {
  try {
    const text = await locator.innerText();
    return String(text || "").trim();
  } catch {
    return "";
  }
};

const safeHref = async (locator) => {
  try {
    const href = await locator.getAttribute("href");
    return href ? String(href).trim() : "";
  } catch {
    return "";
  }
};

const absoluteUrl = (value, baseUrl) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return new URL(value, baseUrl).toString();
};

module.exports = {
  safeText,
  safeHref,
  absoluteUrl,
};
