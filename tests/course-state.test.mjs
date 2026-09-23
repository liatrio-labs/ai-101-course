import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CourseState } from '../course-state.js';

const course = { lessonCount: 22, stepCounts: Array(22).fill(5) };
const unevenCourse = { lessonCount: 3, stepCounts: [2, 4, 1] };

test('attaches the same helper API to the browser window', () => {
  const browserWindow = {};
  const source = readFileSync(new URL('../course-state.js', import.meta.url), 'utf8');

  new Function('window', source)(browserWindow);

  assert.equal(browserWindow.HowAiWorksCourseState.STORAGE_KEY, CourseState.STORAGE_KEY);
  assert.equal(typeof browserWindow.HowAiWorksCourseState.restore, 'function');
});

test('exposes a versioned storage key and fresh default state', () => {
  assert.equal(CourseState.STORAGE_KEY, 'howAIWorks.courseState.v1');
  assert.deepEqual(CourseState.defaultState(), {
    version: 1,
    position: { lesson: 0, step: 0 },
    completion: null,
    learnerName: ''
  });
});

test('restores a valid persisted position from localStorage-shaped data', () => {
  const result = CourseState.restore(
    '{"version":1,"position":{"lesson":3,"step":2}}',
    course
  );

  assert.deepEqual(result.position, { lesson: 3, step: 2 });
  assert.equal(result.completion, null);
  assert.equal(result.learnerName, '');
});

test('restores a valid persisted position using the exact step count of its lesson', () => {
  const result = CourseState.restore(
    '{"version":1,"position":{"lesson":1,"step":3}}',
    unevenCourse
  );

  assert.deepEqual(result.position, { lesson: 1, step: 3 });
  assert.deepEqual(
    CourseState.restore('{"version":1,"position":{"lesson":2,"step":1}}', unevenCourse),
    CourseState.defaultState()
  );
});

test('rejects malformed, stale, and out-of-range saved data safely', () => {
  for (const raw of [
    '{not json}',
    '{"version":2,"position":{"lesson":3,"step":2}}',
    '{"version":1,"position":{"lesson":22,"step":0}}',
    '{"version":1,"position":{"lesson":0,"step":5}}'
  ]) {
    assert.deepEqual(CourseState.restore(raw, course), CourseState.defaultState());
  }
});

test('preserves valid completion metadata and a display name when restoring', () => {
  const raw = JSON.stringify({
    version: 1,
    position: { lesson: 3, step: 2 },
    completion: { id: 'completion-id', completedAt: '2026-09-21T12:00:00.000Z' },
    learnerName: 'Ada Lovelace'
  });

  assert.deepEqual(CourseState.restore(raw, course), {
    ...JSON.parse(raw),
    learnerName: 'Ada Lovelace'
  });
});

test('serializes only validated course state without altering a learner name in progress', () => {
  const serialized = CourseState.serialize({
    version: 1,
    position: { lesson: 3, step: 2 },
    completion: null,
    learnerName: '  Ada Lovelace  ',
    ignored: true
  }, course);

  assert.deepEqual(JSON.parse(serialized), {
    version: 1,
    position: { lesson: 3, step: 2 },
    completion: null,
    learnerName: '  Ada Lovelace  '
  });
});

test('serializes the normalized course state for regular renderer navigation', () => {
  const state = CourseState.fromPosition({ lesson: 1, step: 3 }, unevenCourse);

  assert.deepEqual(JSON.parse(CourseState.serialize(state, unevenCourse)), {
    version: 1,
    position: { lesson: 1, step: 3 },
    completion: null,
    learnerName: ''
  });
});

test('adopts a valid legacy renderer position into versioned course state', () => {
  assert.deepEqual(
    CourseState.fromPosition({ lesson: 2, step: 0 }, unevenCourse),
    {
      version: 1,
      position: { lesson: 2, step: 0 },
      completion: null,
      learnerName: ''
    }
  );
});

test('creates one stable personal completion record without claiming verification', () => {
  const first = CourseState.complete(CourseState.defaultState(), {
    uuidFactory: () => 'test-completion-id',
    clock: () => new Date('2026-09-21T12:00:00.000Z')
  });
  const second = CourseState.complete(first, {
    uuidFactory: () => 'different-id',
    clock: () => new Date('2026-09-22T12:00:00.000Z')
  });

  assert.deepEqual(first.completion, {
    id: 'test-completion-id',
    completedAt: '2026-09-21T12:00:00.000Z'
  });
  assert.deepEqual(second.completion, first.completion);
  assert.equal(Object.hasOwn(first.completion, 'verified'), false);
});

test('persists a learner name verbatim alongside a stable completion record', () => {
  const completed = CourseState.complete(CourseState.defaultState(), {
    uuidFactory: () => 'stable-completion-id',
    clock: () => new Date('2026-09-21T12:00:00.000Z')
  });
  const named = CourseState.withLearnerName(completed, '  Ada Lovelace  ', course);
  const restored = CourseState.restore(CourseState.serialize(named, course), course);

  assert.equal(restored.learnerName, '  Ada Lovelace  ');
  assert.deepEqual(restored.completion, {
    id: 'stable-completion-id',
    completedAt: '2026-09-21T12:00:00.000Z'
  });
});

test('preserves learner-name whitespace while a learner is still typing', () => {
  const named = CourseState.withLearnerName(CourseState.defaultState(), 'Jane ', course);

  assert.equal(named.learnerName, 'Jane ');
  assert.equal(CourseState.restore(CourseState.serialize(named, course), course).learnerName, 'Jane ');
});

test('builds a personal completion record with a neutral learner fallback and stable metadata', () => {
  const completed = CourseState.complete(CourseState.defaultState(), {
    uuidFactory: () => 'stable-completion-id',
    clock: () => new Date('2026-09-21T12:00:00.000Z')
  });

  assert.deepEqual(CourseState.completionRecord(completed), {
    courseTitle: 'AI 101: How AI Works',
    learnerName: 'Course learner',
    completionId: 'stable-completion-id',
    completedAt: '2026-09-21T12:00:00.000Z'
  });
});

test('recognizes advancing beyond the final lesson outro as the terminal transition', () => {
  const finalPosition = { lesson: unevenCourse.lessonCount - 1, step: unevenCourse.stepCounts.at(-1) - 1 };

  assert.equal(CourseState.isTerminalPosition(finalPosition, unevenCourse), true);
  assert.equal(CourseState.isTerminalPosition({ lesson: 1, step: 3 }, unevenCourse), false);
});

test('preserves one completion record through backward navigation and a storage round trip', () => {
  const completed = CourseState.complete(
    CourseState.fromPosition({ lesson: 2, step: 0 }, unevenCourse),
    {
      uuidFactory: () => 'stable-completion-id',
      clock: () => new Date('2026-09-21T12:00:00.000Z')
    }
  );
  const movedBack = CourseState.withPosition(completed, { lesson: 1, step: 3 }, unevenCourse);
  const reloaded = CourseState.restore(CourseState.serialize(movedBack, unevenCourse), unevenCourse);

  assert.deepEqual(reloaded.position, { lesson: 1, step: 3 });
  assert.deepEqual(reloaded.completion, {
    id: 'stable-completion-id',
    completedAt: '2026-09-21T12:00:00.000Z'
  });
});

test('reset clears course position, name, and completion record', () => {
  assert.deepEqual(CourseState.reset({
    version: 1,
    position: { lesson: 3, step: 2 },
    completion: { id: 'completion-id', completedAt: '2026-09-21T12:00:00.000Z' },
    learnerName: 'Ada Lovelace'
  }), CourseState.defaultState());
});

test('generates a valid completion UUID even when crypto.randomUUID is unavailable', () => {
  assert.match(CourseState.complete(CourseState.defaultState()).completion.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

  const source = readFileSync(new URL('../course-state.js', import.meta.url), 'utf8');
  const isolated = {};
  new Function('window', source)(isolated);
  const state = isolated.HowAiWorksCourseState.complete(isolated.HowAiWorksCourseState.defaultState());
  assert.match(state.completion.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
});
