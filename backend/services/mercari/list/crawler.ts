import { launch } from "@cloudflare/playwright";
import type { MercariCrawlSetting } from "../../../models/products";

export interface MercariSearchResult {
  externalId: string;
  name: string;
  price: number;
  sellingUrl: string;
  imageUrl: string;
  sellingStatus: 1 | 2;
  sellerType: 1 | 2;
  sellerId: string;
}

export async function crawlList(
  setting: MercariCrawlSetting,
  isFirstRun: boolean,
  env: Env
): Promise<MercariSearchResult[]> {
  const searchUrl = buildSearchUrl(setting);
  const maxPages = isFirstRun ? 10 : 3;

  const results: MercariSearchResult[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages && (maxPages === undefined || currentPage <= maxPages)) {
    const pageUrl =
      currentPage === 1 ? searchUrl : `${searchUrl}&page=${currentPage}`;

    console.log(`[DEBUG] Crawling page ${currentPage}: ${pageUrl}`);

    try {
      const { results: pageResults, hasNextPage } = await crawlPage(pageUrl, env);

      if (pageResults.length === 0) {
        hasMorePages = false;
        break;
      }

      results.push(...pageResults);

      if (!hasNextPage) {
        hasMorePages = false;
        break;
      }

      currentPage++;

      // ページ間の待機時間（レート制限対策）
      if (hasMorePages && (maxPages === undefined || currentPage <= maxPages)) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Failed to crawl page ${currentPage}:`, error);
      hasMorePages = false;
      break;
    }
  }

  return results;
}

function buildSearchUrl(setting: MercariCrawlSetting): string {
  const baseUrl = "https://www.mercari.com/jp/search/";
  const params = new URLSearchParams({
    keyword: setting.keyword,
  });

  if (setting.categoryId) {
    params.append("category_id", setting.categoryId.toString());
  }

  if (setting.minPrice > 0) {
    params.append("price_min", setting.minPrice.toString());
  }

  if (setting.maxPrice > 0) {
    params.append("price_max", setting.maxPrice.toString());
  }

  return `${baseUrl}?${params.toString()}`;
}

async function crawlPage(
  url: string,
  env: Env
): Promise<{ results: MercariSearchResult[]; hasNextPage: boolean }> {
  const browser = await launch(env.BROWSER);
  const page = await browser.newPage();

  try {
    await page.goto(url, {
      waitUntil: "load",
      timeout: 30000,
    });
    await page.waitForTimeout(2000);
    const results = await parseSearchResultsWithPlaywright(page);
    const hasNextPage = await checkHasNextPage(page);
    return { results, hasNextPage };
  } finally {
    await browser.close();
  }
}

async function parseSearchResultsWithPlaywright(
  page: any
): Promise<MercariSearchResult[]> {
  const results: MercariSearchResult[] = [];

  try {
    await scrollPage(page);

    const searchItemGrid = await page.$("div[data-testid='search-item-grid']");
    if (!searchItemGrid) {
      console.log("[DEBUG] search-item-grid not found");
      return [];
    }

    const itemCells = await searchItemGrid.$$("li[data-testid='item-cell']");
    console.log(`[DEBUG] Found ${itemCells.length} item cells`);

    for (let i = 0; i < itemCells.length; i++) {
      try {
        const item = itemCells[i];
        if (await isNotCrawlable(item)) {
          continue;
        }

        const result = await parseItemWithPlaywright(item);
        if (result) {
          results.push(result);
        }
      } catch (error) {
        console.error(`[DEBUG] Failed to parse item ${i}:`, error);
      }
    }

    console.log(`[DEBUG] Valid results: ${results.length}`);
    return results;
  } catch (error) {
    console.error("[DEBUG] Failed to parse search results:", error);
    return [];
  }
}

async function scrollPage(page: any): Promise<void> {
  await page.waitForTimeout(2000);

  for (let count = 0; count <= 30; count++) {
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(5);
  }
}

async function checkHasNextPage(page: any): Promise<boolean> {
  try {
    const nextButton = await page.$("[data-testid='pagination-next-button']");
    return nextButton !== null;
  } catch (error) {
    console.error("[DEBUG] Failed to check next page:", error);
    return false;
  }
}

async function isNotCrawlable(item: any): Promise<boolean> {
  const skeleton = await item.$(".merSkeleton");
  if (skeleton) {
    return true;
  }

  try {
    const linkElement = await item.$("a");
    if (linkElement) {
      const href = await linkElement.getAttribute("href");
      if (href && href.match(/product\/([^/]+)/)) {
        return true;
      }
    }
  } catch (e) {
  }

  return false;
}

async function parseItemWithPlaywright(
  item: any
): Promise<MercariSearchResult | null> {
  try {
    const linkElement = await item.$("a");
    if (!linkElement) {
      return null;
    }

    const href = await linkElement.getAttribute("href");
    if (!href) return null;

    const externalIdMatch = href.match(/\/item\/([^\/]+)/);
    const externalId = externalIdMatch ? externalIdMatch[1] : "";
    if (!externalId) return null;

    const sellingUrl = `https://jp.mercari.com/item/${externalId}`;

    const nameElement = await item.$("[data-testid='thumbnail-item-name']");
    if (!nameElement) {
      return null;
    }
    const name = (await nameElement.textContent())?.trim() || "";
    if (!name) return null;

    const priceElement = await item.$("[class^='number']");
    if (!priceElement) {
      return null;
    }
    const priceText = (await priceElement.textContent())?.trim() || "";
    const price = parseInt(priceText.replace(/,/g, ""), 10);
    if (!price || price === 0) {
      return null;
    }

    const imageElement = await item.$("img");
    const imageUrl = imageElement
      ? (await imageElement.getAttribute("src")) || ""
      : "";

    const soldOutElement = await item.$("[aria-label='売り切れ']");
    const sellingStatus: 1 | 2 = soldOutElement ? 2 : 1;

    const sellerType: 1 | 2 = 1;
    const sellerId = "";

    return {
      externalId,
      name,
      price,
      sellingUrl,
      imageUrl,
      sellingStatus,
      sellerType,
      sellerId,
    };
  } catch (error) {
    console.error("Failed to parse item:", error);
    return null;
  }
}
