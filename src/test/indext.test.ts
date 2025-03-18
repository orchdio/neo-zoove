import { sum } from "@/internal/sum";
import { expect, test } from "vitest";

test("add two numbers", () => {
  expect(sum(1, 41)).toBe(42); // the answer to life
});
