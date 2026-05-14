// WebMitra runtime configuration. Edit values here to reconfigure the app
// without touching page logic. Loaded as an ES module by order.html.

export const WEBMITRA_CONFIG = {
  whatsappNumber: "919448249141",
  whatsapp: {
    enabled: true,
    openInNewTab: true,
    redirectDelayMs: 700,
    messageTemplate:
      "Hello WebMitra! I just placed a website order.\n\n" +
      "Name: {name}\n" +
      "Email: {email}\n" +
      "Phone: {phone}\n" +
      "Website type: {websiteType}\n" +
      "Site format: {siteFormat}\n" +
      "Budget: {budget}\n" +
      "Deadline: {deadline}\n" +
      "Order ID: {key}\n\n" +
      "Details:\n{description}",
  },
  firebase: {
    apiKey: "AIzaSyB0Zlz9wnRdspY0jIIOxtqjOi1k8FN9iJE",
    authDomain: "webmitra2.firebaseapp.com",
    databaseURL:
      "https://webmitra2-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "webmitra2",
    storageBucket: "webmitra2.firebasestorage.app",
    messagingSenderId: "666428674522",
    appId: "1:666428674522:web:b93f8f047d20a2beb9f0e3",
    measurementId: "G-QQ4S8H7NT8",
  },
};

export function buildWhatsAppUrl(data, key) {
  const cfg = WEBMITRA_CONFIG;
  const tokens = {
    name: data.name || "",
    email: data.email || "",
    phone: data.phone || "",
    websiteType: data.websiteType || "",
    siteFormat: data.siteFormat || "",
    budget: data.budget || "",
    deadline: data.deadline || "",
    description: data.description || "",
    key: key || "",
  };
  const text = cfg.whatsapp.messageTemplate.replace(
    /\{(\w+)\}/g,
    (_, k) => tokens[k] ?? ""
  );
  return `https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function redirectToWhatsApp(data, key) {
  const cfg = WEBMITRA_CONFIG.whatsapp;
  if (!cfg.enabled) return;
  const url = buildWhatsAppUrl(data, key);
  setTimeout(() => {
    if (cfg.openInNewTab) window.open(url, "_blank", "noopener");
    else window.location.href = url;
  }, cfg.redirectDelayMs);
}
