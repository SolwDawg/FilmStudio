import { describe, expect, it } from "vitest";
import { chromium } from "playwright";
import { CharacterPage } from "../src/flow/characters.js";

describe("CharacterPage", () => {
  it("lists saved character cards from the project media view", async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      // The engine adds ?hl=en to every Flow URL, so routes allow an optional query string.
      await page.route(/\/fx\/tools\/flow\/project\/abc(\?.*)?$/, async (route) => {
        await route.fulfill({
          contentType: "text/html",
          body: `
            <button>accessibility_new Characters</button>
            <flow-grid-tile-container role="group" aria-label="Minwoo">
              <flow-character-tile>
                <img alt="Character thumbnail" src="https://example.test/thumb.png">
                <span class="character-tile-name">Minwoo</span>
                <mat-icon>accessibility_new</mat-icon>
              </flow-character-tile>
            </flow-grid-tile-container>
          `
        });
      });
      await page.route(/\/fx\/tools\/flow\/project\/abc\/character(\?.*)?$/, async (route) => {
        await route.fulfill({
          contentType: "text/html",
          body: `
            <h1>New character</h1>
            <div role="textbox" contenteditable="true">Describe your character...</div>
          `
        });
      });

      await page.goto("https://labs.google/fx/tools/flow/project/abc");
      const characters = await new CharacterPage(page).listCharacters();

      expect(characters).toEqual([
        {
          name: "Minwoo",
          thumbnailUrl: "https://example.test/thumb.png"
        }
      ]);
    } finally {
      await browser.close();
    }
  });
});
