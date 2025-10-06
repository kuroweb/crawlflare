import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userFormSchema, type UserFormData } from "~/lib/schemas";

interface UpdateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user: {
    id: number;
    email: string;
    password?: string;
  } | null;
}

export default function UpdateUserModal({
  isOpen,
  onClose,
  onSuccess,
  user,
}: UpdateUserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  // ユーザーデータが変更されたときにフォームをリセット
  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        password: "", // セキュリティのため、パスワードは空にする
      });
    }
  }, [user, reset]);

  // フォーム送信処理
  const onSubmit = async (data: UserFormData) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("User updated successfully:", result);
        onClose();
        onSuccess?.();
      } else {
        const errorData = (await response.json()) as { error?: string };
        console.error("Failed to update user:", errorData);
        alert(`エラー: ${errorData.error || "ユーザーの更新に失敗しました"}`);
      }
    } catch (error) {
      console.error("Error updating user:", error);
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
          <h3 className="text-lg font-bold">ユーザーを編集</h3>
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
                placeholder="新しいパスワードを入力（変更しない場合は空欄）"
                type="password"
              />
              {errors.password && (
                <p className="text-error text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </fieldset>
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
