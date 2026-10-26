"use strict";

const form = document.getElementById("address-form");
const address = document.getElementById("address");
const navForm = document.getElementById("nav-form");
const navAddress = document.getElementById("nav-address");
const error = document.getElementById("error");
const status = document.getElementById("status");
const welcome = document.getElementById("welcome");
const stage = document.getElementById("browser-stage");
const view = document.getElementById("view");
const tabsEl = document.getElementById("tabs");
const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
const scramjet = new $scramjetLoadController().ScramjetController({
  files: {
    wasm: "/scram/scramjet.wasm.wasm",
    all: "/scram/scramjet.all.js",
    sync: "/scram/scramjet.sync.js"
  }
});

let tabs = [];
let activeId = 0;
let nextId = 1;
let ready = false;

function normalizeInput(value) {
  const input = value.trim();
  if (!input) return null;
  if (/^https?:\/\//i.test(input)) {
    try {
      const url = new URL(input);
      return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }
  if (/^[\w-]+\.[a-z]{2,}(?:[/:?#]|$)/i.test(input)) return "https://" + input;
  return "https://www.google.com/search?q=" + encodeURIComponent(input);
}

function activeTab() { return tabs.find((tab) => tab.id === activeId); }

function renderTabs() {
  tabsEl.replaceChildren();
  for (const tab of tabs) {
    const button = document.createElement("div");
    button.className = "tab" + (tab.id === activeId ? " active" : "");
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(tab.id === activeId));
    const label = document.createElement("span");
    label.textContent = tab.title;
    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "×";
    close.setAttribute("aria-label", "Close " + tab.title);
    close.addEventListener("click", (event) => {
      event.stopPropagation();
      closeTab(tab.id);
    });
    button.addEventListener("click", () => switchTab(tab.id));
    button.append(label, close);
    tabsEl.append(button);
  }
}

function setTitle(tab, url) {
  tab.url = url;
  try { tab.title = new URL(url).hostname.replace(/^www\./, ""); }
  catch { tab.title = "New tab"; }
}

function showBrowser() {
  welcome.hidden = true;
  stage.hidden = false;
  status.textContent = "Browser ready";
}

async function openUrl(value) {
  const url = normalizeInput(value);
  if (!url) {
    error.textContent = "Enter a valid website address or search.";
    return;
  }
  error.textContent = "";
  try {
    if (!ready) {
      status.textContent = "Starting browser…";
      await registerSW();
      await scramjet.init();
      const wispUrl = (location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/wisp/";
      await connection.setTransport("/libcurl/index.mjs", [{ websocket: wispUrl }]);
      ready = true;
    }
    let tab = activeTab();
    if (!tab) {
      tab = { id: nextId++, url: "", title: "New tab", history: [], index: -1, frame: null };
      tabs.push(tab);
      activeId = tab.id;
    }
    setTitle(tab, url);
    tab.history = tab.history.slice(0, tab.index + 1);
    tab.history.push(url);
    tab.index = tab.history.length - 1;
    if (!tab.frame) {
      const frame = scramjet.createFrame();
      frame.frame.id = "sj-frame";
      tab.frame = frame;
    }
    view.replaceChildren(tab.frame.frame);
    tab.frame.go(url);
    navAddress.value = url;
    showBrowser();
    renderTabs();
    status.textContent = "Loading " + tab.title;
  } catch (err) {
    status.textContent = "Browser error";
    error.textContent = "Could not start the browser. " + (err?.message || String(err));
  }
}

function switchTab(id) {
  const tab = tabs.find((item) => item.id === id);
  if (!tab) return;
  activeId = id;
  view.replaceChildren();
  if (tab.frame) view.append(tab.frame.frame);
  navAddress.value = tab.url || "";
  status.textContent = tab.url ? "Open: " + tab.title : "New tab";
  renderTabs();
}

function newTab() {
  const tab = { id: nextId++, url: "", title: "New tab", history: [], index: -1, frame: null };
  tabs.push(tab);
  activeId = tab.id;
  switchTab(tab.id);
  navAddress.value = "";
  navAddress.focus();
}

function closeTab(id) {
  const index = tabs.findIndex((tab) => tab.id === id);
  if (index < 0) return;
  const [tab] = tabs.splice(index, 1);
  tab.frame?.frame.remove();
  if (!tabs.length) {
    activeId = 0;
    stage.hidden = true;
    welcome.hidden = false;
    status.textContent = "Ready";
    renderTabs();
    return;
  }
  if (activeId === id) activeId = tabs[Math.max(0, index - 1)].id;
  switchTab(activeId);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  openUrl(address.value);
});
navForm.addEventListener("submit", (event) => {
  event.preventDefault();
  openUrl(navAddress.value);
});
document.querySelectorAll("[data-url]").forEach((button) =>
  button.addEventListener("click", () => openUrl(button.dataset.url))
);
document.getElementById("new-tab").addEventListener("click", newTab);
document.getElementById("home").addEventListener("click", () => {
  stage.hidden = true;
  welcome.hidden = false;
  status.textContent = "Ready";
});
document.getElementById("reload").addEventListener("click", () => {
  const tab = activeTab();
  if (tab?.frame && tab.url) tab.frame.go(tab.url);
});
document.getElementById("back").addEventListener("click", () => {
  const tab = activeTab();
  if (!tab || tab.index <= 0) return;
  tab.index -= 1;
  tab.url = tab.history[tab.index];
  tab.frame?.go(tab.url);
  navAddress.value = tab.url;
  renderTabs();
});
