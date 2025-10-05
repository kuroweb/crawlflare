import {
  redirect,
  type LoaderFunctionArgs,
  useLoaderData,
  Link,
} from "react-router";
import { isAuthenticated } from "~/lib/isAuthenticated";
import Layout from "~/components/layouts/Layout";
import { getAllProducts } from "../../models/products";
import { createDb } from "db/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productFormSchema, type ProductFormData } from "~/lib/schemas";
import MercariForm from "~/features/products/components/createProductModal/MercariForm";

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

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      mercariSettings: {
        keyword: "",
        categoryId: null,
        minPrice: 0,
        maxPrice: 0,
        enabled: false,
      },
    },
    mode: "onChange",
  });

  // フォーム送信処理
  const onSubmit = async (data: ProductFormData) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Product created successfully:", result);
        setModal(false);
        window.location.reload();
      } else {
        const errorData = (await response.json()) as { error?: string };
        console.error("Failed to create product:", errorData);
        alert(`エラー: ${errorData.error || "商品の作成に失敗しました"}`);
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert("ネットワークエラーが発生しました。もう一度お試しください。");
    }
  };

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
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="divider pt-4">共通設定</div>
                    <fieldset className="fieldset">
                      <legend className="fieldset-legend">商品名</legend>
                      <input
                        className="input w-full"
                        {...register("name")}
                        placeholder="例: iPhone 15 Pro Max"
                      />
                      {errors.name && (
                        <p className="text-error text-sm mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </fieldset>
                    <div className="divider py-6">メルカリ設定</div>
                    <div>
                      <div className="py-4">
                        <MercariForm
                          register={register}
                          getValues={getValues}
                          setValue={setValue}
                          errors={errors}
                        />
                      </div>
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
