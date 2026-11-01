import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createStudioQueryClient,
  readStudioResult,
  studioKeys,
  studioStaleTime,
} from "./query-core";

test("concurrent studio reads share one call", async () => {
  const client = createStudioQueryClient();
  let calls = 0;
  const queryFn = () =>
    readStudioResult(async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 20));
      return { success: true as const, calls };
    });
  const options = {
    queryKey: studioKeys.folders,
    queryFn,
    staleTime: studioStaleTime.stable,
  };
  const [a, b] = await Promise.all([
    client.fetchQuery(options),
    client.fetchQuery(options),
  ]);
  assert.equal(calls, 1);
  assert.deepEqual(a, b);
});

test("a second read inside the stale time does not call again", async () => {
  const client = createStudioQueryClient();
  let calls = 0;
  const queryFn = () =>
    readStudioResult(async () => {
      calls += 1;
      return { success: true as const, calls };
    });
  const options = {
    queryKey: studioKeys.organizations,
    queryFn,
    staleTime: studioStaleTime.stable,
  };
  await client.fetchQuery(options);
  await client.fetchQuery(options);
  assert.equal(calls, 1);
});

test("a failed read is not reused", async () => {
  const client = createStudioQueryClient();
  let calls = 0;
  const queryFn = () =>
    readStudioResult(async () => {
      calls += 1;
      return { success: false as const, error: "no" };
    });
  const options = {
    queryKey: studioKeys.activeOrganization,
    queryFn,
    staleTime: studioStaleTime.stable,
  };
  await assert.rejects(client.fetchQuery(options));
  await assert.rejects(client.fetchQuery(options));
  assert.equal(calls, 2);
});

test("invalidating a key lets the next read through", async () => {
  const client = createStudioQueryClient();
  let calls = 0;
  const queryFn = () =>
    readStudioResult(async () => {
      calls += 1;
      return { success: true as const, calls };
    });
  const options = {
    queryKey: studioKeys.projects("folder"),
    queryFn,
    staleTime: 10_000,
  };
  await client.fetchQuery(options);
  await client.invalidateQueries({ queryKey: studioKeys.projectsRoot });
  await client.fetchQuery(options);
  assert.equal(calls, 2);
});
