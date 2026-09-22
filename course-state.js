(function (root) {
  const VERSION = 1;
  const STORAGE_KEY = 'howAIWorks.courseState.v1';

  function defaultState() {
    return {
      version: VERSION,
      position: { lesson: 0, step: 0 },
      completion: null,
      learnerName: ''
    };
  }

  function stepLimit(lesson, course) {
    if (!course || !Number.isInteger(course.lessonCount) || course.lessonCount < 1) return null;
    const counts = Array.isArray(course.stepCounts) ? course.stepCounts : [];
    const count = counts[lesson] ?? counts[0];
    return Number.isInteger(count) && count > 0 ? count : null;
  }

  function hasValidPosition(position, course) {
    if (!position || !Number.isInteger(position.lesson) || !Number.isInteger(position.step)) return false;
    const limit = stepLimit(position.lesson, course);
    return position.lesson >= 0 && position.lesson < course.lessonCount && position.step >= 0 && limit !== null && position.step < limit;
  }

  function hasValidCompletion(completion) {
    return completion === null || (
      completion &&
      typeof completion.id === 'string' && completion.id.length > 0 &&
      typeof completion.completedAt === 'string' &&
      !Number.isNaN(Date.parse(completion.completedAt))
    );
  }

  function normalize(state, course) {
    const completion = state && state.completion === undefined ? null : state && state.completion;
    if (!state || state.version !== VERSION || !hasValidPosition(state.position, course) || !hasValidCompletion(completion)) {
      return null;
    }

    return {
      version: VERSION,
      position: { lesson: state.position.lesson, step: state.position.step },
      completion: completion === null ? null : {
        id: completion.id,
        completedAt: completion.completedAt
      },
      learnerName: typeof state.learnerName === 'string' ? state.learnerName.trim() : ''
    };
  }

  function restore(raw, course) {
    if (typeof raw !== 'string') return defaultState();

    try {
      return normalize(JSON.parse(raw), course) || defaultState();
    } catch (error) {
      return defaultState();
    }
  }

  function fromPosition(position, course) {
    return normalize({
      version: VERSION,
      position,
      completion: null,
      learnerName: ''
    }, course);
  }

  function withPosition(state, position, course) {
    const current = normalize(state, course) || defaultState();
    return normalize({ ...current, position }, course);
  }

  function isTerminalPosition(position, course) {
    return hasValidPosition(position, course) &&
      position.lesson === course.lessonCount - 1 &&
      position.step === stepLimit(position.lesson, course) - 1;
  }

  function serialize(state, course) {
    const normalized = normalize(state, course);
    return JSON.stringify(normalized || defaultState());
  }

  function defaultUuidFactory() {
    return root.crypto.randomUUID();
  }

  function defaultClock() {
    return new Date();
  }

  function complete(state, dependencies) {
    const current = normalize(state, { lessonCount: Number.MAX_SAFE_INTEGER, stepCounts: [Number.MAX_SAFE_INTEGER] }) || defaultState();
    if (current.completion) return current;

    const uuidFactory = dependencies && dependencies.uuidFactory ? dependencies.uuidFactory : defaultUuidFactory;
    const clock = dependencies && dependencies.clock ? dependencies.clock : defaultClock;
    current.completion = { id: uuidFactory(), completedAt: clock().toISOString() };
    return current;
  }

  function withLearnerName(state, learnerName, course) {
    const current = normalize(state, course) || defaultState();
    return normalize({ ...current, learnerName: typeof learnerName === 'string' ? learnerName.trim() : '' }, course);
  }

  function completionRecord(state) {
    if (!state || !state.completion) return null;
    return {
      courseTitle: 'How AI works',
      learnerName: typeof state.learnerName === 'string' && state.learnerName.trim() ? state.learnerName.trim() : 'Course learner',
      completionId: state.completion.id,
      completedAt: state.completion.completedAt
    };
  }

  function reset() {
    return defaultState();
  }

  const CourseState = {
    VERSION,
    STORAGE_KEY,
    defaultState,
    restore,
    fromPosition,
    withPosition,
    isTerminalPosition,
    serialize,
    complete,
    withLearnerName,
    completionRecord,
    reset
  };

  root.HowAiWorksCourseState = CourseState;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CourseState };
  }
})(typeof window !== 'undefined' ? window : globalThis);
