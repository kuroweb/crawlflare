import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userFormSchema, type UserFormData } from "~/lib/schemas";
import { clientApi } from "~/lib/api";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateUserModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      const response = await clientApi("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("User created successfully:", result);
        onClose();
        onSuccess?.();
      } else {
        const errorData = (await response.json()) as { error?: string };
        console.error("Failed to create user:", errorData);
        alert(`エラー: ${errorData.error || "ユーザーの作成に失敗しました"}`);
      }
    } catch (error) {
      console.error("Error creating user:", error);
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
          <h3 className="text-lg font-bold">ユーザーを追加</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="divider pt-4">ユーザー情報</div>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">メールアドレス</legend>
              <input
                className="input w-full"
                {...register("email")}
                placeholder="例: user@example.com"
                type="email"
              />
              {errors.email && (
                <p className="text-error text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">パスワード</legend>
              <input
                className="input w-full"
                {...register("password")}
                placeholder="パスワードを入力"
                type="password"
              />
              {errors.password && (
                <p className="text-error text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </fieldset>
            <button type="submit" className="btn btn-primary w-full">
              登録
            </button>
          </form>
        </div>
        <div onClick={onClose} className="modal-backdrop" />
      </div>
    </>
  );
}
