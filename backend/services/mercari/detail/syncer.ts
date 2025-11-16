import type { Database } from "../../../db/client";
import type { MercariCrawlResult } from "../../../models/mercariCrawlResults";
import {
  findById,
  update,
  deleteById,
} from "../../../models/mercariCrawlResults";
import { crawlDetail } from "./crawler";
import type { MercariDetailResult } from "./crawler";

export async function syncDetail(
  db: Database,
  mercariCrawlResultId: number,
  env: { BROWSER: Fetcher }
): Promise<{
  success: boolean;
  action: "updated" | "deleted" | "no_change" | "error";
  message?: string;
}> {
  try {
    const crawlResult = await findById(db, mercariCrawlResultId);
    if (!crawlResult) {
      return {
        success: false,
        action: "error",
        message: "クロール結果が見つかりません",
      };
    }

    const detailResult = await crawlDetail(crawlResult.sellingUrl, env);

    if (!detailResult.exists) {
      const deleted = await deleteById(db, mercariCrawlResultId);
      if (deleted) {
        return {
          success: true,
          action: "deleted",
          message: "商品が存在しないため削除しました",
        };
      } else {
        return {
          success: false,
          action: "error",
          message: "レコードの削除に失敗しました",
        };
      }
    }

    if (crawlResult.sellingStatus === 1) {
      return await handleSellingItem(db, crawlResult, detailResult);
    }

    if (crawlResult.sellingStatus === 2 && !crawlResult.soldOutAt) {
      return await handleSoldOutItem(db, crawlResult, detailResult);
    }

    return {
      success: true,
      action: "no_change",
      message: "変更はありませんでした",
    };
  } catch (error) {
    console.error(
      `Error in syncDetail for ID ${mercariCrawlResultId}:`,
      error
    );
    return {
      success: false,
      action: "error",
      message: `エラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function handleSellingItem(
  db: Database,
  crawlResult: MercariCrawlResult,
  detailResult: MercariDetailResult
): Promise<{
  success: boolean;
  action: "updated" | "deleted" | "no_change" | "error";
  message?: string;
}> {
  if (detailResult.sellingStatus === 2) {
    const updated = await update(db, crawlResult.id, {
      sellingStatus: 2,
      soldOutAt: detailResult.soldOutAt,
      price: detailResult.price,
      name: detailResult.name,
      imageUrl: detailResult.imageUrl,
    });

    if (updated) {
      return {
        success: true,
        action: "updated",
        message: "ステータスを売り切れに更新しました",
      };
    } else {
      return {
        success: false,
        action: "error",
        message: "レコードの更新に失敗しました",
      };
    }
  }

  const needsUpdate =
    (detailResult.price !== undefined &&
      detailResult.price !== crawlResult.price) ||
    (detailResult.name !== undefined &&
      detailResult.name !== crawlResult.name) ||
    (detailResult.imageUrl !== undefined &&
      detailResult.imageUrl !== crawlResult.imageUrl);

  if (needsUpdate) {
    const updated = await update(db, crawlResult.id, {
      price: detailResult.price,
      name: detailResult.name,
      imageUrl: detailResult.imageUrl,
      sellingStatus: detailResult.sellingStatus,
    });

    if (updated) {
      return {
        success: true,
        action: "updated",
        message: "商品情報を更新しました",
      };
    } else {
      return {
        success: false,
        action: "error",
        message: "レコードの更新に失敗しました",
      };
    }
  }

  return {
    success: true,
    action: "no_change",
    message: "変更はありませんでした",
  };
}

async function handleSoldOutItem(
  db: Database,
  crawlResult: MercariCrawlResult,
  detailResult: MercariDetailResult
): Promise<{
  success: boolean;
  action: "updated" | "deleted" | "no_change" | "error";
  message?: string;
}> {
  if (detailResult.soldOutAt) {
    const updated = await update(db, crawlResult.id, {
      soldOutAt: detailResult.soldOutAt,
      price: detailResult.price,
      name: detailResult.name,
      imageUrl: detailResult.imageUrl,
    });

    if (updated) {
      return {
        success: true,
        action: "updated",
        message: "売り切れ日を更新しました",
      };
    } else {
      return {
        success: false,
        action: "error",
        message: "レコードの更新に失敗しました",
      };
    }
  }

  if (detailResult.exists) {
    const updated = await update(db, crawlResult.id, {
      soldOutAt: new Date().toISOString(),
      price: detailResult.price,
      name: detailResult.name,
      imageUrl: detailResult.imageUrl,
    });

    if (updated) {
      return {
        success: true,
        action: "updated",
        message: "売り切れ日を設定しました",
      };
    } else {
      return {
        success: false,
        action: "error",
        message: "レコードの更新に失敗しました",
      };
    }
  }

  return {
    success: true,
    action: "no_change",
    message: "変更はありませんでした",
  };
}
