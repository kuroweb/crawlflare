import { launch } from "@cloudflare/playwright";

export interface MercariDetailResult {
  exists: boolean;
  name?: string;
  price?: number;
  sellingStatus?: 1 | 2;
  soldOutAt?: string;
  imageUrl?: string;
}

export async function crawlDetail(
  sellingUrl: string,
  env: { BROWSER: Fetcher }
): Promise<MercariDetailResult> {
  const browser = await launch(env.BROWSER);
  const page = await browser.newPage();

  try {
    const response = await page.goto(sellingUrl, {
      waitUntil: "load",
      timeout: 30000,
    });

    if (!response || response.status() === 404) {
      return { exists: false };
    }

    // コンテンツをロードするためにスクロール
    await loadPage(page);

    // 削除されているかチェック
    const emptyState = await page.$(".merEmptyState");
    if (emptyState) {
      return { exists: false };
    }

    // Playwrightのセレクターでデータを取得
    const result = await parseDetailPageWithPlaywright(page);
    console.log(`[DEBUG] crawlDetail result for ${sellingUrl}:`, JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error(`Failed to crawl detail page ${sellingUrl}:`, error);
    return { exists: false };
  } finally {
    await browser.close();
  }
}

async function loadPage(page: any): Promise<void> {
  await page.waitForTimeout(2000);
  for (let count = 0; count <= 30; count++) {
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(5);
  }
}

async function parseDetailPageWithPlaywright(
  page: any
): Promise<MercariDetailResult> {
  const result: MercariDetailResult = {
    exists: true,
  };

  try {
    // 商品名
    const nameElement = await page.$("[class*='heading'][class*='page']");
    if (nameElement) {
      result.name = (await nameElement.textContent())?.trim() || undefined;
    }

    // 価格
    const priceElement = await page.$("[data-testid='price']");
    if (priceElement) {
      const priceText = (await priceElement.textContent())?.trim() || "";
      const priceStr = priceText.replace(/¥|,/g, "");
      result.price = parseInt(priceStr, 10) || undefined;
    }

    // 売り切れかどうか（コメントできないメッセージがないかチェック）
    const commentDisabledText = await page.$(
      "text='※売り切れのためコメントできません'"
    );
    const isSoldOut = commentDisabledText !== null;
    console.log(`[DEBUG] isSoldOut: ${isSoldOut}, commentDisabledText found: ${commentDisabledText !== null}`);
    result.sellingStatus = isSoldOut ? 2 : 1;

    // 売り切れ日時の取得
    if (isSoldOut) {
      console.log("[DEBUG] Fetching soldOutAt...");
      const soldOutAt = await getSoldOutAt(page);
      result.soldOutAt = soldOutAt;
      console.log(`[DEBUG] soldOutAt result: ${soldOutAt}`);
    } else {
      console.log("[DEBUG] Not sold out, skipping soldOutAt fetch");
    }

    // 画像URL
    const images = await page.$$("img");
    for (const img of images) {
      const src = await img.getAttribute("src");
      if (src && !src.includes("super_mercari_days")) {
        result.imageUrl = src;
        break;
      }
    }

    return result;
  } catch (error) {
    console.error("Failed to parse detail page:", error);
    return { exists: true };
  }
}

async function getSoldOutAt(page: any): Promise<string | undefined> {
  try {
    const container = await page.$("[data-testid='item-detail-container']");
    if (!container) {
      console.log("[DEBUG] item-detail-container not found");
      return new Date().toISOString();
    }

    const textElements = await container.$$(
      "[class*='merText'][class*='body'][class*='secondary']"
    );
    console.log(`[DEBUG] Found ${textElements.length} text elements`);

    const TIME_UNITS = ["分前", "時間前", "日前", "か月前", "半年以上前"];

    for (let i = 0; i < textElements.length; i++) {
      const element = textElements[i];
      const text = (await element.textContent())?.trim() || "";
      console.log(`[DEBUG] Text element ${i}: "${text}"`);
      if (TIME_UNITS.some((unit) => text.includes(unit))) {
        const parsedDate = parseSoldOutDate(text);
        console.log(`[DEBUG] Parsed soldOutAt from "${text}": ${parsedDate}`);
        return parsedDate;
      }
    }

    console.log("[DEBUG] No time unit found in text elements, using current date");
    return new Date().toISOString();
  } catch (error) {
    console.error("Failed to get soldOutAt:", error);
    return new Date().toISOString();
  }
}

function parseSoldOutDate(dateStr: string): string {
  const now = new Date();
  const beginningOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  let targetDate: Date;

  if (dateStr.includes("分前") || dateStr.includes("時間前")) {
    targetDate = beginningOfDay;
  } else if (dateStr.includes("日前")) {
    const daysMatch = dateStr.match(/(\d+)日前/);
    if (daysMatch) {
      const days = parseInt(daysMatch[1], 10);
      targetDate = new Date(beginningOfDay);
      targetDate.setDate(targetDate.getDate() - days);
    } else {
      targetDate = beginningOfDay;
    }
  } else if (dateStr.includes("か月前")) {
    const monthsMatch = dateStr.match(/(\d+)か月前/);
    if (monthsMatch) {
      const months = parseInt(monthsMatch[1], 10);
      targetDate = new Date(beginningOfDay);
      targetDate.setMonth(targetDate.getMonth() - months);
    } else {
      targetDate = beginningOfDay;
    }
  } else if (dateStr.includes("半年以上前")) {
    targetDate = new Date(beginningOfDay);
    targetDate.setMonth(targetDate.getMonth() - 6);
  } else {
    targetDate = beginningOfDay;
  }

  // ISO形式で返す（モデル層でSQLite形式に変換）
  return targetDate.toISOString();
}
