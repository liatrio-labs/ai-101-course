import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const source = readFileSync(new URL('../ai-101-course.html', import.meta.url), 'utf8');

test('does not render the per-act progress count on course slides', () => {
  assert.doesNotMatch(source, /\{\{ actProgress \}\}/);
});

test('uses title case for every learner-facing course title in the template', () => {
  assert.doesNotMatch(source, />How AI works(?:[.,<])/);
});

test('uses the selected split-index AI 101 lockup across course and help surfaces', () => {
  const badge = '<span class="course-series-badge"><span class="course-series-ai">AI</span> <span class="course-series-number">101</span></span>';
  assert.equal(source.split(badge).length - 1, 5, 'header, opening, completion, record, and help each show the same badge');
  for (const surface of ['course-brand-title', 'title-display', 'completion-heading__name', 'completion-record__title', 'help-course-title']) {
    const start = source.indexOf(`class="${surface} title-lockup"`);
    assert.ok(start >= 0, `${surface} contains the chosen title lockup`);
    assert.ok(source.slice(start, start + 420).includes(badge), `${surface} shows the split index`);
  }
  assert.ok(source.includes('<title>AI 101: How AI Works</title>'), 'browser title uses the full course name');
  assert.ok(source.includes('.course-series-number{'), 'the number half has its own visual treatment');
  assert.doesNotMatch(source, /data-title-variant|URLSearchParams\(location\.search\)/);
});

test('renders the right-aligned teaching detail with static layout without ellipsis truncation or temporary variant scaffolding', () => {
  assert.match(source, /class="course-progress-copy"[^>]*flex:1;max-width:500px;min-height:38px;[^>]*><span style="[^"]*">teaches:<\/span><span style="color:#F2F5F6;overflow-wrap:break-word;">\{\{\s*dteaches\s*\}\}<\/span><\/div>/);
  assert.doesNotMatch(source, /vibe-var-vibe_1790060618395_qb6lgitob/);
});

test('renders the section.slide visual treatment with monospace tabular digits, lime dot, and wrapping title without temporary variant scaffolding', () => {
  assert.match(source, /class="course-progress-title"[^>]*flex:1;max-width:500px;min-height:38px;[^>]*><span style="[^"]*ui-monospace[^"]*width:38px;flex:none;font-variant-numeric:tabular-nums;[^"]*">\{\{\s*dnum\s*\}\}\.\{\{\s*dstep\s*\}\}<\/span><span style="color:#89DF00;margin:0 8px;flex:none;">·<\/span><span style="color:#F2F5F6;font-weight:500;overflow-wrap:break-word;">\{\{\s*dtitle\s*\}\}<\/span><\/div>/);
  assert.doesNotMatch(source, /vibe-var-vibe_1790183537767_05uy4enj4/);
});

test('starts typing captions quickly with a third of a second delay', () => {
  assert.match(source, /this\.tOut = setTimeout\(\(\) => \{[\s\S]*?\}, 330\);/);
});

test('renders the finalized connected track top act navigation with nested section indicators and high-contrast labels without temporary variant scaffolding', () => {
  assert.match(source, /class="course-act-nav"[^>]*>[\s\S]*?<sc-for list="\{\{\s*acts\s*\}\}" as="a"[\s\S]*?<span[^>]*color:\{\{\s*a\.numColor\s*\}\};[^>]*>\{\{\s*a\.actNum\s*\}\}<\/span>[\s\S]*?<span[^>]*color:\{\{\s*a\.labelColor\s*\}\};[^>]*>\{\{\s*a\.label\s*\}\}<\/span>/);
  assert.doesNotMatch(source, /vibe-var-vibe_1790185615201_kw9jyfnkt/);
});

test('renders the course header position with title on the left and tabular count on the right in a static location', () => {
  assert.match(source, /class="course-position"[^>]*><span>\{\{\s*dtitle\s*\}\}<\/span><span[^>]*>·<\/span><span style="[^"]*tabular-nums;[^"]*ui-monospace[^"]*">\{\{\s*dnum\s*\}\}\s*\/\s*\{\{\s*dcount\s*\}\}<\/span><\/div>/);
});

test('uses the canonical Liatrio logomark as the same-origin favicon', () => {
  assert.match(source, /<link rel="icon" type="image\/png" href="logomark_Liatrio_background\.png">/);
  assert.equal(existsSync(new URL('../logomark_Liatrio_background.png', import.meta.url)), true);
});

test('preserves the completion record color theme in print preview', () => {
  const printStyles = source.match(/@media print\{([\s\S]*?)\n\}/)?.[1] || '';

  assert.match(printStyles, /print-color-adjust:exact!important/);
  assert.match(printStyles, /-webkit-print-color-adjust:exact!important/);
  assert.match(printStyles, /body\{background:#1A1F23!important;color:#F2F5F6!important;\}/);
  assert.match(printStyles, /\.completion-record\{[^}]*background:#1E2327!important;color:#F2F5F6!important;/);
});

test('prints the completion record as a landscape certificate with its on-page structure', () => {
  const printStyles = source.match(/@media print\{([\s\S]*?)\n\}/)?.[1] || '';

  assert.match(printStyles, /@page\{size:landscape;margin:0;\}/);
  assert.match(printStyles, /\.completion-record\{[^}]*inset:12mm;[^}]*padding:18mm 20mm;/);
  assert.match(printStyles, /\.completion-record__brand\{[^}]*display:flex!important;/);
  assert.match(printStyles, /\.completion-record__grid\{[^}]*grid-template-columns:1fr 1fr!important;/);
});

test('uses one explicit completion reset action and no redundant course-control restart', () => {
  assert.match(source, />Reset Progress &amp; Restart<\/button>/);
  assert.equal((source.match(/>Start again<\/button>/g) || []).length, 0);
});

test('returns from the completed view to the preceding final-course step when Back is pressed', () => {
  assert.match(source, /if \(isCompleted\) \{\s+if \(dir < 0\) this\.setState\(s => \(\{ step: Math\.max\(0, s\.step - 1\), finished: false \}\)\);/);
});

test('adds the approved Liatrio lockup and canonical links to the completion record', () => {
  assert.match(source, /class="completion-record__brand"/);
  assert.match(source, /src="logo_Liatrio_reverse-color\.png" alt="Liatrio"/);
  assert.match(source, /href="https:\/\/www\.liatrio\.ai\/"/);
  assert.match(source, /href="https:\/\/ai-101-course\.lab\.liatr\.io\/"/);
});

test('keeps the recap loop card border consistent and labels the course-site link explicitly', () => {
  assert.match(source, /border-top:2px solid #5C6870[^>]*>\s+<div[^>]*>The loop<\/div>/);
  assert.match(source, /href="https:\/\/ai-101-course\.lab\.liatr\.io\/"[^>]*>ai-101-course\.lab\.liatr\.io<\/a>/);
});

test('does not wrap keyboard Back from the first course slide to the final slide', () => {
  assert.match(source, /if \(step < 0\) \{\s+if \(s\.d === 0\) return \{ d: 0, step: 0 \};/);
});

test('dismisses the completion view when a top section heading selects another lesson', () => {
  assert.match(source, /if \(j >= 0\) this\.setState\(\{ d: j, step: 0, finished: false \}\);/);
});

test('places token reference facts in a top-aligned right-side list', () => {
  assert.match(source, /class="token-facts"[^>]*flex-direction:column;align-items:flex-start;gap:12px/);
  assert.match(source, /class="token-facts"[^>]*border-left:1px solid #2A3036;padding:16px 0 16px 20px/);
});

test('gives the token facts balanced vertical breathing room and lowers the token note', () => {
  assert.match(source, /class="token-facts"[^>]*padding:16px 0 16px 20px;[^>]*min-height:220px;[^>]*justify-content:space-between;/);
  assert.match(source, /margin-top:32px;display:flex;gap:12px;align-items:baseline;font-size:12.5px;[\s\S]{0,200}?not all text is equal/);
});

test('uses lime accents for tools, skills, and plugins', () => {
  assert.match(source, /Tool · tool call<\/div>/);
  assert.match(source, /color:#89DF00;">Skill<\/div>/);
  assert.match(source, /color:#89DF00;">Plugin · connector<\/div>/);
});

test('uses the chosen completion-heading treatment without variant scaffolding', () => {
  assert.ok(source.includes('class="completion-heading__name title-lockup"'), 'completion heading uses the chosen lockup');
  assert.doesNotMatch(source, /vibe_1790062612536_djijc6r80|vibe-var-vibe_1790062612536_djijc6r80/);
});

test('finalizes the selected context-overflow terminology without variant scaffolding', () => {
  assert.match(source, />1 · Drop<\/div>/);
  assert.doesNotMatch(source, /vibe-annotations:scaffold vibe_1790063496072_u6nh0d0gf|vibe-var-vibe_1790063496072_u6nh0d0gf/);
});

test('aligns the token facts with the top of their right-side column', () => {
  assert.match(source, /class="token-layout" style="display:grid;grid-template-columns:minmax\(0,1fr\) 300px;gap:36px;align-items:start;margin-top:30px;"/);
  assert.match(source, /class="token-facts"[^>]*border-left:1px solid #2A3036;padding:16px 0 16px 20px;[^>]*align-items:flex-start;gap:12px;/);
});

test('aligns the context-window key idea with its left-column heading', () => {
  assert.match(source, /class="context-layout" style="display:grid;grid-template-columns:520px minmax\(0,1fr\);gap:40px;align-items:start;margin-top:0;"/);
  assert.match(source, /class="context-key-idea" style="border-left:1px solid #2A3036;padding-left:32px;"/);
});

test('ignores keyboard navigation when typing into inputs or editable elements', () => {
  assert.match(source, /this\.onKey\s*=\s*\(e\)\s*=>\s*\{[\s\S]*?(?:tagName\s*===\s*["']INPUT["']|matches\(["'].*?input.*__["']\))/);
});

test('synchronizes Lesson 13 tool call captions with the date/time tool diagram', () => {
  assert.match(source, /"You ask something the model can't possibly know, like today's date\."/);
  assert.match(source, /"Rather than guess, the model sends back a request: 'run get_current_time\(\) for me'\."/);
  assert.doesNotMatch(source, /today's weather/);
  assert.doesNotMatch(source, /get_weather/);
});

test('checks d === 3 for resend outline highlighting in renderVals', () => {
  assert.match(source, /v\.resendC\s*=\s*\(d\s*===\s*3\s*&&\s*st\s*>=\s*4\)\s*\?\s*acc\s*:\s*["']transparent["']/);
});

test('checks d === 8 for flow1 pulse in renderVals', () => {
  assert.match(source, /v\.flow1\s*=\s*d\s*===\s*8\s*&&\s*st\s*===\s*1;/);
});

test('sends context to model on turn 2 step 5 of the loop wire animation', () => {
  assert.match(source, /v\.loopWire\s*=\s*\(st\s*===\s*1\s*\|\|\s*st\s*===\s*3\s*\|\|\s*st\s*===\s*5\)\s*\?\s*acc\s*:\s*\(st\s*===\s*4\s*\?\s*acc\s*:\s*["']#2A3036["']\);/);
  assert.match(source, /v\.loopArrow\s*=\s*\(st\s*===\s*1\s*\|\|\s*st\s*===\s*3\s*\|\|\s*st\s*===\s*5\)\s*\?\s*["']this example sends context →["']\s*:\s*\(st\s*===\s*4\s*\?\s*["']← the reply comes back["']\s*:\s*["']["']\);/);
  assert.match(source, /v\.loopJustify\s*=\s*\(st\s*===\s*1\s*\|\|\s*st\s*===\s*3\s*\|\|\s*st\s*===\s*5\)\s*\?\s*["']flex-end["']\s*:\s*["']flex-start["'];/);
});

test('does not include a 5th phantom message in Lesson 04 turn 2 sent context', () => {
  assert.doesNotMatch(source, /assistant: swap the…/);
  assert.match(source, /const\s+sentMsgs\s*=\s*\[\s*\{ label: "system prompt"[^\]]+you: make it vegetarian\?[^\]]+\];/);
  assert.match(source, /const\s+shown\s*=\s*Math\.min\(st\s*\+\s*1,\s*4\);/);
});

test('avoids duplicated calculator takeaways in RECAP[11]', () => {
  assert.match(source, /11:\s*\[\s*"A correct answer does not prove reliable arithmetic",\s*"Large calculations can produce plausible digits",\s*"Pattern matching cannot replace multi-step calculation",\s*"A calculator tool computes the exact result"\s*\]/);
  assert.doesNotMatch(source, /"Use a calculator to verify exact work",\s*"A calculator tool provides the exact result"/);
});

test('references Claude.ai as a harness in Slide 12.03', () => {
  assert.match(source, /ChatGPT, Claude\.ai, Copilot and Codex/);
});

test('uses DOCUMENT RETRIEVAL heading in Slide 17.01', () => {
  assert.match(source, /<div style="font-size:10\.5px;letter-spacing:\.1em;text-transform:uppercase;color:#8B959D;">DOCUMENT RETRIEVAL: SEARCHING LARGE FILES INSTEAD OF SENDING EVERYTHING<\/div>/);
  assert.doesNotMatch(source, /the point: Large file sets are often searched instead of sent all at once/);
});

test('accurately describes runtime levers beyond prompting in Slide 21.05 footer', () => {
  assert.match(source, /Prompting and skills provide direct text guidance; model selection, tools, approvals, and budgets configure the runtime around it\./);
  assert.doesNotMatch(source, /Two of the three are just text you put in the window; and that's where nearly all of your leverage sits\./);
});

test('mentions harness context dropping in Slide 06.04 caption', () => {
  assert.match(source, /"Past the limit the oldest fall out in this harness: still on your machine, no longer sent\."/);
});

test('frames glossary and machinery previews clearly in Slides 02.01 and 03.01', () => {
  assert.match(source, /"A quick glossary preview of the words you'll hear most: LLM and prompt \(the generator, and what you send it\)\."/);
  assert.match(source, /"A preview of the machinery: the harness is the app around the model; a tool call is it asking that app to do something\."/);
});

test('does not contain invalid 9-digit hex colors', () => {
  assert.doesNotMatch(source, /#F2F5F6fff/);
});

test('gives the completion canvas enough room for the split title and actions', () => {
  assert.match(source, /(?:\[data-finale="1"\]|\.course-canvas):has\(\[data-course-finished\]\)\s*\{\s*height:\s*700px!important;/);
});

test('scales course shell zoom to 1 on desktop viewports with height under 900px', () => {
  assert.match(source, /@media\s*\(\s*min-width:\s*768px\s*\)\s*and\s*\(\s*max-height:\s*899px\s*\)\s*\{\s*\.course-shell\s*\{\s*zoom:\s*1\s*!important;\s*\}\s*\}/);
});

test('throttles persistProgress in componentDidUpdate using persistKey change tracking', () => {
  assert.match(source, /const\s+persistKey\s*=\s*`\$\{key\}:\$\{this\.state\.finished\}:\$\{this\.state\.completion\?\.id\}:\$\{this\.state\.learnerName\}`;/);
  assert.match(source, /if\s*\(persistKey\s*!==\s*this\._persistKey\)\s*\{\s*this\._persistKey\s*=\s*persistKey;\s*this\.persistProgress\(\);\s*\}/);
});

test('setAuto clears timer when finished and dynamically scales delay from caption length', () => {
  assert.match(source, /if\s*\(this\.state\.finished\s*\|\|\s*!want\)\s*\{\s*if\s*\(this\.timer\)\s*\{\s*clearInterval\(this\.timer\);\s*this\.timer\s*=\s*null;\s*\}\s*return;\s*\}/);
  assert.match(source, /const\s+delay\s*=\s*Math\.max\(3000,\s*1000\s*\+\s*\(text\.length\s*\*\s*34\)\s*\+\s*1500\);/);
  assert.match(source, /const\s+timerKey\s*=\s*`\$\{this\.state\.d\}:\$\{this\.state\.step\}:\$\{delay\}`;/);
  assert.match(source, /if\s*\(!this\.timer\s*\|\|\s*this\._timerKey\s*!==\s*timerKey\)\s*\{\s*if\s*\(this\.timer\)\s*clearInterval\(this\.timer\);\s*this\._timerKey\s*=\s*timerKey;\s*this\.timer\s*=\s*setInterval\(\(\)\s*=>\s*this\.go\(1\),\s*delay\);\s*\}/);
});

test('renderVals uses this.state.finished directly rather than forcing finished via isTerminalPosition', () => {
  assert.match(source, /renderVals\(\)\s*\{[\s\S]*?const\s+finished\s*=\s*this\.state\.finished;/);
  assert.doesNotMatch(source, /renderVals\(\)\s*\{[\s\S]*?const\s+finished\s*=\s*this\.state\.finished\s*\|\|\s*\(!!this\.state\.completion/);
});

test('does not render a redundant Next button inside the slide outro content', () => {
  const outroBlock = source.match(/<sc-if value="\{\{\s*outro\s*\}\}"[\s\S]*?<\/sc-if>/)?.[0] || '';
  assert.equal(outroBlock.length > 0, true);
  assert.doesNotMatch(outroBlock, /<button onClick="\{\{\s*next\s*\}\}"/);
});

test('renders a help trigger button in the bottom-right corner of course controls across from Back and Next', () => {
  assert.match(source, /class="course-controls"[\s\S]*?class="course-help-trigger"[^>]*onClick="\{\{\s*(?:toggleHelp|openHelp)\s*\}\}"/);
  assert.match(source, /aria-label="Help and course guide"/);
});

test('renders a Help and Getting Started modal with title How to Use the Course, Liatrio purpose, and shortcuts', () => {
  assert.match(source, />How to Use the Course<\/div>/);
  assert.match(source, /This course is Liatrio’s introduction to how to think about AI and understand the basic concepts of how the technology works\./);
  assert.match(source, /Course Structure &amp; Navigation/);
  assert.match(source, /onClick="\{\{\s*resetFromHelp\s*\}\}"[^>]*>Reset Progress<\/button>/);
});

test('manages help modal lifecycle with first-time display, Escape dismissal, and persistence key', () => {
  assert.match(source, /HELP_KEY\s*=\s*["']howAIWorks\.helpSeen\.v1["']/);
  assert.match(source, /if\s*\(e\.key\s*===\s*["']Escape["']\s*&&\s*this\.state\.showHelp\)\s*\{?\s*this\.closeHelp\(\)/);
  assert.match(source, /if\s*\(this\.state\.showHelp\)\s*return;/);
});

test('renders Liatrio logomark and GitHub suggestion link in help modal', () => {
  assert.match(source, /class="course-modal"[\s\S]*?<img src="logomark_Liatrio_background\.png" alt="Liatrio"/);
  assert.match(source, /href="https:\/\/github\.com\/liatrio\/ai-101-course"[^>]*>Go to our repo<\/a>/);
  assert.match(source, /Have a suggestion or found a bug\?/);
});

test('explains slide referencing convention and structural terms in help modal', () => {
  assert.match(source, /section\.slide/);
  assert.match(source, />05\.02</);
  assert.match(source, /<li>messages<\/li>/);
  assert.match(source, /<li>autonomous agents<\/li>/);
});

test('finalizes the chosen modal intro variant without variant scaffolding', () => {
  assert.match(source, /Whether you write code, design workflows, or manage delivery, this guide provides a grounded mental model of generative models, tools, and agent loops\./);
  assert.match(source, /The course demystifies the mechanics behind prompts and responses without technical jargon, breaking down the technology into five core areas:/);
  assert.doesNotMatch(source, /vibe-annotations:scaffold vibe_1790180026441_b1t90s3rh|vibe-var-vibe_1790180026441_b1t90s3rh/);
});
