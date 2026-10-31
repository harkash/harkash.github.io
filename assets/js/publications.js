/* ==========================================================================
   Renders papers.bib into the Publications section.
   No dependencies. See the header of papers.bib for the supported fields.
   ========================================================================== */

(function () {
  "use strict";

  const CONFIG = {
    bibFile: "papers.bib",
    thumbDir: "assets/img/pubs/",
    // Author names (as displayed, "First Last") to highlight in bold.
    self: ["Harish Haresamudram", "H. Harish", "H. Kashyap"],
    defaultTab: "selected", // "selected" or "all"
    // Research themes for the filter buttons; keys are used in the bib's topic = {...} field.
    topics: [
      { key: "ssl", label: "Self-supervised learning" },
      { key: "multimodal", label: "Sensors & language" },
    ],
  };

  // Fields that drive the website; they are stripped from the BibTeX shown to visitors.
  const SITE_FIELDS = new Set([
    "abbr", "shorthand", "topic", "blog", "preview", "selected", "tldr", "html", "pdf", "arxiv", "code", "website",
    "video", "slides", "poster", "award", "abstract", "bibtex_show", "url",
  ]);

  const MONTHS = {
    jan: "January", feb: "February", mar: "March", apr: "April", may: "May", jun: "June",
    jul: "July", aug: "August", sep: "September", oct: "October", nov: "November", dec: "December",
  };

  /* ---------------------------- BibTeX parsing ---------------------------- */

  function parseBib(src) {
    const strings = Object.assign({}, MONTHS);
    const entries = [];
    let i = 0;

    while ((i = src.indexOf("@", i)) !== -1) {
      const head = /^@\s*([a-zA-Z]+)\s*\{/.exec(src.slice(i));
      if (!head) { i++; continue; }
      const type = head[1].toLowerCase();
      const start = i + head[0].length;

      let depth = 1, k = start;
      while (k < src.length && depth > 0) {
        if (src[k] === "{") depth++;
        else if (src[k] === "}") depth--;
        k++;
      }
      const body = src.slice(start, k - 1);
      i = k;

      if (type === "comment" || type === "preamble") continue;
      if (type === "string") {
        Object.assign(strings, parseFields(body, strings));
        continue;
      }
      const comma = body.indexOf(",");
      if (comma === -1) continue;
      entries.push({
        type,
        key: body.slice(0, comma).trim(),
        fields: parseFields(body.slice(comma + 1), strings),
      });
    }
    return entries;
  }

  function parseFields(s, strings) {
    const out = {};
    let i = 0;
    const n = s.length;
    const skip = () => { while (i < n && /[\s,]/.test(s[i])) i++; };

    while (i < n) {
      skip();
      const m = /^([A-Za-z0-9_\-:.]+)\s*=\s*/.exec(s.slice(i));
      if (!m) break;
      const name = m[1].toLowerCase();
      i += m[0].length;

      const parts = [];
      for (;;) {
        while (i < n && /\s/.test(s[i])) i++;
        if (s[i] === "{") {
          let depth = 1, j = i + 1;
          while (j < n && depth > 0) {
            if (s[j] === "{") depth++;
            else if (s[j] === "}") depth--;
            j++;
          }
          parts.push(s.slice(i + 1, j - 1));
          i = j;
        } else if (s[i] === '"') {
          let depth = 0, j = i + 1;
          while (j < n && !(s[j] === '"' && depth === 0)) {
            if (s[j] === "{") depth++;
            else if (s[j] === "}") depth--;
            j++;
          }
          parts.push(s.slice(i + 1, j));
          i = j + 1;
        } else {
          const w = /^[^\s,#}]+/.exec(s.slice(i));
          if (!w) break;
          const word = w[0];
          parts.push(strings[word.toLowerCase()] !== undefined ? strings[word.toLowerCase()] : word);
          i += word.length;
        }
        while (i < n && /\s/.test(s[i])) i++;
        if (s[i] === "#") { i++; continue; }
        break;
      }
      out[name] = parts.join("");
    }
    return out;
  }

  /* --------------------------- Text formatting --------------------------- */

  const ACCENTS = {
    '"': "̈", "'": "́", "`": "̀", "^": "̂", "~": "̃",
    "=": "̄", ".": "̇", u: "̆", v: "̌", H: "̋", c: "̧", k: "̨",
  };

  function delatex(s) {
    if (!s) return "";
    return s
      .replace(/\\(["'`^~=.])\s*\{?\s*\\?([A-Za-z])\s*\}?/g, (_, a, ch) => (ch + ACCENTS[a]).normalize("NFC"))
      .replace(/\\([uvHck])\s*\{\s*([A-Za-z])\s*\}/g, (_, a, ch) => (ch + ACCENTS[a]).normalize("NFC"))
      .replace(/\\ss\b\s*/g, "ß").replace(/\\o\b\s*/g, "ø").replace(/\\O\b\s*/g, "Ø")
      .replace(/\\aa\b\s*/g, "å").replace(/\\ae\b\s*/g, "æ").replace(/\\l\b\s*/g, "ł")
      .replace(/\\(?:textit|emph|textbf|textrm|texttt|textsc|mathrm|url)\s*\{([^{}]*)\}/g, "$1")
      .replace(/\\([&%_$#])/g, "$1")
      .replace(/---/g, "—").replace(/--/g, "–")
      .replace(/~/g, " ")
      .replace(/[{}]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function splitAuthors(s) {
    const out = [];
    let depth = 0, cur = "";
    const tokens = s.split(/(\s+and\s+|[{}])/i);
    for (const t of tokens) {
      if (t === "{") depth++;
      if (t === "}") depth--;
      if (depth === 0 && /^\s+and\s+$/i.test(t)) { out.push(cur); cur = ""; }
      else cur += t;
    }
    if (cur.trim()) out.push(cur);
    return out.map((a) => a.trim()).filter(Boolean);
  }

  function formatName(raw) {
    const name = delatex(raw);
    if (name.toLowerCase() === "others") return null;
    let first, last;
    if (name.includes(",")) {
      const idx = name.indexOf(",");
      last = name.slice(0, idx).trim();
      first = name.slice(idx + 1).trim();
    } else {
      const parts = name.split(/\s+/);
      last = parts.pop();
      first = parts.join(" ");
    }
    first = first.replace(/\b([A-Z])(?=\s|$)/g, "$1.");
    return (first ? first + " " : "") + last;
  }

  function authorsHtml(field) {
    const names = splitAuthors(field || "");
    const shown = [];
    let others = false;
    for (const raw of names) {
      const n = formatName(raw);
      if (n === null) { others = true; continue; }
      const me = /\\textbf/.test(raw) || CONFIG.self.includes(n);
      shown.push(me ? `<b class="me">${esc(n)}</b>` : esc(n));
    }
    return shown.join(", ") + (others ? ", et al." : "");
  }

  function venueText(e) {
    const f = e.fields;
    let v = f.journal || f.booktitle || f.howpublished || f.note || f.school || f.institution || "";
    v = delatex(v);
    if ((f.journal || f.booktitle) && f.note) v += ` (${delatex(f.note)})`;
    let vol = "";
    if (f.journal && f.volume && !/^arXiv/i.test(f.journal)) {
      vol = " " + delatex(f.volume) + (f.number ? `(${delatex(f.number)})` : "");
    }
    return { venue: v, vol };
  }

  function hue(str) {
    let h = 0;
    for (const c of str) h = (h * 31 + c.charCodeAt(0)) % 360;
    return h;
  }

  /* ------------------------------- Links -------------------------------- */

  function links(e) {
    const f = e.fields;
    const paper = f.html || (f.doi ? "https://doi.org/" + f.doi : "") || f.url || "";
    const arxiv = f.arxiv ? "https://arxiv.org/abs/" + f.arxiv.replace(/^arXiv:/i, "") : "";
    const main = paper || arxiv || f.pdf || f.website || "";
    const list = [];
    if (paper) list.push(["Paper", paper]);
    if (arxiv) list.push(["arXiv", arxiv]);
    if (f.pdf) list.push(["PDF", f.pdf]);
    if (f.blog) list.push(["Blog", f.blog]);
    if (f.code) list.push(["Code", f.code]);
    if (f.website) list.push(["Website", f.website]);
    if (f.video) list.push(["Video", f.video]);
    if (f.slides) list.push(["Slides", f.slides]);
    if (f.poster) list.push(["Poster", f.poster]);
    return { main, list };
  }

  function cleanBibtex(e) {
    const lines = Object.entries(e.fields)
      .filter(([k]) => !SITE_FIELDS.has(k))
      .map(([k, v]) => `  ${k} = {${v.replace(/\\textbf\{([^{}]*)\}/g, "$1")}}`);
    return `@${e.type}{${e.key},\n${lines.join(",\n")}\n}`;
  }

  /* ------------------------------ Rendering ----------------------------- */

  function thumbHtml(e, main) {
    const f = e.fields;
    const abbr = delatex(f.abbr || f.shorthand || "");
    const year = delatex(f.year || "");
    let inner;
    if (f.preview) {
      inner = `<img src="${esc(CONFIG.thumbDir + f.preview)}" alt="" loading="lazy" decoding="async">`;
    } else {
      inner = `<span class="pub-tile" style="--h:${hue(abbr || e.key)}"><span>${esc(abbr || "Paper")}</span><small>${esc(year)}</small></span>`;
    }
    const tag = main ? `a href="${esc(main)}" tabindex="-1" aria-hidden="true"` : `div aria-hidden="true"`;
    return `<${tag} class="pub-thumb${f.preview ? "" : " is-tile"}">${inner}</${main ? "a" : "div"}>`;
  }

  function topicsOf(e) {
    return (e.fields.topic || "").toLowerCase().split(/[\s,;]+/).filter(Boolean);
  }

  function entryHtml(e, withId) {
    const f = e.fields;
    const { main, list } = links(e);
    const title = esc(delatex(f.title || "Untitled"));
    const { venue, vol } = venueText(e);
    const id = withId ? ` id="p-${esc(e.key)}"` : "";
    const award = f.award ? `<span class="pub-award">${esc(delatex(f.award))}</span>` : "";

    const buttons = list.map(([label, href]) => `<a href="${esc(href)}">${label}</a>`);
    if (f.abstract) buttons.push(`<button type="button" data-drawer="abstract" aria-expanded="false">Abstract</button>`);
    buttons.push(`<button type="button" data-drawer="bibtex" aria-expanded="false">BibTeX</button>`);

    return `
      <article class="pub"${id} data-topics="${esc(topicsOf(e).join(" "))}">
        ${thumbHtml(e, main)}
        <div class="pub-body">
          <h4 class="pub-title">${main ? `<a href="${esc(main)}">${title}</a>` : title}</h4>
          <p class="pub-authors">${authorsHtml(f.author)}</p>
          <p class="pub-venue">${f.abbr || f.shorthand ? `<span class="pub-badge">${esc(delatex(f.abbr || f.shorthand))}</span>` : ""}<em>${esc(venue)}</em>${esc(vol)}${venue ? ", " : ""}${esc(delatex(f.year || ""))}${award}</p>
          ${f.tldr ? `<p class="pub-tldr">${esc(delatex(f.tldr))}</p>` : ""}
          <div class="pub-links">${buttons.join("")}</div>
          ${f.abstract ? `<div class="pub-drawer" data-for="abstract" hidden><p>${esc(delatex(f.abstract))}</p></div>` : ""}
          <div class="pub-drawer" data-for="bibtex" hidden>
            <button type="button" class="copy">Copy</button>
            <pre>${esc(cleanBibtex(e))}</pre>
          </div>
        </div>
      </article>`;
  }

  function byYearDesc(entries) {
    return entries
      .map((e, idx) => ({ e, idx, y: parseInt(e.fields.year, 10) || 0 }))
      .sort((a, b) => b.y - a.y || a.idx - b.idx)
      .map((x) => x.e);
  }

  function render(entries, root) {
    const all = byYearDesc(entries);
    const selected = all.filter((e) => /^(true|yes|1)$/i.test((e.fields.selected || "").trim()));
    const topics = CONFIG.topics.filter((t) => all.some((e) => topicsOf(e).includes(t.key)));

    let allHtml = "", year = null, buf = [];
    const flush = () => {
      if (!buf.length) return;
      allHtml += `<div class="pub-group"><div class="pub-year"><h3>${esc(year || "Other")}</h3><span class="pub-year-count">${buf.length}</span></div>${buf.join("")}</div>`;
      buf = [];
    };
    for (const e of all) {
      const y = delatex(e.fields.year || "");
      if (y !== year) { flush(); year = y; }
      buf.push(entryHtml(e, true));
    }
    flush();

    const topicButtons = topics.map((t) => {
      const n = all.filter((e) => topicsOf(e).includes(t.key)).length;
      return `<button type="button" data-topic="${esc(t.key)}" aria-pressed="false">${esc(t.label)} <span>${n}</span></button>`;
    }).join("");

    root.innerHTML = `
      <div class="pub-controls">
        <div class="pub-tabs" role="group" aria-label="Show publications">
          <button type="button" data-tab="selected">Selected <span>${selected.length}</span></button>
          <button type="button" data-tab="all">All <span>${all.length}</span></button>
        </div>
        ${topics.length ? `<div class="pub-topics" role="group" aria-label="Filter by research theme"><span class="pub-topics-label">Themes</span>${topicButtons}</div>` : ""}
      </div>
      <div class="pub-list" data-list="selected">${selected.map((e) => entryHtml(e, false)).join("")}</div>
      <div class="pub-list" data-list="all">${allHtml}</div>`;

    // View state: which tab, and (in "All") which theme filter, if any.
    let tab = selected.length ? CONFIG.defaultTab : "all";
    let topic = null;
    const apply = () => {
      root.querySelectorAll("[data-tab]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tab === tab)));
      root.querySelectorAll("[data-topic]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.topic === topic)));
      root.querySelectorAll("[data-list]").forEach((l) => { l.hidden = l.dataset.list !== tab; });
      root.querySelectorAll('[data-list="all"] .pub-group').forEach((g) => {
        let shown = 0;
        g.querySelectorAll(".pub").forEach((a) => {
          const ok = !topic || a.dataset.topics.split(" ").includes(topic);
          a.hidden = !ok;
          if (ok) shown++;
        });
        g.hidden = shown === 0;
        g.querySelector(".pub-year-count").textContent = shown;
      });
    };
    const setTab = (t) => { tab = t; topic = null; apply(); };
    const setTopic = (k) => { topic = topic === k ? null : k; tab = "all"; apply(); };
    apply();

    root.addEventListener("click", (ev) => {
      const tabBtn = ev.target.closest("[data-tab]");
      if (tabBtn) { setTab(tabBtn.dataset.tab); return; }

      const topicBtn = ev.target.closest("[data-topic]");
      if (topicBtn) { setTopic(topicBtn.dataset.topic); return; }

      const drawerBtn = ev.target.closest("[data-drawer]");
      if (drawerBtn) {
        const body = drawerBtn.closest(".pub-body");
        const which = drawerBtn.dataset.drawer;
        body.querySelectorAll("[data-drawer]").forEach((b) => {
          const open = b === drawerBtn && b.getAttribute("aria-expanded") !== "true";
          b.setAttribute("aria-expanded", String(open));
          body.querySelector(`.pub-drawer[data-for="${b.dataset.drawer}"]`).hidden = !open;
        });
        if (which) return;
      }

      const copyBtn = ev.target.closest(".copy");
      if (copyBtn) {
        const text = copyBtn.nextElementSibling.textContent;
        const done = () => { copyBtn.textContent = "Copied"; setTimeout(() => (copyBtn.textContent = "Copy"), 1500); };
        if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => {});
      }
    });

    // Links like href="#p-somekey" (from Research / News) jump into the "All" list.
    const jump = (hash) => {
      if (!/^#p-/.test(hash)) return false;
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return false;
      setTab("all");
      target.scrollIntoView({ block: "start" });
      target.classList.remove("flash");
      void target.offsetWidth;
      target.classList.add("flash");
      return true;
    };
    // Links like href="#pubs-ssl" (from the Research themes) open "All" filtered to that theme.
    const jumpTopic = (hash) => {
      const m = /^#pubs-(.+)$/.exec(hash);
      if (!m || !topics.some((t) => t.key === m[1])) return false;
      topic = null;
      setTopic(m[1]);
      document.getElementById("publications").scrollIntoView({ block: "start" });
      return true;
    };
    document.addEventListener("click", (ev) => {
      const a = ev.target.closest('a[href^="#p-"], a[href^="#pubs-"]');
      if (!a) return;
      const href = a.getAttribute("href");
      if (jump(href) || jumpTopic(href)) {
        ev.preventDefault();
        history.replaceState(null, "", href);
      }
    });
    if (location.hash) jump(location.hash) || jumpTopic(location.hash);
  }

  /* -------------------------------- Boot -------------------------------- */

  const root = document.getElementById("pub-root");
  if (!root) return;

  fetch(CONFIG.bibFile, { cache: "no-cache" })
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then((text) => render(parseBib(text), root))
    .catch(() => {
      root.innerHTML = `
        <div class="pub-error">
          <p><strong>Publications could not be loaded.</strong></p>
          <p>${location.protocol === "file:"
            ? `Browsers block reading <code>${CONFIG.bibFile}</code> from a file opened directly. Preview the site with a local server instead: run <code>python3 -m http.server</code> in this folder and open <a href="http://localhost:8000">localhost:8000</a>.`
            : `See the full list on <a href="https://scholar.google.com/citations?user=ThV9ezEAAAAJ">Google Scholar</a>.`}</p>
        </div>`;
    });
})();
