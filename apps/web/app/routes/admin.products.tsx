import {
  redirect,
  type LoaderFunctionArgs,
  useLoaderData,
  Link,
} from "react-router";
import { isAuthenticated } from "~/lib/isAuthenticated";
import Layout from "~/components/layouts/Layout";
import { getAllProducts } from "~/models/products";
import { createDb } from "~/db/client";
import { useState } from "react";

export async function loader(args: LoaderFunctionArgs) {
  const authenticated = await isAuthenticated(args);
  if (!authenticated) return redirect("/admin/login");

  const db = createDb(args.context.cloudflare.env);
  const products = await getAllProducts(db);

  return { products, authenticated };
}

export default function AdminProducts() {
  const { products, authenticated } = useLoaderData<typeof loader>();
  const [modal, setModal] = useState<boolean>(false);
  const [tab, setTab] = useState<string | null>("メルカリ");

  return (
    <>
      <Layout authenticated={authenticated}>
        <div className="grid grid-cols-1 gap-4">
          <div className="card w-full bg-base-200">
            <div className="card-body">
              <h2 className="card-title">計測管理</h2>
              {/* modal button */}
              <div className="flex justify-end">
                <div className="btn btn-primary" onClick={() => setModal(true)}>
                  計測対象を追加
                </div>
              </div>
              {/* modal state */}
              <input
                type="checkbox"
                className="modal-toggle"
                checked={modal}
                onChange={(e) => setModal(e.target.checked)}
              />
              {/* modal component */}
              <div className="modal" role="dialog">
                <div className="modal-box h-fit">
                  <div
                    onClick={() => setModal(false)}
                    className="btn btn-circle btn-ghost btn-sm absolute right-4 top-4"
                  >
                    ✕
                  </div>
                  <h3 className="text-lg font-bold">計測設定を追加</h3>
                  <form onSubmit={() => {}}>
                    <div className="divider pt-4">共通設定</div>
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">管理コード</legend>
                      <input className="input w-full"></input>
                    </fieldset>
                    <div className="divider py-6">詳細設定</div>
                    <div className="join flex pb-2">
                      <input
                        className="btn join-item btn-md w-1/3"
                        type="radio"
                        name="options"
                        aria-label="メルカリ"
                        checked={tab === "メルカリ"}
                        onClick={() => {
                          setTab("メルカリ");
                        }}
                      />
                      <input
                        className="btn join-item btn-md w-1/3"
                        type="radio"
                        name="options"
                        aria-label="ヤフオク"
                        checked={tab === "ヤフオク"}
                        onClick={() => {
                          setTab("ヤフオク");
                        }}
                      />
                      <input
                        className="btn join-item btn-md w-1/3"
                        type="radio"
                        name="options"
                        aria-label="じゃんぱら"
                        checked={tab === "じゃんぱら"}
                        onClick={() => {
                          setTab("じゃんぱら");
                        }}
                      />
                    </div>
                    <div className="join flex">
                      <input
                        className="btn join-item btn-md w-1/3"
                        type="radio"
                        name="options"
                        aria-label="イオシス"
                        checked={tab === "イオシス"}
                        onClick={() => {
                          setTab("イオシス");
                        }}
                      />
                      <input
                        className="btn join-item btn-md w-1/3"
                        type="radio"
                        name="options"
                        aria-label="パソコン工房"
                        checked={tab === "パソコン工房"}
                        onClick={() => {
                          setTab("パソコン工房");
                        }}
                      />
                      <input
                        className="btn join-item btn-md w-1/3"
                        type="radio"
                        name="options"
                        aria-label="リコレ"
                        checked={tab === "リコレ"}
                        onClick={() => {
                          setTab("リコレ");
                        }}
                      />
                    </div>
                    <div>
                      {tab === null ||
                        (tab === "メルカリ" && (
                          <div className="py-4">
                            {/* <MercariForm
                            register={register}
                            getValues={getValues}
                            setValue={setValue}
                          /> */}
                          </div>
                        ))}
                      {tab === "ヤフオク" && (
                        <div className="py-4">
                          {/* <YahooAuctionForm
                            register={register}
                            getValues={getValues}
                            setValue={setValue}
                          /> */}
                        </div>
                      )}
                      {tab === "じゃんぱら" && (
                        <div className="py-4">
                          {/* <JanparaForm
                            register={register}
                            getValues={getValues}
                            setValue={setValue}
                          /> */}
                        </div>
                      )}
                      {tab === "イオシス" && (
                        <div className="py-4">
                          {/* <IosysForm
                            register={register}
                            getValues={getValues}
                            setValue={setValue}
                          /> */}
                        </div>
                      )}
                      {tab === "パソコン工房" && (
                        <div className="py-4">
                          {/* <PcKoubouForm
                            register={register}
                            getValues={getValues}
                            setValue={setValue}
                          /> */}
                        </div>
                      )}
                      {tab === "リコレ" && (
                        <div className="py-4">
                          {/* <UsedSofmapForm
                            register={register}
                            getValues={getValues}
                            setValue={setValue}
                          /> */}
                        </div>
                      )}
                    </div>
                    <button type="submit" className="btn btn-primary w-full">
                      登録
                    </button>
                  </form>
                </div>
                <div onClick={() => {}} className="modal-backdrop" />
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>id</th>
                    <th>name</th>
                    <th>created_at</th>
                    <th>updated_at</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="">
                      <td>
                        <div className="font-mono text-sm">{product.id}</div>
                      </td>
                      <td>
                        <div className="font-mono text-sm">{product.name}</div>
                      </td>
                      <td>
                        <div className="text-sm">{product.createdAt}</div>
                      </td>
                      <td>
                        <div className="text-sm">{product.updatedAt}</div>
                      </td>
                      <td className="w-1/12">
                        <div className="dropdown dropdown-left">
                          <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-square btn-md"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              className="inline-block size-5 stroke-current"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                              ></path>
                            </svg>
                          </div>
                          <ul
                            tabIndex={0}
                            className="menu dropdown-content z-[1] w-20 space-y-2 rounded-box bg-base-200 shadow"
                          >
                            <li>
                              <button
                                className="btn btn-primary"
                                onClick={() => {}}
                              >
                                編集
                              </button>
                            </li>
                            <li>
                              <button
                                className="btn btn-error"
                                onClick={() => {}}
                              >
                                削除
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
