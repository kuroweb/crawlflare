import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productFormSchema, type ProductFormData } from "~/lib/schemas";
import MercariForm from "./MercariForm";

interface UpdateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  product: {
    id: number;
    name: string;
    mercariSettings?: {
      keyword: string;
      categoryId: number | null;
      minPrice: number;
      maxPrice: number;
      enabled: boolean;
    };
  } | null;
}

export default function UpdateProductModal({
  isOpen,
  onClose,
  onSuccess,
  product,
}: UpdateProductModalProps) {
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    reset,
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

  // 商品データが変更されたときにフォームをリセット
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        mercariSettings: product.mercariSettings || {
          keyword: "",
          categoryId: null,
          minPrice: 0,
          maxPrice: 0,
          enabled: false,
        },
      });
    }
  }, [product, reset]);

  // フォーム送信処理
  const onSubmit = async (data: ProductFormData) => {
    if (!product) return;

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Product updated successfully:", result);
        onClose();
        onSuccess?.();
      } else {
        const errorData = (await response.json()) as { error?: string };
        console.error("Failed to update product:", errorData);
        alert(`エラー: ${errorData.error || "商品の更新に失敗しました"}`);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("ネットワークエラーが発生しました。もう一度お試しください。");
    }
  };

  return (
    <>
      <input
        type="checkbox"
        className="modal-toggle"
        checked={isOpen}
        onChange={(e) => {
          if (!e.target.checked) {
            onClose();
          }
        }}
      />
      <div className="modal" role="dialog">
        <div className="modal-box h-fit">
          <div
            onClick={onClose}
            className="btn btn-circle btn-ghost btn-sm absolute right-4 top-4"
          >
            ✕
          </div>
          <h3 className="text-lg font-bold">計測設定を編集</h3>
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
                <p className="text-error text-sm mt-1">{errors.name.message}</p>
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
              更新
            </button>
          </form>
        </div>
        <div onClick={onClose} className="modal-backdrop" />
      </div>
    </>
  );
}
