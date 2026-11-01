type Entry = { at: number; value: unknown };

const values = new Map<string, Entry>();
const flights = new Map<string, Promise<unknown>>();

let wired = false;

function succeeded(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    (value as { success: boolean }).success === true
  );
}

function dropMatching(match: (key: string) => boolean) {
  for (const key of values.keys()) {
    if (match(key)) values.delete(key);
  }
}

/** Drop cached reads before bubble listeners start their own refresh. */
function wireInvalidation() {
  if (wired || typeof window === "undefined") return;
  wired = true;
  window.addEventListener(
    "studio:org-changed",
    () => {
      dropMatching(
        (key) =>
          key === "active-org" ||
          key === "orgs" ||
          key === "folders" ||
          key.startsWith("projects:"),
      );
    },
    true,
  );
  window.addEventListener(
    "studio:folders-changed",
    () => dropMatching((key) => key === "folders"),
    true,
  );
  window.addEventListener(
    "core:projects-changed",
    () => dropMatching((key) => key.startsWith("projects:")),
    true,
  );
}

export function forgetCachedRead(key?: string) {
  if (!key) {
    values.clear();
    return;
  }
  values.delete(key);
}

/**
 * One in-flight server read per key, plus a short success cache.
 * Mount effects and window callbacks that ask for the same data share the call.
 * Failed reads are not cached.
 */
export function cachedRead<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  wireInvalidation();
  const now = Date.now();
  const hit = values.get(key);
  if (hit && now - hit.at < ttlMs) return Promise.resolve(hit.value as T);

  const flight = flights.get(key);
  if (flight) return flight as Promise<T>;

  const job = load()
    .then((value) => {
      if (succeeded(value)) values.set(key, { at: Date.now(), value });
      return value;
    })
    .finally(() => {
      if (flights.get(key) === job) flights.delete(key);
    });
  flights.set(key, job);
  return job;
}
