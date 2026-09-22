# Liatrio Design System

> **Build • Strategy • Enablement**
> AI-first enterprise enablement and technology transformation consultancy.

This system is the canonical reference for everything Liatrio: the marketing site, decks, internal tools, and any AI-assisted artefact made under the brand. It is **dark-first**, **high-contrast**, and **technical-but-organic** — pairing precise UI surfaces with botanical illustration and circuit-trace texture.

Three pillars structure everything we make:

- **Build** — engineering execution
- **Strategy** — direction-setting and architecture
- **Enablement** — teaching teams to ship without us

The pillars are visualised as a recurring **three-circle Venn diagram** that you'll see across the site, decks, and product surfaces. The intersections matter — they describe the work we actually do.

---

## Sources

This system is anchored to **Liatrio Brand Guidelines v2026-04-14** (the official brand guideline document). Specific sources used in this build:

- **Brand guideline document** — full HEX/RGB/CMYK palette, typography rules, logo variants, and usage principles. Pasted into the build conversation; not stored verbatim in this repo.
- **Fonts** — `SpaceGrotesk-VariableFont_wght.ttf` (uploaded by the brand team, copied to `fonts/`).
- **Logos** — full set in `assets/`: `logo_Liatrio_full-color.png` (light bg, primary), `logo_Liatrio_reverse-color.png` (dark bg, primary), `logo_Liatrio_stacked.png` and `logo_Liatrio_stacked_reverse-preferred.png` (secondary, square placements), plus `logomark_Liatrio.png` (flame icon). **liatrio.ai sub-brand:** `logo_Liatrio-ai_full-color.svg` (light bg) and `logo_Liatrio-ai_reverse.svg` (dark bg) — use only in liatrio.ai product / AI-offering contexts; the core `liatrio` lockup stays the company mark.
- **Imagery** — `liatrio-bg01.png` (lime field), `liatrio-bg08.png` (violet/lime cloud), `liatris-violet.png` (Liatris — saturated violet, fuller silhouette with basal leaves — **the only single-stem botanical**), `liatris-double-flower.png` (paired violet stems — **secondary, sparse use only**), `venn-diagram.png` (three-pillar diagram).

> ⚠️ **No production codebase or Figma was attached.** The slides in `slides/` are an **interpretation** of the brand guideline, not a port of production code. When the production source is available, re-run with that source so the deck templates can be tightened to pixel-fidelity.

---

## CONTENT FUNDAMENTALS

**Voice — confident, technical, low-fluff.** Liatrio talks like a senior engineer who's also good at strategy. Direct sentences. Verbs first. No buzzword soup. We sound like a product company that happens to sell services, not a consulting firm that happens to use Figma.

**Tone shifts by surface:**

- *Marketing pages* — assertive, slightly editorial. Headlines are short and declarative.
- *Case studies* — specific, numerical. Outcomes over adjectives.
- *Internal/enablement* — conversational, plural-first ("we", "your team"), instructional without being patronising.

**Person.** Default to **"we"** for Liatrio and **"your team"** or **"you"** for the reader. Avoid "I" — even in case studies, the work is collective. Avoid "the client" in writing meant for clients.

**Casing.** **Sentence case** everywhere — headlines, buttons, nav, eyebrows. Title Case is reserved for proper product names. ALL-CAPS only for very small **eyebrow labels** (≤14px) tracked at +0.14em.

**Punctuation.**
- Em dashes — used freely for rhythm and aside.
- Periods on standalone headlines: optional. Use them when the line is a full statement; drop them when it's a fragment.
- No exclamation marks. Ever.
- Oxford commas yes.
- Numerals for all numbers ≥ 2 ("2 engineers", not "two engineers"). Spell out "one".

**Vocabulary cues.**

| Prefer | Avoid |
| --- | --- |
| Ship, build, scale | Leverage, synergize |
| Engineering team | Resources |
| Enablement | Upskilling (overused) |
| Pilot, rollout | Implementation (vague) |
| AI-first | AI-powered (everywhere) |
| Teach your team | Train your people |

**Emoji.** Not in marketing copy or product UI. Acceptable in internal Slack/blog asides. Never as a substitute for an icon.

**Headline patterns** (specimens to study):

- *"Build what's next. Teach your team to keep building."*
- *"Strategy without shipping is just a deck."*
- *"AI-first delivery, by an engineering team that ships."*
- *"Three pillars. One outcome: your team, faster."*

The structure is usually `<short claim>. <pivot or expansion>.` — two beats, second beat earns the first.

**CTAs** are verb-led and specific:

- "Start a pilot" (not "Get started")
- "See how we work" (not "Learn more")
- "Talk to an engineer" (not "Contact us")

---

## VISUAL FOUNDATIONS

### Mood

Dark-first. **The default canvas is `#1A1F23` (Dark Mode Primary)**, with `#1E2327` (Dark Mode Secondary) for cards and elevated surfaces. Both are slightly cool-tinted greys, not flat black — they sit a step warmer than pure neutral and play well with the green logo. Light surfaces (`#FFFFFF` / `#F8F9FA`) exist for editorial breaks, product screenshots and printable assets, but the brand's *home* is dark.

### Colour

The full palette lives in `colors_and_type.css`. From the brand guideline:

**Primary**
- **`#111111` Grey 800** — primary text and dark elements.
- **`#FFFFFF` White** — backgrounds and light elements.
- **`#24AE1D` Primary Green** — **the brand primary**. Hero color. Use prominently in key brand moments — logo gradient anchor, primary CTAs, focus rings.
- **`#89DF00` Bright Green** — **accent and highlights**. Use sparingly; never as the dominant fill on a surface.

**Secondary**
- **`#1E1E1E` Grey 700** — dark backgrounds (warm-neutral alt to DM primary).
- **`#EEEEEE` Grey 100** — light backgrounds.
- **`#00C1DB` Lagoon** — accent blue. Info states, secondary data.
- **`#C6F135` Lime** — vibrant accent green. Distinct from the brand greens — used for the Venn diagram's third circle, charts, and on light surfaces.
- **`#C068F9` Violet** — accent purple. The editorial counterpoint. One per surface, max.

**Tertiary** — `#000000` Black, the full Grey scale `#333 / #666 / #999 / #CCC / #DDD`, **`#003D5C` Dark Blue**, **`#006989` Deep Sea**, **`#E63946` Hot Red** (alert / emphasis), **`#F77F00` Flame Orange** (energy / warmth / warning states).

**Background tokens (for theming):**
- Light: `#FFFFFF` primary, `#F8F9FA` secondary (cards/sections).
- Dark: `#1A1F23` primary, `#1E2327` secondary (cards/sections).

**Rules of thumb**

- **One accent per surface.** A page can be Bright Green *or* Violet — picking both makes it look like a portfolio site.
- **Primary Green is the hero.** Reserve it for the moments that matter — logo, primary CTA, focus state.
- **Bright Green is the highlight.** Use it for inline emphasis, links, single highlighted words, glow rings — not as a dominant fill.
- **Lagoon is for information**, **Hot Red for alerts**, **Flame Orange for warnings**. Don't pull tertiary colors into "decoration" — they each have a job.
- **Five levels of foreground** (`fg`, `fg-muted`, `fg-subtle`, `fg-faint`, `border`) instead of opacity stacks.

### Typography

**Space Grotesk is the only typeface.** It runs the full weight range and handles every job — display, headlines, body, UI labels, table cells. Hierarchy comes from **size and weight**, not from mixing families.

- **Light (300)** — large editorial body or quotes.
- **Regular (400)** — paragraph copy and most UI text.
- **Medium (500)** — buttons, eyebrows, table headers, active nav.
- **SemiBold (600)** — H2 / H3 / display.
- **Bold (700)** — H1 only, sparingly.

**Type scale** (from the guideline):
- H1 — 48–60px (we set `--fs-h1: 56px`, `--fs-display: 60px` for hero)
- H2 — 36–40px (`--fs-h2: 40px`)
- H3 — 28–32px (`--fs-h3: 32px`)
- H4 — 22px
- Body — 16–18px (`--fs-body: 17px`)
- Small — 14, Micro — 12, Eyebrow — 13 with +0.14em tracking

Tightly tracked (`-0.02em`) at large sizes; default tracking for body. Use `text-wrap: pretty` on display headlines.

> Mono is a system stack (`ui-monospace`, `JetBrains Mono`, `SF Mono` …) reserved for code blocks, technical labels (`v2.0`, `claude-haiku-4-5`), and the Brand Guidelines hex codes themselves.

### Spacing

4px base. The named scale (`--s-1` … `--s-10`) maps to: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Component padding clusters at 16/24/32; section padding at 64/96/128. Avoid "freehand" pixel values — pick a step.

### Backgrounds & layering

The signature compositional move is **layering**:

1. Solid `#1A1F23` (or `#111`) base.
2. **Foliage / blazing star flower** image laid on top — the organic counterpoint.

The result is *organic-meets-technical*. We rarely use full-bleed photography — when we do, it's botanical (Liatris flower close-ups) and treated with a dark gradient overlay so type stays legible.

Coloured "cloud" gradient backgrounds (`liatrio-bg01.png`, `liatrio-bg08.png`) appear on **light editorial breaks**: a pricing page, a careers page, a case-study cover. They do not appear on the dark product surface.

### Animation

- Default easing: `cubic-bezier(0.22, 1, 0.36, 1)` (out-expo-ish). Used for everything that moves into place.
- Durations: 120ms (micro / hover), 200ms (UI state), 320ms (panel/modal), 600ms (page-level).
- **No bounces**. The brand is precise; springy overshoots feel wrong.
- Fades come from below (8–16px translate-Y) — never from the side.
- The **flame logomark** is the one place we get expressive: it can flicker, rotate, morph, or render in 3D as a hero moment.

### Hover & press

- **Hover** — bright green elements get a `+1px outline` glow (`var(--glow-accent)`) and shift `y: -1px`. Dark surfaces lighten by ~6%. Text links flip from green to white with the underline still green.
- **Press** — `scale(0.98)` and lose the glow. No colour shift on press.
- **Focus** — 2px outline in `--bright-green`, offset 2px. Never use the browser default.

### Borders, shadows, elevation

- **Hairlines first** — `1px solid #2A3036` (cool dark) or `#2A2A2A` (warm dark) separates regions. We use borders before shadows on dark.
- Shadows are reserved for **floating** UI (menus, toasts, modals) — `--shadow-md` and `--shadow-lg`. Never on cards inline in a list.
- **Glow** (`--glow-accent`) replaces shadow when a thing is brand-active: a primary button, the focused composer, a selected pillar.

### Capsules & protection gradients

- **Capsules** (`border-radius: 999px`) wrap CTAs, eyebrows, and pill labels. The CTA capsule is our most recognisable component shape.
- **Protection gradients** appear over imagery — `linear-gradient(180deg, transparent, #1A1F23 90%)` at the bottom of botanical photos so headlines stay readable.

### Layout

- 12-column grid, 80px gutter on desktop, 24px on mobile.
- Max content width 1280px. Editorial pages narrow to 720px for a single-column read.
- Fixed top nav (translucent `rgba(26,31,35,0.72)`, 12px backdrop-blur). No sidebar on marketing surfaces.

### Imagery treatment

- **Cool, slightly desaturated, never warm.** No skin-tone photography. No grain.
- Botanical photography is the brand's signature image style: Liatris flower, foliage, on a clean black or violet background.
- 3D renders of the flame are encouraged — chrome, glass, and matte-green finishes all permitted.

### Corner radii

- **`--r-1` 4px** — inputs, code chips.
- **`--r-2` 8px** — small buttons, tags.
- **`--r-3` 12px** — cards.
- **`--r-4` 16px** — large surfaces, modals.
- **`--r-5` 24px** — hero panels.
- **`--r-pill` 999px** — primary CTAs, eyebrow chips.

### Cards

Default card on dark:

```
background: #1E2327;
border: 1px solid #2A3036;
border-radius: 12px;
padding: 24px;
```

No drop shadow. On hover, the border brightens to `#3A4046` and a subtle inner top-line of `rgba(36,174,29,0.2)` appears. Cards are **flat** — depth comes from background colour and borders, not shadow.

### Accessibility

- **4.5 : 1** minimum contrast for normal text, **3 : 1** for large text.
- Never use colour alone to convey information — pair with icon, label, or position.
- Provide alt text for all images and logos.
- The Primary Green (`#24AE1D`) on white passes large-text only — for body, use Grey 800.

---

## LOGOS

The brand ships **eight** approved logo files. Use the right variant for the surface — never recolour, rotate, distort, or place the logomark on a green background.

| Variant | When | Asset |
| --- | --- | --- |
| **Horizontal · full-color** | **Light backgrounds — primary** | `logo_Liatrio_full-color.png` ✅ in `assets/` |
| **Horizontal · reverse-color** | **Dark backgrounds — primary** | `logo_Liatrio_reverse-color.png` ✅ in `assets/` |
| Stacked · full-color | Square placements on light bg — secondary only | `logo_Liatrio_stacked.png` ✅ in `assets/` |
| Stacked · reverse | Square placements on dark bg — secondary only | `logo_Liatrio_stacked_reverse-preferred.png` ✅ in `assets/` |
| Flame logomark | Favicon, app icon, deck corner — never on a green surface | `logomark_Liatrio.png` ✅ in `assets/` |

**Primary vs secondary.** The **horizontal lockup** is the canonical mark. Use the **stacked** variant only for square or near-square placements (avatars, app icons, footer corners) — never as the primary header lockup.

**Clear space.** Maintain clear space around any logo equal to the **height of the "L" in liatrio**.

**Don'ts.** Don't distort, don't rotate, don't recolour. Don't place the standard logomark on a green background — use the square or reverse variant instead.

---

## ICONOGRAPHY

Liatrio does **not** ship a custom icon font. The brand approach is:

- **Lucide Icons** as the default icon set, loaded from CDN. Stroke-based, 1.75px stroke, 24×24 grid. Lucide's clean technical line matches the brand's "developer tool" aesthetic better than Heroicons or Phosphor.
- **The flame logomark** is treated as the brand "icon" — used in the favicon, the product loader, and the corner of every deck. `assets/logomark_Liatrio.png`.
- **The Venn diagram** (`assets/venn-diagram.png`) is a recurring "infographic icon" — three circles for the three pillars. We use it as a section-break device, not a tiny icon.
- **Botanical illustrations** (`assets/liatris-violet.png`) are used at large size only — they are not icons and should never be smaller than ~120px wide. The earlier mixed-tone `liatris-digital.png` is **retired and deleted** — never reintroduce it; the violet variant is the only approved single stem.
- **Double liatris** (`assets/liatris-double-flower.png`) is a **secondary** botanical: use sparsely, only when a layout specifically calls for a paired stem. Same size floor as above; the single liatris stays the default.

**Radial background glows** — never. No soft radial-gradient halos behind titles or in slide corners. Backgrounds are flat `#1A1F23` / `#111`, a real botanical or cloud image, or nothing.
**Emoji** — no, never in production UI or marketing.
**Unicode glyphs** — sparingly. `→` for inline CTAs is fine. Avoid `★` or other decorative glyphs.

> 🚧 **Substitution flag.** Lucide is a substitution — the official brand guideline does not name an icon set. If Liatrio uses a different system in production, swap `cdn.jsdelivr.net/npm/lucide@latest` for the real source and re-export.

---

## File index

```
.
├── README.md                        ← you are here
├── SKILL.md                         ← Agent-Skill manifest
├── colors_and_type.css              ← all CSS variables + base type styles
├── fonts/                           ← Space Grotesk variable TTF
├── assets/                          ← logo variants, backgrounds, botanical, venn diagram, deck template (.pptx)
├── preview/                         ← design-system review cards (one per token cluster)
```

### What's where

- **Foundation** — `colors_and_type.css` is the single source of truth for colour and type. All other files import it.
- **Tokens & cards** — `preview/*.html` each render one token cluster (one card per concept). They power the Design System review tab.
- **Slide deck** — `assets/Liatrio-Deck-Template.pptx` is the canonical deck template (60 slides, dark and light modes). Edit it in PowerPoint, Keynote, or Google Slides — it is the source of truth, not an HTML interpretation.

---

## Caveats / open questions for the brand team

1. **No codebase or Figma was provided.** Tokens and preview cards are an interpretation of the brand guideline.
2. **Icon set is unconfirmed** — defaulted to Lucide. Confirm or replace.
3. **Logo set is complete — horizontal (full-color + reverse) is primary, stacked is secondary.** If a different lockup is needed (mono black, single-color reverse-white, etc.) request from the brand team.
4. **`3d Liatrio Love.png`** was named in the original brief but missing from the upload set. If it's a 3D flame render, please upload — it's a high-impact asset for hero surfaces.
5. **Photography** — only one botanical image was provided. We need 3–5 hero-grade Liatris photos and ideally a few flame renders to populate full-bleed surfaces.
