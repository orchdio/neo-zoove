import { expect, test } from "vitest";
import { isMagicURL } from "@/lib/utils";

test("Contains a short URL", () => {
  const link = "https://dzr.page.link/FFzX9CEzbpVtz4Rk9";
  const isMagicLink = isMagicURL(link);

  expect(isMagicLink).to.equal(true);
});

test("Hostnames", () => {
  const link = "https://www.deezer.com/de/track/2815968782";
  const parsedURL = new URL(link);

  expect(parsedURL.host).toBe("www.deezer.com");
});
