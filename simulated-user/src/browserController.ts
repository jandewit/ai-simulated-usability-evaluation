import { chromium, Browser, Page } from "playwright";
import path from "path";
import { ActionDecision } from "./types.js";

export class BrowserController {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
  }

  async launch(headless: boolean = true): Promise<void> {
    this.browser = await chromium.launch({ headless });
    const context = await this.browser.newContext();
    this.page = await context.newPage();
  }

  async close(): Promise<void> {
    await this.browser?.close();
  }

  async navigate(url: string): Promise<void> {
    if (!this.page) throw new Error("Browser not launched");
    await this.page.goto(url, { waitUntil: "networkidle" });
    await this.page.waitForTimeout(1000);
  }

  async takeScreenshot(filename: string): Promise<string> {
    if (!this.page) throw new Error("Browser not launched");
    const filepath = path.join(this.outputDir, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    return filepath;
  }

  async executeAction(action: ActionDecision): Promise<void> {
    if (!this.page) throw new Error("Browser not launched");

    try {
      // Wait for page to be stable before executing action
      await this.page.waitForLoadState('networkidle').catch(() => {});
      await this.page.waitForTimeout(500);

      switch (action.action) {
        case "click":
          await this.clickElement(action.target, action.coordinates);
          break;
        case "type":
          await this.typeText(action.target, action.value, action.coordinates);
          break;
        case "scroll":
          await this.scroll(action.value);
          break;
        case "wait":
          await this.page.waitForTimeout(2000);
          break;
        case "navigate":
          await this.navigate(action.value || "");
          break;
        case "none":
          await this.page.waitForTimeout(1000);
          break;
      }

      await this.page.waitForTimeout(500);
    } catch (error) {
      // Check if browser/page was closed
      if (error instanceof Error) {
        if (error.message.includes('closed') || error.message.includes('Target page')) {
          console.warn(`⚠️ Browser or page was closed during action execution`);
          throw error;
        }
      }
      console.warn(`⚠️ Action execution error: ${error instanceof Error ? error.message : error}`);
    }
  }

  private async clickElement(target?: string, coordinates?: { x: number; y: number }): Promise<void> {
    if (!this.page) return;

    try {
      if (target) {
        console.log(`  → Attempting to click: "${target}"`);
      } else if (coordinates) {
        console.log(`  → Attempting to click at coordinates: (${coordinates.x}%, ${coordinates.y}%)`);
      } else {
        console.log(`  ✗ No target or coordinates provided`);
        return;
      }
      
      // PRIORITY: If coordinates are provided, use them first (more reliable)
      if (coordinates) {
        const viewport = await this.page.viewportSize();
        if (!viewport) {
          console.log(`  ✗ Could not get viewport size`);
          return;
        }

        // Convert percentages to pixels
        const pixelX = (coordinates.x / 100) * viewport.width;
        const pixelY = (coordinates.y / 100) * viewport.height;

        console.log(`  📐 Viewport: ${viewport.width}x${viewport.height}`);
        console.log(`  📍 Target pixel coords: (${pixelX.toFixed(0)}, ${pixelY.toFixed(0)})`);

        try {
          // Try to find the nearest clickable element to the coordinates first
          const nearbyElement = await this.findNearestClickableElement(pixelX, pixelY, target);
          if (nearbyElement) {
            console.log(`  ✓ Found clickable element, clicking it`);
            await nearbyElement.click({ force: true });
            return;
          }
        } catch (error) {
          // Element not found, continue to direct click
        }

        // Fallback: direct mouse click
        try {
          console.log(`  🖱️ Direct mouse click`);
          await this.page.mouse.click(pixelX, pixelY);
          console.log(`  ✓ Successfully clicked at coordinates`);
        } catch (coordError) {
          console.warn(`  ✗ Click failed:`, coordError instanceof Error ? coordError.message : coordError);
        }
        return;
      }
      
      // FALLBACK: If no coordinates, try text-based matching
      if (target) {
        // Extract keywords from description for more robust matching
        const keywords = target.match(/\b(add|remove|click|delete|edit|save|submit|search|next|back|cart|product|button|link|checkout|login|logout|close|x|buy|checkout)\b/gi) || [];
        if (keywords.length > 0) {
          const keyword = keywords[0]!; // Use first meaningful keyword
          console.log(`  → Trying keyword search: "${keyword}"`);
          
          try {
            const element = this.page.locator(`button, a, [role="button"], [role="link"]`)
              .filter({ hasText: new RegExp(keyword, 'i') })
              .first();
            
            if (await element.isVisible()) {
              console.log(`  ✓ Found by keyword match`);
              await element.click({ force: true });
              return;
            }
          } catch (error) {
            console.log(`  ⚠ Keyword search failed:`, error instanceof Error ? error.message : error);
          }
        }

        // Try aria-labels and titles (without regex)
        try {
          const element = this.page.locator(`[aria-label], [title]`).first();
          if (await element.isVisible()) {
            console.log(`  ✓ Found by aria-label/title`);
            await element.click({ force: true });
            return;
          }
        } catch (error) {
          console.log(`  ⚠ aria-label search failed`);
        }

        // Use page.evaluate to find element by text in a smarter way
        try {
          const found = await (this.page.evaluate as any)((targetText: string) => {
            const elements = Array.from(document.querySelectorAll('button, a, [role="button"], [role="link"], input[type="button"], input[type="submit"]'));
            const element = elements.find(el => el.textContent?.toLowerCase().includes(targetText.toLowerCase()));
            if (element) {
              (element as HTMLElement).click();
              return true;
            }
            return false;
          }, target);

          if (found) {
            console.log(`  ✓ Clicked using page.evaluate()`);
            return;
          }
        } catch (error) {
          console.log(`  ⚠ page.evaluate search failed`);
        }

        // If still not found, log all clickable elements for debugging
        try {
          const clickableElements = await this.page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('button, a, [role="button"], [role="link"], [onclick]'));
            return elements.slice(0, 5).map((el, i) => ({
              index: i,
              text: (el as HTMLElement).textContent?.substring(0, 50),
              tag: (el as HTMLElement).tagName,
            }));
          });

          console.log(`  ⚠ Could not find "${target}" by text. Available clickable elements:`, clickableElements);
        } catch (error) {
          console.log(`  ⚠ Could not list available elements`);
        }
      }

      console.log(`  ✗ All click strategies failed`);
    } catch (error) {
      console.warn(`  ✗ Click failed:`, error instanceof Error ? error.message : error);
    }
  }

  private async findNearestClickableElement(targetX: number, targetY: number, targetDescription?: string): Promise<any> {
    if (!this.page) return null;

    try {
      const element = await this.page.evaluate(
        ({ x, y, desc }: { x: number; y: number; desc?: string }) => {
          // If looking for an image or product, prioritize img/product elements
          if (desc && (desc.toLowerCase().includes('image') || desc.toLowerCase().includes('product'))) {
            const productElements = Array.from(
              document.querySelectorAll('img, [class*="product"], [class*="card"], [data-testid*="product"]')
            ) as HTMLElement[];

            if (productElements.length > 0) {
              // Find the element closest to target coordinates
              const nearest = productElements.reduce((closest, el) => {
                const rect = el.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return closest; // Skip invisible elements
                
                const elX = rect.left + rect.width / 2;
                const elY = rect.top + rect.height / 2;
                const distance = Math.sqrt(Math.pow(elX - x, 2) + Math.pow(elY - y, 2));
                
                const closestRect = closest.rect;
                const closestDistance = Math.sqrt(
                  Math.pow(closestRect.left + closestRect.width / 2 - x, 2) +
                  Math.pow(closestRect.top + closestRect.height / 2 - y, 2)
                );

                return distance < closestDistance ? { element: el, rect } : closest;
              }, { element: null as HTMLElement | null, rect: productElements[0]?.getBoundingClientRect() || new DOMRect() });

              if (nearest.element && nearest.element.offsetHeight > 0 && nearest.element.offsetWidth > 0) {
                const rect = nearest.element.getBoundingClientRect();
                return {
                  selector: nearest.element.tagName,
                  text: nearest.element.getAttribute('alt') || nearest.element.textContent?.substring(0, 30),
                  x: rect.left,
                  y: rect.top,
                  width: rect.width,
                  height: rect.height,
                };
              }
            }
          }

          // Default: find regular clickable elements (buttons, links, etc.)
          const clickableElements = Array.from(
            document.querySelectorAll('button, a, [role="button"], [role="link"], input[type="button"], input[type="submit"], [onclick]')
          ) as HTMLElement[];

          if (clickableElements.length === 0) return null;

          // Find element closest to target coordinates
          const nearest = clickableElements.reduce((closest, el) => {
            const rect = el.getBoundingClientRect();
            const elX = rect.left + rect.width / 2;
            const elY = rect.top + rect.height / 2;
            
            const distance = Math.sqrt(Math.pow(elX - x, 2) + Math.pow(elY - y, 2));
            const closestRect = closest.rect;
            const closestDistance = Math.sqrt(
              Math.pow(closestRect.left + closestRect.width / 2 - x, 2) +
              Math.pow(closestRect.top + closestRect.height / 2 - y, 2)
            );

            return distance < closestDistance ? { element: el, rect } : closest;
          }, { element: null as HTMLElement | null, rect: clickableElements[0].getBoundingClientRect() });

          if (!nearest.element || nearest.element.offsetHeight === 0 || nearest.element.offsetWidth === 0) {
            return null;
          }

          const rect = nearest.element.getBoundingClientRect();
          return {
            selector: nearest.element.tagName,
            text: nearest.element.textContent?.substring(0, 30),
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
          };
        },
        { x: targetX, y: targetY, desc: targetDescription }
      );

      if (element) {
        console.log(`  Found nearby: ${element.selector} "${element.text}" at (${element.x.toFixed(0)}, ${element.y.toFixed(0)})`);
        // Click the found element
        return this.page.locator(`${element.selector}:has-text("${element.text}")`).first();
      }
      return null;
    } catch (error) {
      console.log(`  Could not find nearby element:`, error instanceof Error ? error.message : error);
      return null;
    }
  }

  private async typeText(target?: string, text?: string, coordinates?: { x: number; y: number }): Promise<void> {
    if (!this.page || !target || !text) return;

    try {
      console.log(`  → Attempting to type "${text}" into: "${target}"`);

      // Strategy 1: Extract keywords for robust field matching
      const keywords = target.match(/\b(username|password|email|search|name|input|field|box|text|contact|address|phone|first|last|message|street|city|state|postal|zip|country|card|expiry|cvc|cvv)\b/gi) || [];
      const searchTarget = keywords.length > 0 ? keywords[0] : target;

      // Strategy 2: Use page.evaluate to find the best matching input field
      // This is more sophisticated - it tries to match by keywords and type, with coordinate hints
      const found = await (this.page.evaluate as any)(
        ({ targetText, inputText, coordX, coordY }: { targetText: string; inputText: string; coordX?: number; coordY?: number }) => {
          // Get all input fields
          const inputs = Array.from(document.querySelectorAll('input, textarea')) as HTMLInputElement[];
          
          // Filter visible and empty-or-focused inputs
          const visibleInputs = inputs.filter(input => 
            input.offsetHeight > 0 && 
            input.offsetWidth > 0 && 
            input.style.display !== 'none'
          );
          
          if (visibleInputs.length === 0) return false;

          // Try to find input by proximity to labels or placeholders
          for (const input of visibleInputs) {
            // Skip already-filled fields (unless it's a password/card field that might need overwriting)
            if (input.value && !targetText.toLowerCase().includes('password') && !targetText.toLowerCase().includes('card')) {
              continue;
            }

            // Check if input has associated label
            const label = input.previousElementSibling || input.parentElement?.querySelector('label');
            const labelText = label?.textContent?.toLowerCase() || '';
            const placeholder = input.placeholder?.toLowerCase() || '';
            const ariaLabel = input.getAttribute('aria-label')?.toLowerCase() || '';
            const inputType = input.type?.toLowerCase() || '';

            // Try to match by keyword
            if (
              labelText.includes(targetText.toLowerCase()) ||
              placeholder.includes(targetText.toLowerCase()) ||
              ariaLabel.includes(targetText.toLowerCase()) ||
              inputType.includes(targetText.toLowerCase())
            ) {
              input.value = inputText;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
              input.blur(); // Unfocus to trigger validation
              return true;
            }
          }

          // Fallback: fill the first empty visible input
          for (const input of visibleInputs) {
            if (!input.value || input.type === 'password') {
              input.value = inputText;
              input.dispatchEvent(new Event('input', { bubbles: true }));
              input.dispatchEvent(new Event('change', { bubbles: true }));
              input.blur();
              return true;
            }
          }
          
          return false;
        },
        { targetText: searchTarget, inputText: text, coordX: coordinates?.x, coordY: coordinates?.y }
      );

      if (found) {
        console.log(`  ✓ Typed using intelligent field detection`);
        return;
      }

      // Strategy 3: Fallback - try placeholder matching
      let element = this.page.locator(`input[placeholder*="${searchTarget}" i], textarea[placeholder*="${searchTarget}" i]`).first();
      
      if (await element.isVisible()) {
        console.log(`  ✓ Found by placeholder`);
        await element.click({ force: true });
        await element.fill(text);
        return;
      }

      // Strategy 4: Try aria-label
      element = this.page.locator(`input[aria-label*="${searchTarget}" i], textarea[aria-label*="${searchTarget}" i]`).first();
      
      if (await element.isVisible()) {
        console.log(`  ✓ Found by aria-label`);
        await element.click({ force: true });
        await element.fill(text);
        return;
      }

      console.log(`  ⚠ Could not find input field for: "${target}"`);
    } catch (error) {
      console.warn(`  ✗ Type failed for "${target}":`, error instanceof Error ? error.message : error);
    }
  }

  private async scroll(direction?: string): Promise<void> {
    if (!this.page) return;

    try {
      // Find and scroll a scrollable container (like a modal, panel, or drawer)
      const scrollResult = await this.page.evaluate((dir) => {
        // First, try to find the main scrollable content inside any dialog
        const dialog = document.querySelector('[role="dialog"]');
        if (dialog) {
          // The second child (after header) is usually the scrollable content
          const contentArea = dialog.children[1] as HTMLElement;
          if (contentArea) {
            const scrollHeight = contentArea.scrollHeight;
            const clientHeight = contentArea.clientHeight;
            
            if (scrollHeight > clientHeight) {
              const beforeScroll = contentArea.scrollTop;
              const scrollAmount = 300;
              
              if (dir === 'down') {
                contentArea.scrollTop += scrollAmount;
              } else if (dir === 'up') {
                contentArea.scrollTop -= scrollAmount;
              }
              
              const afterScroll = contentArea.scrollTop;
              if (beforeScroll !== afterScroll) {
                return { scrolled: true, element: 'dialog-content', before: beforeScroll, after: afterScroll };
              }
            }
          }
        }

        // Extended list of selectors for scrollable containers
        const scrollableSelectors = [
          '[role="dialog"]',
          '[role="presentation"]',
          '.modal',
          '.drawer',
          '.panel',
          '.checkout-panel',
          '[class*="modal"]',
          '[class*="drawer"]',
          '[class*="panel"]',
          '[class*="checkout"]',
          '[class*="cart"]',
          '[class*="slide"]',
          '[class*="overlay"]',
        ];

        let scrolled = false;

        // Try to find a visible, scrollable container
        for (const selector of scrollableSelectors) {
          try {
            const elements = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
            for (const el of elements) {
              // Check if element is visible and scrollable
              const rect = el.getBoundingClientRect();
              if (el.offsetHeight > 0 && el.offsetWidth > 0 && rect.height > 0 && rect.width > 0) {
                const isScrollable = el.scrollHeight > el.offsetHeight;
                if (isScrollable && el.scrollHeight > 100) { // Ensure it's a substantial scrollable area
                  const scrollAmount = 300;
                  const beforeScroll = el.scrollTop;
                  
                  if (dir === 'down') {
                    el.scrollTop += scrollAmount;
                  } else if (dir === 'up') {
                    el.scrollTop -= scrollAmount;
                  }
                  
                  const afterScroll = el.scrollTop;
                  if (beforeScroll !== afterScroll) {
                    return { scrolled: true, element: selector, before: beforeScroll, after: afterScroll };
                  }
                }
              }
            }
          } catch (e) {
            // Continue to next selector
          }
        }

        // Fallback: scroll the window if no scrollable container found
        const beforeScroll = window.scrollY;
        if (dir === 'down') {
          window.scrollBy(0, 300);
        } else if (dir === 'up') {
          window.scrollBy(0, -300);
        }
        const afterScroll = window.scrollY;
        
        if (beforeScroll !== afterScroll) {
          return { scrolled: true, element: 'window', before: beforeScroll, after: afterScroll };
        }

        return { scrolled: false, element: null };
      }, direction);

      if (scrollResult.scrolled) {
        console.log(`  ✓ Scrolled ${direction} in ${scrollResult.element} (${scrollResult.before} → ${scrollResult.after})`);
      } else {
        console.log(`  ⚠️ Scroll failed - no scrollable content found`);
      }

      await this.page.waitForTimeout(500);
    } catch (error) {
      console.warn(`  ⚠️ Scroll error:`, error instanceof Error ? error.message : error);
    }
  }

  async getPageInfo(): Promise<{ title: string; url: string }> {
    if (!this.page) throw new Error("Browser not launched");
    return {
      title: await this.page.title(),
      url: this.page.url(),
    };
  }

  async waitForNavigation(): Promise<void> {
    if (!this.page) return;
    try {
      // Wait for navigation with a timeout
      await this.page.waitForNavigation({ waitUntil: "networkidle", timeout: 5000 }).catch(() => {
        // Timeout is ok, page might not navigate
      });
    } catch (error) {
      // Silently ignore navigation errors
    }
    // Additional wait for dynamic content to load
    await this.page.waitForTimeout(1000);
  }
}
