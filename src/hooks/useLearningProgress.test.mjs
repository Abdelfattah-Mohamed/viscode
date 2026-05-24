import assert from "node:assert/strict";
import test from "node:test";
import {
  LEARNING_PROGRESS_STORAGE_KEY_PREFIX,
  getLearningProgressStorageKey,
  readLearningProgressState,
  writeLearningProgressState,
} from "./useLearningProgress.js";

function installLocalStorage() {
  const store = new Map();
  globalThis.localStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
  return store;
}

test("learning progress storage keys are scoped to signed-in email", () => {
  assert.equal(getLearningProgressStorageKey(null), null);
  assert.equal(getLearningProgressStorageKey({ username: "Guest", isGuest: true }), null);
  assert.equal(getLearningProgressStorageKey({ username: "NoEmail" }), null);
  assert.equal(
    getLearningProgressStorageKey({ email: "  User+Demo@Example.COM  " }),
    `${LEARNING_PROGRESS_STORAGE_KEY_PREFIX}:user%2Bdemo%40example.com`
  );
});

test("learning progress writes require an explicit scoped key", () => {
  const store = installLocalStorage();
  try {
    writeLearningProgressState(null, { stats: { completed: 10 } });
    assert.equal(store.size, 0);

    const scopedKey = getLearningProgressStorageKey({ email: "user@example.com" });
    writeLearningProgressState(scopedKey, { stats: { completed: 3 } });

    assert.equal(store.has(LEARNING_PROGRESS_STORAGE_KEY_PREFIX), false);
    assert.equal(readLearningProgressState(scopedKey).stats.completed, 3);
  } finally {
    delete globalThis.localStorage;
  }
});
