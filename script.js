

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { WEBMITRA_CONFIG, redirectToWhatsApp } from "./config.js";

const app = initializeApp(WEBMITRA_CONFIG.firebase);
const db = getDatabase(app);
const auth = getAuth(app);

const $ = (s) => document.querySelector(s);
const form = $("#order-form");
const status = $("#order-status");
const authStatus = $("#auth-status");
let authMethod = "guest";
let authUser = null;

function setAuth(msg, kind = "info") {
  authStatus.className = `status ${kind}`;
  authStatus.textContent = msg;
}
function setStatus(msg, kind = "info") {
  status.className = `status ${kind}`;
  status.textContent = msg;
}
function fillFromUser(u) {
  if (!u) return;
  if (u.displayName && !$("#name").value) $("#name").value = u.displayName;
  if (u.email && !$("#email").value) $("#email").value = u.email;
  if (u.phoneNumber && !$("#phone").value) $("#phone").value = u.phoneNumber;
}

// Pre-fill website type from ?type=
const params = new URLSearchParams(location.search);
if (params.get("type")) {
  const wanted = params.get("type").toLowerCase();
  const sel = $("#type");
  [...sel.options].forEach((o) => {
    if (o.value.toLowerCase() === wanted || o.textContent.toLowerCase() === wanted) {
      sel.value = o.value || o.textContent;
    }
  });
}

// Step indicator
function setStep(active) {
  document.querySelectorAll(".pdot").forEach((d, i) => {
    d.classList.toggle("active", i + 1 <= active);
  });
}
setStep(1);

// Auth: Google
$("#google-login").addEventListener("click", async () => {
  try {
    setAuth("Opening Google sign-in...", "info");
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    authUser = result.user;
    authMethod = "google";
    fillFromUser(authUser);
    setAuth(`Signed in as ${authUser.email || authUser.displayName}.`, "success");
    setStep(2);
  } catch (err) {
    setAuth(`Sign-in cancelled or failed. You can still continue with email.`, "error");
  }
});

// Auth: Email continue
$("#email-start").addEventListener("click", () => {
  $("#email-row").style.display = "flex";
  $("#email-auth").focus();
});
$("#email-continue").addEventListener("click", () => {
  const v = $("#email-auth").value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    setAuth("Please enter a valid email.", "error");
    return;
  }
  authMethod = "email";
  authUser = { email: v };
  $("#email").value = v;
  setAuth(`Email saved. Continue to fill the form below.`, "success");
  setStep(2);
});

onAuthStateChanged(auth, (u) => {
  if (u) {
    authUser = u;
    fillFromUser(u);
  }
});

// Validation
function validate() {
  let ok = true;
  const required = ["name", "email", "phone", "type", "siteFormat", "budget", "description"];
  required.forEach((id) => {
    const el = document.getElementById(id);
    const wrap = el?.closest(".field");
    if (!el) return;
    let valid = !!el.value.trim();
    if (id === "email") valid = valid && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value);
    if (id === "phone") valid = valid && el.value.replace(/\D/g, "").length >= 7;
    if (wrap) wrap.classList.toggle("invalid", !valid);
    if (!valid) ok = false;
  });
  // siteFormat is a radio group
  const sf = document.querySelector('input[name="siteFormat"]:checked');
  const sfWrap = document.getElementById("siteFormatField");
  if (!sf) {
    if (sfWrap) sfWrap.classList.add("invalid");
    ok = false;
  } else if (sfWrap) {
    sfWrap.classList.remove("invalid");
  }
  return ok;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validate()) {
    setStatus("Please complete the required fields above.", "error");
    return;
  }
  setStep(3);
  setStatus("Saving your order...", "info");

  const data = {
    name: $("#name").value.trim(),
    email: $("#email").value.trim(),
    phone: $("#phone").value.trim(),
    websiteType: $("#type").value,
    siteFormat: document.querySelector('input[name="siteFormat"]:checked')?.value || "",
    budget: $("#budget").value,
    deadline: $("#deadline").value,
    description: $("#description").value.trim(),
    authMethod,
    authUid: authUser?.uid || null,
    createdAt: serverTimestamp(),
    source: "webmitra-site",
    page: location.href,
  };

  try {
    const r = await push(ref(db, "orders"), data);
    const key = r.key;
    setStatus(`Order saved (ID: ${key}). Opening WhatsApp...`, "success");
    redirectToWhatsApp(data, key);
    form.reset();
  } catch (err) {
    console.error(err);
    setStatus("Could not save the order. Please try again or contact us on WhatsApp.", "error");
  }
});
