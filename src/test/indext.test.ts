import { sum } from "@/internal/sum";
import { isMagicURL } from "@/lib/utils";
import { expect, test } from "vitest";

test("add two numbers", () => {
  expect(sum(1, 41)).toBe(42); // the answer to life
});

test("Contains a short URL", () => {
  const link = "https://dzr.page.link/FFzX9CEzbpVtz4Rk9";
  const isMagicLink = isMagicURL(link);

  expect(isMagicLink).to.equal(true);
});

test("Hostnames", () => {
  const link = "https://www.deezer.com/de/track/2815968782";
  const parsedURL = new URL(link);

  console.log(parsedURL);

  expect(parsedURL.host).toBe("www.deezer.com");
});
