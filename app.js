/* ============================================================
   SISSI YANG — PORTFOLIO v2  ·  logic
   Trilingual (中 / FR / EN), single-page home, hash-routed
   project detail pages. Content from projects-data.js (PF_DATA).
   ============================================================ */

const DATA = (typeof window !== "undefined" && window.PF_DATA) || [];

/* ---------- language state ---------- */
const LANGS = ["zh", "fr", "en"];
let lang = (function () {
  try { const s = localStorage.getItem("pf-lang"); if (LANGS.includes(s)) return s; } catch (e) {}
  return "fr"; // default
})();
function langIndex() { return { zh: 0, fr: 1, en: 2 }[lang]; }
function L(a) {
  if (Array.isArray(a)) { const i = langIndex(); return a[i] || a[1] || a[0] || ""; }
  return a || "";
}

/* ---------- helpers ---------- */
function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* Find an image by NAME regardless of extension. We build two lists of URLs
   to try for one image:
   - native: extensions the browser can paint directly (jpg/png/webp/gif…),
     tried first via a normal <img> with an onerror chain.
   - heic:   HEIC/HEIF, which browsers (except Safari) can't display natively.
     These are fetched and decoded to JPEG in JS (heic2any) only if no native
     file was found — so common images stay fast and .heic still "just works". */
var NATIVE_EXTS = ["jpg", "jpeg", "png", "webp", "gif", "avif",
                   "JPG", "JPEG", "PNG", "WEBP", "GIF", "AVIF"];
var HEIC_EXTS = ["heic", "heif", "HEIC", "HEIF"];

function imgCandidates(dir, name) {
  const base = name.replace(/\.[^.\/]+$/, "");            // strip extension
  const origExt = (name.slice(base.length + 1) || "").toLowerCase();
  const url = f => "images/" + dir + "/" + f;
  const build = exts => {
    const seen = {}, out = [];
    // the exact name as written comes first when it belongs to this group
    const files = [];
    if (exts.map(e => e.toLowerCase()).indexOf(origExt) !== -1) files.push(name);
    exts.forEach(e => files.push(base + "." + e));
    files.forEach(f => { if (!seen[f]) { seen[f] = 1; out.push(url(f)); } });
    return out;
  };
  return { native: build(NATIVE_EXTS), heic: build(HEIC_EXTS) };
}

/* onerror handler for native candidates: advance to the next extension; once
   the native list is exhausted, fall back to decoding a HEIC file if present. */
window.imgFallback = function (img) {
  try {
    const list = JSON.parse(img.dataset.cands || "[]");
    const i = (parseInt(img.dataset.i, 10) || 0) + 1;
    if (i < list.length) { img.dataset.i = String(i); img.src = list[i]; }
    else { tryHeic(img); }
  } catch (e) { tryHeic(img); }
};

/* Resize a "contain" frame to the loaded image's real aspect ratio, so the
   image fills it exactly (no blank bars around portrait/landscape images). */
window.imgAutofit = function (img) {
  if (img.naturalWidth && img.naturalHeight) {
    const f = img.closest(".frame");
    if (f) f.style.aspectRatio = img.naturalWidth + " / " + img.naturalHeight;
    // keep the row's equal-height math in sync with the image's real ratio
    const cell = img.closest(".b-cell");
    if (cell) cell.style.setProperty("--ar", img.naturalWidth / img.naturalHeight);
  }
};

/* Fetch the first existing HEIC candidate, decode it to a JPEG blob and show it. */
function tryHeic(img) {
  if (img.dataset.heicTried) { img.style.display = "none"; return; }
  img.dataset.heicTried = "1";
  let list;
  try { list = JSON.parse(img.dataset.heic || "[]"); } catch (e) { list = []; }
  if (!list.length || typeof window.heic2any !== "function") { img.style.display = "none"; return; }
  (async () => {
    for (const u of list) {
      try {
        const res = await fetch(u);
        if (!res.ok) continue;
        const blob = await res.blob();
        const out = await window.heic2any({ blob: blob, toType: "image/jpeg", quality: 0.9 });
        const jpg = Array.isArray(out) ? out[0] : out;
        img.onerror = null;                 // decoded result must not re-trigger the chain
        img.src = URL.createObjectURL(jpg);
        img.style.display = "";
        return;
      } catch (e) { /* try next candidate */ }
    }
    img.style.display = "none";             // nothing found → placeholder shows
  })();
}

/* trilingual UI strings */
const UI = {
  navAbout: ["关于", "À propos", "About"],
  navWork: ["项目", "Projets", "Work"],
  navContact: ["联系", "Contact", "Contact"],
  eyebrow: ["视觉设计 & 艺术指导", "Design graphique & direction artistique", "Graphic design & art direction"],
  role: ["平面设计师", "Designer graphique", "Graphic designer"],
  cjk: ["七年设计经验", "7 ans d'expérience", "7 years of experience"],
  lead: [
    "我是一名拥有七年经验的平面设计师，擅长品牌识别、包装与数字界面。我重视与客户的有效沟通，能根据不同需求灵活切换风格，始终以让客户满意为目标，陪每个项目从概念走到落地。",
    "Designer graphique avec sept ans d'expérience en identité de marque, packaging et interfaces numériques. J'accorde une grande importance à une communication efficace avec mes clients, je sais adapter mon style à chaque besoin et je m'attache avant tout à leur satisfaction, de l'idée jusqu'à la réalisation.",
    "A graphic designer with seven years of experience in brand identity, packaging and digital interfaces. I value clear, effective communication with clients, adapt my style to each brief, and stay committed above all to client satisfaction — guiding every project from concept to delivery."
  ],
  chips: [
    ["视觉识别", "Identité visuelle", "Visual identity"],
    ["包装", "Packaging", "Packaging"],
    ["艺术指导", "Direction artistique", "Art direction"],
    ["网页 & UI", "Web & UI design", "Web & UI design"],
    ["插画 & 手绘", "Illustration & dessin", "Illustration & drawing"],
    ["摄影", "Photographie", "Photography"],
    ["市场营销", "Marketing", "Marketing"],
    ["视频剪辑", "Montage vidéo", "Video editing"],
    ["国画", "Peinture chinoise", "Chinese painting"]
  ],
  scroll: ["向下滚动", "Défiler", "Scroll"],
  workTitle: ["项目", "Projets", "Work"],
  langsLabel: ["工作语言", "Langues", "Languages"],
  total: ["个项目", "projets", "projects"],
  ctEyebrow: ["一起合作", "Travaillons ensemble", "Let's work together"],
  ctTitle: ["聊聊你的项目。", "Parlons de votre projet.", "Let's talk about your project."],
  back: ["返回", "Retour", "Back"],
  backAll: ["返回全部项目", "Retour aux projets", "Back to all projects"],
  prev: ["上一个", "Précédent", "Previous"],
  next: ["下一个", "Suivant", "Next"],
  rights: ["© 2026 杨晨曦 — 保留所有权利。", "© 2026 Sissi Yang — Tous droits réservés.", "© 2026 Sissi Yang — All rights reserved."],
  phone: ["电话", "Téléphone", "Phone"],
  resume: ["简历", "CV", "Resume"],
  resumeSoon: ["简历即将上线", "CV bientôt disponible", "Resume coming soon"],
  toTop: ["返回顶部", "Haut de page", "Back to top"]
};

/* ---------- image frame (with graceful placeholder) ---------- */
function frame(dir, name, ratio, cap, fit, fixed) {
  const cls = fit === "contain" ? "fit-contain" : "";
  let img = "";
  if (name) {
    const c = imgCandidates(dir, name);
    // Let the frame take the image's real shape once it loads, so every image —
    // portrait or landscape — fills its frame with no blank bars and no crop.
    // `fixed` opts out (used by the uniform project-card covers).
    const autofit = fixed ? "" : ` onload="imgAutofit(this)"`;
    img = `<img class="${cls}" src="${esc(c.native[0])}" data-i="0" data-cands="${esc(JSON.stringify(c.native))}" data-heic="${esc(JSON.stringify(c.heic))}" loading="lazy" alt=""${autofit} onerror="imgFallback(this)">`;
  }
  return `<div class="frame" style="aspect-ratio:${esc(ratio || "4/3")}">
      <div class="ph">
        <span class="ph-cap">${esc(L(cap))}</span>
        <span class="ph-file">${esc(name || "—")}</span>
      </div>
      ${img}
    </div>`;
}

/* ---------- project card ---------- */
function card(p) {
  const t = L(p.title);
  const cap = ["预览 · " + t, "Aperçu · " + t, "Preview · " + t];
  return `<a class="card reveal" href="#/projet/${encodeURIComponent(p.s)}">
      <div class="card-media">${frame(p.dir, p.cover, "4/5", cap, "cover", true)}</div>
      <div class="card-meta">
        <h3 class="card-title">${esc(t)}</h3>
        <span class="card-cat">${esc(L(p.cat))}</span>
      </div>
    </a>`;
}

/* ---------- content blocks (project detail) ---------- */
function sectionTitle(txt) {
  return `<div class="b-head"><span class="tick"></span><h3>${esc(L(txt))}</h3></div>`;
}

/* A grid/img cell: renders a <video> when the file is a video, else an image.
   Lets a grid mix or hold videos just by using a video filename. */
function isVideoFile(name) { return /\.(mp4|webm|ogg|ogv|mov|m4v)$/i.test(name || ""); }

/* Turn a ratio like "16/9" or "1/2" into a number (width/height). */
function ratioNum(r) {
  if (!r) return 16 / 9;
  const p = String(r).split("/");
  const n = p.length === 2 ? parseFloat(p[0]) / parseFloat(p[1]) : parseFloat(r);
  return isFinite(n) && n > 0 ? n : 16 / 9;
}

/* Like imgCandidates, but for video: find the clip by name whatever its
   container (.mp4 / .mov / .webm / .m4v…). Original name first. */
function videoCandidates(dir, name) {
  const base = name.replace(/\.[^.\/]+$/, "");
  // Try the web-friendly formats FIRST (mp4/webm/m4v). This matters when the
  // source is a .mov: many .mov files use codecs browsers can't play (e.g.
  // ProRes), so we prefer an .mp4 sibling if it exists and only fall back to
  // the original container last.
  const preferred = ["mp4", "webm", "m4v", "MP4", "WEBM", "M4V"];
  const rest = ["mov", "ogg", "ogv", "MOV", "OGG", "OGV"];
  const files = preferred.map(e => base + "." + e)
                  .concat([name])
                  .concat(rest.map(e => base + "." + e));
  const seen = {}, out = [];
  files.forEach(f => { if (!seen[f]) { seen[f] = 1; out.push("images/" + dir + "/" + f); } });
  return out;
}
function videoEl(dir, name) {
  const c = videoCandidates(dir, name);
  return `<video src="${esc(c[0])}" data-i="0" data-vids="${esc(JSON.stringify(c))}" controls playsinline preload="metadata" onerror="vidFallback(this)"></video>`;
}
/* onerror for <video>: try the next container extension. */
window.vidFallback = function (v) {
  try {
    const list = JSON.parse(v.dataset.vids || "[]");
    const i = (parseInt(v.dataset.i, 10) || 0) + 1;
    if (i < list.length) { v.dataset.i = String(i); v.src = list[i]; v.load(); }
  } catch (e) { /* give up quietly */ }
};

function media(dir, name, ratio, cap, fit) {
  if (isVideoFile(name)) {
    const cls = fit === "contain" ? " fit-contain" : "";
    return `<div class="frame frame-video${cls}" style="aspect-ratio:${esc(ratio || "1/1")}">
        ${videoEl(dir, name)}
      </div>`;
  }
  return frame(dir, name, ratio, cap, fit);
}
function renderBlock(b, p) {
  const d = p.dir;
  switch (b.k) {
    case "text":
      return `<div class="b-text reveal">${sectionTitle(b.t)}${b.b ? `<p>${esc(L(b.b))}</p>` : ""}</div>`;
    case "img": {
      // single image as a one-item row; `max` (px) caps its width (e.g. a logo)
      const mx = b.max ? `;max-width:${b.max}px` : "";
      return `<div class="b-grid reveal"><div class="b-grid-row"><div class="b-cell" style="--ar:${ratioNum(b.r)}${mx}">${media(d, b.src, b.r, b.cap, b.fit)}</div></div></div>`;
    }
    case "grid": {
      // Lay items out in rows of `cols`. Within a row each cell's width is made
      // proportional to its image aspect ratio (--ar), so every image in the row
      // ends up the SAME height — portraits get narrower, landscapes wider.
      const cols = b.cols || 2;
      let rows = "";
      for (let i = 0; i < b.items.length; i += cols) {
        const cells = b.items.slice(i, i + cols).map(it =>
          `<div class="b-cell" style="--ar:${ratioNum(it.r)}${it.max ? `;max-width:${it.max}px` : ""}">${media(d, it.src, it.r, it.cap, it.fit)}</div>`
        ).join("");
        rows += `<div class="b-grid-row">${cells}</div>`;
      }
      return `<div class="b-grid reveal">${rows}</div>`;
    }
    case "cards": {
      // Same row logic as grid so cards sitting side by side share image height.
      const cols = b.cols || 2;
      let rows = "";
      for (let i = 0; i < b.items.length; i += cols) {
        const cells = b.items.slice(i, i + cols).map(it => `
          <div class="b-cell ucard" style="--ar:${ratioNum(it.r)}">
            ${frame(d, it.src, it.r, it.t, it.fit)}
            <div class="ucard-meta">
              <div class="ucard-h">${it.sw ? `<span class="ucard-sw" style="background:${esc(it.sw)}"></span>` : ""}<span class="ucard-name">${esc(L(it.t))}</span></div>
              ${it.cn && lang === "zh" ? `<div class="ucard-cn">${esc(it.cn)}</div>` : ""}
              <p class="ucard-body">${esc(L(it.b))}</p>
            </div>
          </div>`).join("");
        rows += `<div class="b-grid-row">${cells}</div>`;
      }
      return `<div class="b-cards reveal">${rows}</div>`;
    }
    case "duo": {
      const txt = `<div class="txt">${sectionTitle(b.t)}<p>${esc(L(b.b))}</p></div>`;
      const im = `<div>${frame(d, b.img.src, b.img.r, b.img.cap, b.img.fit)}</div>`;
      const inner = b.layout === "text-img" ? txt + im : im + txt;
      return `<div class="b-duo reveal">${inner}</div>`;
    }
    case "video": {
      // Portrait videos (taller than wide) would fill the whole column and run
      // several screens tall — cap their width so they stay a sensible size.
      const rn = ratioNum(b.r);
      const portrait = rn < 0.95;
      const style = `aspect-ratio:${esc(b.r || "16/9")};` +
        (portrait ? `max-width:calc(72vh * ${rn});width:100%;align-self:center;` : "");
      return `<div class="b-video reveal" style="${style}">${videoEl(d, b.src)}</div>`;
    }
    case "pdf":
      if (b.missing)
        return `<div class="b-pdf-missing reveal">${esc(L(b.cap))}</div>`;
      return `<iframe class="b-pdf reveal" src="images/${esc(d)}/${esc(b.src)}" title="PDF"></iframe>`;
    default:
      return "";
  }
}

/* ============================================================
   VIEWS
   ============================================================ */
function homeHTML() {
  const chips = UI.chips.map(c => `<span class="chip">${esc(L(c))}</span>`).join("");
  const hero = `
    <header class="hero">
      <div class="hero-grid">
        <div class="hero-main">
          <div class="eyebrow"><span class="rule"></span>${esc(L(UI.eyebrow))}</div>
          <h1 class="hero-name">Sissi <em>Yang</em></h1>
          <button class="btn-cv btn-cv--hero" data-cv>${esc(L(UI.resume))}</button>
          <div class="hero-row">
            <div class="hero-role">${esc(L(UI.role))}</div>
            <span class="hero-cjk">${esc(L(UI.cjk))}</span>
          </div>
          <p class="hero-lead">${esc(L(UI.lead))}</p>
          <div class="chips">${chips}</div>
        </div>
        <aside class="hero-aside">
          <div class="portrait">
            <img src="images/about/portrait.jpg" alt="Sissi Yang" loading="lazy" onerror="this.style.display='none'">
          </div>
          <div class="langbar">
            <div class="langbar-label">${esc(L(UI.langsLabel))}</div>
            <div class="langbar-pills">
              <button class="langbar-pill ${lang === "zh" ? "on" : ""}" data-lang="zh">中文</button>
              <button class="langbar-pill ${lang === "fr" ? "on" : ""}" data-lang="fr">Français</button>
              <button class="langbar-pill ${lang === "en" ? "on" : ""}" data-lang="en">English</button>
            </div>
          </div>
        </aside>
      </div>
      <div class="scrollcue"><span class="dot"></span>${esc(L(UI.scroll))}</div>
    </header>`;

  const cards = DATA.map(card).join("");
  const work = `
    <section class="work" id="work-section">
      <div class="sec-head">
        <span class="sec-star">✦</span>
        <h2 class="sec-title">${esc(L(UI.workTitle))}</h2>
        <span class="sec-count">${DATA.length} ${esc(L(UI.total))}</span>
      </div>
      <div class="grid">${cards}</div>
    </section>`;

  return hero + work + contactHTML();
}

function contactHTML() {
  const cg = (h, rows) => `<div class="cg"><h5>${esc(h)}</h5>${rows.join("")}</div>`;
  const grid = [
    cg(L(UI.phone), [`<div>FR · 06 99 43 59 01</div>`, `<div>CN · +86 150 8182 3718</div>`]),
    cg("WeChat", [`<div>xixi20000202</div>`]),
    cg("Instagram", [
      `<a href="https://instagram.com/totorosissi" target="_blank" rel="noopener">@totorosissi</a>`,
      `<a href="https://instagram.com/sissi_20202" target="_blank" rel="noopener">@sissi_20202</a>`
    ]),
    cg("LinkedIn", [`<a href="https://linkedin.com/in/sissi-yang-335219290" target="_blank" rel="noopener">in/sissi-yang</a>`])
  ].join("");

  return `
    <section class="contact" id="contact-section">
      <div class="eyebrow"><span class="rule"></span>${esc(L(UI.ctEyebrow))}</div>
      <h2 class="contact-title">${esc(L(UI.ctTitle))}</h2>
      <a class="contact-mail" href="mailto:sissiyang20202@outlook.com">sissiyang20202@outlook.com</a>
      <div class="contact-actions"><button class="btn-cv btn-cv--big" data-cv>${esc(L(UI.resume))}</button></div>
      <div class="contact-grid">${grid}</div>
      <div class="contact-foot">
        <span>${esc(L(UI.rights))}</span>
        <button class="to-top" data-top aria-label="${esc(L(UI.toTop))}">${esc(L(UI.toTop))} <svg class="to-top-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V4M5 11l7-7 7 7"/></svg></button>
        <img src="images/LOGO/logoblack.png" alt="" onerror="this.style.visibility='hidden'">
      </div>
    </section>`;
}

function projectHTML(slug) {
  const idx = DATA.findIndex(p => p.s === slug);
  if (idx < 0) return homeHTML();
  const p = DATA[idx];
  const prev = DATA[idx - 1], next = DATA[idx + 1];

  const bar = `
    <div class="pbar">
      <a class="pbar-back" href="#">← ${esc(L(UI.back))}</a>
      <span class="pbar-cat">${esc(L(p.cat))}</span>
      <div class="pbar-nav">
        <a class="round ${prev ? "" : "dis"}" href="${prev ? "#/projet/" + encodeURIComponent(prev.s) : "#"}" aria-label="${esc(L(UI.prev))}">←</a>
        <a class="round ${next ? "" : "dis"}" href="${next ? "#/projet/" + encodeURIComponent(next.s) : "#"}" aria-label="${esc(L(UI.next))}">→</a>
      </div>
    </div>`;

  const cnSub = L(p.cn);
  const pTitle = L(p.title);
  const head = `
    <header class="phead">
      <div class="eyebrow"><span class="rule"></span>${esc(L(p.cat))}</div>
      <h1>${esc(pTitle)}</h1>
      ${cnSub && cnSub !== pTitle ? `<div class="cn">${esc(cnSub)}</div>` : ""}
    </header>`;

  const lead = `<div class="plead">${p.lead.map(t => `<p>${esc(L(t))}</p>`).join("")}</div>`;
  const body = `<div class="pbody">${p.blocks.map(b => renderBlock(b, p)).join("")}</div>`;

  const prevLink = prev
    ? `<a class="pfoot-link prev" href="#/projet/${encodeURIComponent(prev.s)}"><span class="pfoot-sub">← ${esc(L(UI.prev))}</span><strong class="pfoot-title">${esc(L(prev.title))}</strong></a>`
    : `<span></span>`;
  const nextLink = next
    ? `<a class="pfoot-link next" href="#/projet/${encodeURIComponent(next.s)}"><span class="pfoot-sub">${esc(L(UI.next))} →</span><strong class="pfoot-title">${esc(L(next.title))}</strong></a>`
    : `<a class="pfoot-link next" href="#"><span class="pfoot-sub">${esc(L(UI.backAll))} →</span><strong class="pfoot-title">${esc(L(UI.workTitle))}</strong></a>`;
  const foot = `<div class="pfoot">${prevLink}${nextLink}</div>`;

  document.title = pTitle + " — Sissi Yang";
  return bar + head + lead + body + foot;
}

/* ---------- nav ---------- */
function navHTML() {
  const pill = (l, label) => `<button class="lang-pill ${lang === l ? "on" : ""}" data-lang="${l}">${label}</button>`;
  return `
    <a class="brand" data-home href="#" aria-label="Sissi Yang — accueil">
      <img src="images/LOGO/logoblack.png" alt="Sissi Yang" onerror="this.style.display='none'">
      <span class="brand-name">Sissi&nbsp;Yang</span>
    </a>
    <div class="nav-right">
      <div class="nav-links">
        <button class="nav-link" data-scroll="work-section">${esc(L(UI.navAbout))}</button>
        <button class="nav-link" data-scroll="work-section">${esc(L(UI.navWork))}</button>
        <button class="nav-link" data-scroll="contact-section">${esc(L(UI.navContact))}</button>
      </div>
      <div class="lang">${pill("zh", "中")}${pill("fr", "FR")}${pill("en", "EN")}</div>
    </div>`;
}

/* ============================================================
   ROUTING & RENDER
   ============================================================ */
const navRoot = document.getElementById("nav-root");
const mainRoot = document.getElementById("main-root");

function currentRoute() {
  const h = location.hash;
  const m = h.match(/^#\/projet\/(.+)$/);
  if (m) return { view: "project", slug: decodeURIComponent(m[1]) };
  return { view: "home" };
}

function render(opts) {
  opts = opts || {};
  const route = currentRoute();
  document.documentElement.lang = lang === "zh" ? "zh" : lang;

  navRoot.innerHTML = navHTML();
  if (route.view === "project") {
    mainRoot.innerHTML = projectHTML(route.slug);
  } else {
    document.title = "Sissi Yang — Designer graphique & direction artistique";
    mainRoot.innerHTML = homeHTML();
  }

  if (opts.instant) {
    // language change: keep everything visible immediately (no re-animation flash)
    mainRoot.querySelectorAll(".reveal").forEach(el => el.classList.add("in"));
  } else {
    initReveal();
  }
}

/* reveal on scroll */
let io;
function initReveal() {
  if (!io) {
    io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  }
  mainRoot.querySelectorAll(".reveal").forEach(el => { if (!el.classList.contains("in")) io.observe(el); });
}

/* route change → re-render, scroll to top */
window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });

/* smooth-scroll a section id; if on a detail page, go home first */
function scrollToSection(id) {
  const doScroll = () => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth" }); };
  if (currentRoute().view !== "home") {
    if (location.hash) { location.hash = ""; setTimeout(doScroll, 70); }
    else { render(); setTimeout(doScroll, 70); }
  } else {
    doScroll();
  }
}

/* ---------- event delegation ---------- */
document.addEventListener("click", e => {
  const langBtn = e.target.closest("[data-lang]");
  if (langBtn) {
    lang = langBtn.getAttribute("data-lang");
    try { localStorage.setItem("pf-lang", lang); } catch (err) {}
    render({ instant: true });
    return;
  }
  const scrollBtn = e.target.closest("[data-scroll]");
  if (scrollBtn) {
    e.preventDefault();
    scrollToSection(scrollBtn.getAttribute("data-scroll"));
    return;
  }
  const home = e.target.closest("[data-home]");
  if (home) {
    e.preventDefault();
    if (location.hash) location.hash = "";
    else render();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  if (e.target.closest("[data-cv]")) { e.preventDefault(); openCV(); return; }
  if (e.target.closest("[data-top]")) { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
});

/* ---------- CV / resume viewer ---------- */
const CV_FILES = { zh: "cv/CVZH.pdf", fr: "cv/CVFR.pdf", en: "cv/CVEN.pdf" };
async function resolveCV() {
  // prefer the current language, then fall back to whichever exists
  const order = [lang, "fr", "en", "zh"].filter((v, i, a) => a.indexOf(v) === i);
  for (const l of order) {
    try { const r = await fetch(CV_FILES[l], { method: "HEAD" }); if (r.ok) return CV_FILES[l]; } catch (e) {}
  }
  return null;
}
function closeCV() {
  const m = document.getElementById("cv-modal");
  if (m) { m.classList.remove("open"); const f = m.querySelector(".cv-frame"); if (f) f.src = "about:blank"; }
  document.body.style.overflow = "";
}
function openCV() {
  let m = document.getElementById("cv-modal");
  if (!m) {
    m = document.createElement("div");
    m.id = "cv-modal";
    m.className = "cv-modal";
    m.innerHTML = `<div class="cv-dialog">
        <div class="cv-bar">
          <span class="cv-title"></span>
          <span class="cv-tools"><a class="cv-open" target="_blank" rel="noopener" aria-label="↗">↗</a><button class="cv-close" aria-label="×">×</button></span>
        </div>
        <div class="cv-body"><div class="cv-status"></div><iframe class="cv-frame" title="CV"></iframe></div>
      </div>`;
    document.body.appendChild(m);
    m.addEventListener("click", ev => { if (ev.target === m || ev.target.closest(".cv-close")) closeCV(); });
  }
  m.querySelector(".cv-title").textContent = L(UI.resume);
  const frame = m.querySelector(".cv-frame");
  const status = m.querySelector(".cv-status");
  const openLink = m.querySelector(".cv-open");
  frame.style.display = "none"; frame.src = "about:blank";
  openLink.style.display = "none";
  status.style.display = ""; status.textContent = "…";
  m.classList.add("open");
  document.body.style.overflow = "hidden";
  resolveCV().then(url => {
    if (!m.classList.contains("open")) return;
    if (url) { frame.src = url; frame.style.display = ""; status.style.display = "none"; openLink.href = url; openLink.style.display = ""; }
    else { status.textContent = L(UI.resumeSoon); }
  });
}

/* keyboard: prev/next + esc on detail pages */
document.addEventListener("keydown", e => {
  const cv = document.getElementById("cv-modal");
  if (cv && cv.classList.contains("open")) { if (e.key === "Escape") closeCV(); return; }
  const route = currentRoute();
  if (route.view !== "project") return;
  const idx = DATA.findIndex(p => p.s === route.slug);
  if (e.key === "Escape") location.hash = "";
  if (e.key === "ArrowLeft" && idx > 0) location.hash = "#/projet/" + encodeURIComponent(DATA[idx - 1].s);
  if (e.key === "ArrowRight" && idx < DATA.length - 1) location.hash = "#/projet/" + encodeURIComponent(DATA[idx + 1].s);
});

/* nav shadow-ish state on scroll (optional subtle) */
window.addEventListener("scroll", () => {
  navRoot.classList.toggle("scrolled", window.scrollY > 40);
}, { passive: true });

/* ---------- boot ---------- */
if (!DATA.length) {
  mainRoot.innerHTML = `<p style="padding:120px 24px;color:var(--ink-55)">Impossible de charger les projets (projects-data.js). Ouvre le site via un petit serveur local.</p>`;
  navRoot.innerHTML = navHTML();
} else {
  render();
}
