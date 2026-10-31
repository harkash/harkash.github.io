# harkash.github.io

Personal academic website. Plain HTML + CSS + one small script: no Jekyll, no build step, no dependencies.

```
index.html                 home page: intro, About, News, Research, Publications
interests.html             Interests page (bookshelf)
blog.html                  Blog page (list of posts, linked from the top bar)
projects/nls_limitations/  blog post on the AAAI '25 paper (same URL as the old site)
papers.bib                 ALL publications; the site renders this file
assets/js/publications.js  turns papers.bib into the Publications section
assets/css/style.css       all styling (light + dark mode)
assets/img/pubs/           one thumbnail per paper (referenced by `preview` in papers.bib)
assets/img/profile.jpg     headshot (square, ~640px)
assets/cv.pdf              your CV (overwrite to update; links never change)
assets/favicon*.svg/png    browser tab + iOS home-screen icons
.nojekyll                  tells GitHub Pages to serve files as-is
404.html                   shown for broken links
```

## Preview locally

The publication list is loaded from `papers.bib`, which browsers block for files opened directly
(`file://`). Run a tiny local server instead:

```sh
cd path/to/this/folder
python3 -m http.server 8000      # then open http://localhost:8000
```

## Add a paper

1. Paste the entry into `papers.bib` under the right year. Entries from your CV's .bib work as-is
   (`shorthand` becomes the venue badge; names in `\textbf{...}` are bolded).
2. Optionally add site fields: `preview`, `selected`, `topic`, `tldr`, `doi`/`html`, `pdf`, `arxiv`, `code`, `blog`,
   `website`, `video`, `slides`, `poster`, `award`, `abstract`. The header of `papers.bib` explains each.
3. Add a thumbnail (a teaser figure from the paper works best), resized to 640px wide:
   ```sh
   sips -s format png --resampleWidth 640 figure.png --out assets/img/pubs/my_paper.png
   ```
   then set `preview = {my_paper.png}`. Without one, the paper gets a coloured tile showing its `shorthand`.

Papers are grouped by `year` (newest first). `selected = {true}` puts a paper under the **Selected**
tab, which is what visitors see first. Your name is bolded wherever it's wrapped in `\textbf{}`, or if it matches `CONFIG.self` at the top
of `assets/js/publications.js`.

`topic = {ssl, multimodal}` puts a paper under the theme filter buttons (`ssl` = Self-supervised learning,
`multimodal` = Sensors & language); the themes are listed in `CONFIG.topics`.

To link to a paper from elsewhere on the page, use `href="#p-BIBKEY"`. It switches to the **All** tab
and scrolls to the paper.

## Add news

In `index.html`, copy the first `<li>` in the News list and paste it at the top (newest first).
`data-type` sets the colour (`paper`, `award`, `career`, `event`) and `<use href="#i-...">` sets the
icon (`file`, `award`, `cap`, `briefcase`, `talk`). The News card is always as tall as the About text;
older items scroll inside it, so there's no need to move or delete old ones.

## Add a book (Interests page)

Books live on their own page, `interests.html`, drawn as spines on a bookshelf (no images needed).
Copy an `<li class="spine">` block and paste it at the left end of the shelf (most recent first):

- `title="..."` is the hover tooltip (full title, series, author)
- add `is-current` to the class for the book you're reading now (bookmark ribbon), and update the
  "Currently reading" line above the shelf

Colours, heights and widths vary automatically. On phones the books lie flat in a stack.

## Other edits

- **Job-market banner:** the `<aside class="callout">` block. Delete it after you accept an offer.
- **Footer date:** "Last updated" at the bottom of `index.html`.

## Deploy

GitHub Pages serves this repository's root directly:
Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: `main`, folder `/ (root)`.
After that, every push to `main` is live in about a minute.
