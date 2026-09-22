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

test('renders the chosen right-aligned teaching detail without a left divider or temporary variant scaffolding', () => {
  assert.match(source, /class="course-progress-copy" style="font-size:11px;color:#AEB8BF;margin-left:auto;text-align:right;white-space:nowrap;">teaches:/);
  assert.doesNotMatch(source, /vibe-var-vibe_1790060618395_qb6lgitob/);
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
  assert.match(source, /Completed: <span style="color:#89DF00;">How AI Works<\/span>\./);
  assert.doesNotMatch(source, /vibe_1790062612536_djijc6r80|vibe-var-vibe_1790062612536_djijc6r80/);
});

test('finalizes the selected context-overflow terminology without variant scaffolding', () => {
  assert.match(source, />1 · Drop<\/div>/);
  assert.doesNotMatch(source, /vibe-annotations:scaffold vibe_1790063496072_u6nh0d0gf|vibe-var-vibe_1790063496072_u6nh0d0gf|vibe-variant|data-vibe-active|data-variant/);
});

test('aligns the token facts with the top of their right-side column', () => {
  assert.match(source, /class="token-layout" style="display:grid;grid-template-columns:minmax\(0,1fr\) 300px;gap:36px;align-items:start;margin-top:30px;"/);
  assert.match(source, /class="token-facts"[^>]*border-left:1px solid #2A3036;padding:16px 0 16px 20px;[^>]*align-items:flex-start;gap:12px;/);
});

test('aligns the context-window key idea with its left-column heading', () => {
  assert.match(source, /class="context-layout" style="display:grid;grid-template-columns:520px minmax\(0,1fr\);gap:40px;align-items:start;margin-top:0;"/);
  assert.match(source, /class="context-key-idea" style="border-left:1px solid #2A3036;padding-left:32px;"/);
});
