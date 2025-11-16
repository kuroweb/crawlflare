import {
  redirect,
  type LoaderFunctionArgs,
  useLoaderData,
} from "react-router";
import { isAuthenticated } from "~/lib/isAuthenticated";
import Layout from "~/components/layouts/Layout";
import { useState } from "react";
import { serverApi, clientApi } from "~/lib/api";

export async function loader(args: LoaderFunctionArgs) {
  const authenticated = await isAuthenticated(args);
  if (!authenticated) return redirect("/admin/login");

  try {
    const response = await serverApi(args.request, "/api/products");

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const apiResponse = (await response.json()) as {
      success: boolean;
      data: any[];
    };
    const products = apiResponse.data || [];

    return { products, authenticated };
  } catch (error) {
    console.error("Error fetching products from API:", error);
    return { products: [], authenticated };
  }
}

export default function AdminCrawl() {
  const { products, authenticated } = useLoaderData<typeof loader>();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executeResult, setExecuteResult] = useState<{
    success: boolean;
    message: string;
    data?: {
      productId: number;
      crawledCount: number;
      deletedCount: number;
      existenceSyncCount: number;
      soldOutSyncCount: number;
    };
  } | null>(null);
  const [crawlResults, setCrawlResults] = useState<any[] | null>(null);
  const [isLoadingResults, setIsLoadingResults] = useState<boolean>(false);

  // メルカリ設定が有効な商品のみをフィルタ
  const enabledProducts = products.filter(
    (product: any) => product.mercariSettings?.enabled === true
  );

  const handleExecuteCrawl = async () => {
    if (!selectedProductId) {
      alert("商品を選択してください");
      return;
    }

    setIsExecuting(true);
    setExecuteResult(null);
    setCrawlResults(null);

    try {
      const response = await clientApi("/api/crawl/execute", {
        method: "POST",
        body: JSON.stringify({ productId: selectedProductId }),
      });

      const result = (await response.json()) as {
        success: boolean;
        message: string;
        data?: {
          productId: number;
          crawledCount: number;
          deletedCount: number;
          existenceSyncCount: number;
          soldOutSyncCount: number;
        };
      };

      setExecuteResult(result);
    } catch (error) {
      console.error("Error executing crawl:", error);
      setExecuteResult({
        success: false,
        message: `エラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleLoadResults = async (productId: number) => {
    setIsLoadingResults(true);
    try {
      const response = await clientApi(`/api/crawl/results/${productId}`);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const apiResponse = (await response.json()) as {
        success: boolean;
        data: any[];
      };

      const results = apiResponse.data || [];
      console.log("Crawl results loaded:", results.length, "items");
      setCrawlResults(results);
    } catch (error) {
      console.error("Error fetching crawl results:", error);
      setCrawlResults([]);
    } finally {
      setIsLoadingResults(false);
    }
  };

  const handleProductChange = (productId: number) => {
    setSelectedProductId(productId);
    setExecuteResult(null);
    setCrawlResults(null);
  };

  return (
    <>
      <Layout authenticated={authenticated}>
        <div className="grid grid-cols-1 gap-4">
          <div className="card w-full bg-base-200">
            <div className="card-body">
              <h2 className="card-title">クロール手動実行（デバッグ）</h2>

              {/* 商品選択 */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">実行対象の商品を選択</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedProductId || ""}
                  onChange={(e) => {
                    const productId = e.target.value
                      ? Number(e.target.value)
                      : null;
                    setSelectedProductId(productId);
                    if (productId) {
                      handleProductChange(productId);
                    } else {
                      setCrawlResults(null);
                    }
                  }}
                >
                  <option value="">選択してください</option>
                  {enabledProducts.map((product: any) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (ID: {product.id})
                    </option>
                  ))}
                </select>
                {enabledProducts.length === 0 && (
                  <label className="label">
                    <span className="label-text-alt text-warning">
                      メルカリ設定が有効な商品がありません
                    </span>
                  </label>
                )}
              </div>

              {/* 実行ボタン */}
              <div className="flex justify-end gap-2">
                <button
                  className="btn btn-primary"
                  onClick={handleExecuteCrawl}
                  disabled={!selectedProductId || isExecuting}
                >
                  {isExecuting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      実行中...
                    </>
                  ) : (
                    "クロール実行"
                  )}
                </button>
                {selectedProductId && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleLoadResults(selectedProductId)}
                    disabled={isLoadingResults}
                  >
                    {isLoadingResults ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        読み込み中...
                      </>
                    ) : (
                      "結果を再読み込み"
                    )}
                  </button>
                )}
              </div>

              {/* 実行結果 */}
              {executeResult && (
                <div
                  className={`alert ${
                    executeResult.success ? "alert-success" : "alert-error"
                  }`}
                >
                  <div>
                    <h3 className="font-bold">
                      {executeResult.success ? "成功" : "エラー"}
                    </h3>
                    <div>{executeResult.message}</div>
                    {executeResult.success && (
                      <div className="text-sm mt-2">
                        クロール処理は非同期で実行されます。処理完了後、結果を再読み込みしてください。
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* クロール結果一覧 */}
              {selectedProductId && (
                <div className="mt-4">
                  <h3 className="text-lg font-bold mb-2">クロール結果</h3>
                  {isLoadingResults ? (
                    <div className="flex justify-center py-8">
                      <span className="loading loading-spinner loading-lg"></span>
                    </div>
                  ) : crawlResults === null ? (
                    <div className="text-center py-8 text-gray-500">
                      結果を読み込んでください
                    </div>
                  ) : crawlResults.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      クロール結果がありません
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="table table-zebra">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>外部ID</th>
                            <th>商品名</th>
                            <th>価格</th>
                            <th>ステータス</th>
                            <th>出品者タイプ</th>
                            <th>売り切れ日</th>
                            <th>更新日時</th>
                          </tr>
                        </thead>
                        <tbody>
                          {crawlResults.map((result: any) => (
                            <tr key={result.id}>
                              <td>
                                <div className="font-mono text-sm">
                                  {result.id}
                                </div>
                              </td>
                              <td>
                                <div className="font-mono text-xs">
                                  {result.externalId}
                                </div>
                              </td>
                              <td>
                                <div className="max-w-xs truncate">
                                  {result.name}
                                </div>
                              </td>
                              <td>
                                <div className="font-mono">
                                  ¥{result.price.toLocaleString()}
                                </div>
                              </td>
                              <td>
                                <div
                                  className={`badge ${
                                    result.sellingStatus === 1
                                      ? "badge-success"
                                      : "badge-error"
                                  }`}
                                >
                                  {result.sellingStatus === 1
                                    ? "販売中"
                                    : "売り切れ"}
                                </div>
                              </td>
                              <td>
                                <div className="badge badge-outline">
                                  {result.sellerType === 1 ? "一般" : "ショップ"}
                                </div>
                              </td>
                              <td>
                                <div className="text-sm">
                                  {result.soldOutAt
                                    ? new Date(result.soldOutAt).toLocaleString(
                                        "ja-JP"
                                      )
                                    : "-"}
                                </div>
                              </td>
                              <td>
                                <div className="text-sm">
                                  {new Date(
                                    result.updatedAt
                                  ).toLocaleString("ja-JP")}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="mt-2 text-sm text-gray-500">
                        合計: {crawlResults.length}件
                      </div>
                    </div>
                  )}

                  {/* ローデータ表示 */}
                  {crawlResults !== null && (
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold">
                          ローデータ（JSON）{crawlResults.length > 0 && `(${crawlResults.length}件)`}
                        </h3>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              JSON.stringify(crawlResults, null, 2)
                            );
                            alert("ローデータをクリップボードにコピーしました");
                          }}
                        >
                          コピー
                        </button>
                      </div>
                      <div className="mockup-code bg-base-300">
                        <pre className="p-4 overflow-x-auto max-h-96 overflow-y-auto">
                          <code className="text-xs">
                            {crawlResults.length === 0
                              ? "[]"
                              : JSON.stringify(crawlResults, null, 2)}
                          </code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

