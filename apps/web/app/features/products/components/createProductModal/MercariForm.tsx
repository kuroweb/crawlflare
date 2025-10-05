import type {
  UseFormRegister,
  UseFormGetValues,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";

type ProductFormData = {
  name: string;
  mercariSettings?: {
    keyword: string;
    categoryId?: number;
    minPrice: number;
    maxPrice: number;
    enabled: boolean;
  };
};

interface MercariFormProps {
  register: UseFormRegister<ProductFormData>;
  getValues: UseFormGetValues<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
}

export default function MercariForm({
  register,
  getValues,
  setValue,
  errors,
}: MercariFormProps) {
  return (
    <div className="space-y-4">
      <fieldset className="fieldset">
        <legend className="fieldset-legend">検索キーワード</legend>
        <input
          className="input w-full"
          {...register("mercariSettings.keyword", {
            required: "検索キーワードは必須です",
          })}
          placeholder="例: iPhone 15"
        />
        {errors.mercariSettings?.keyword && (
          <p className="text-error text-sm mt-1">
            {errors.mercariSettings.keyword.message}
          </p>
        )}
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">カテゴリID</legend>
        <input
          type="number"
          className="input w-full"
          {...register("mercariSettings.categoryId", {
            min: { value: 0, message: "カテゴリIDは0以上である必要があります" },
          })}
          placeholder="例: 1"
        />
        {errors.mercariSettings?.categoryId && (
          <p className="text-error text-sm mt-1">
            {errors.mercariSettings.categoryId.message}
          </p>
        )}
      </fieldset>

      <div className="grid grid-cols-2 gap-4">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">最低価格（円）</legend>
          <input
            type="number"
            className="input w-full"
            {...register("mercariSettings.minPrice", {
              required: "最低価格は必須です",
              min: { value: 0, message: "価格は0円以上である必要があります" },
            })}
            placeholder="例: 1000"
          />
          {errors.mercariSettings?.minPrice && (
            <p className="text-error text-sm mt-1">
              {errors.mercariSettings.minPrice.message}
            </p>
          )}
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend">最高価格（円）</legend>
          <input
            type="number"
            className="input w-full"
            {...register("mercariSettings.maxPrice", {
              required: "最高価格は必須です",
              min: { value: 0, message: "価格は0円以上である必要があります" },
            })}
            placeholder="例: 50000"
          />
          {errors.mercariSettings?.maxPrice && (
            <p className="text-error text-sm mt-1">
              {errors.mercariSettings.maxPrice.message}
            </p>
          )}
        </fieldset>
      </div>

      <fieldset className="fieldset">
        <legend className="fieldset-legend">設定</legend>
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">有効にする</span>
            <input
              type="checkbox"
              className="checkbox"
              {...register("mercariSettings.enabled")}
            />
          </label>
        </div>
      </fieldset>
    </div>
  );
}
