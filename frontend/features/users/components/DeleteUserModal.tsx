import { useState } from "react";
import { clientApi } from "~/lib/api";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: any;
}

export default function DeleteUserModal({
  isOpen,
  onClose,
  onSuccess,
  user,
}: DeleteUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await clientApi(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error || "削除に失敗しました");
      }

      const result = await response.json();
      console.log("User deleted successfully:", result);

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err instanceof Error ? err.message : "削除に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg text-error">ユーザーの削除</h3>
        <div className="py-4">
          <p className="text-base-content">
            以下のユーザーを削除しますか？この操作は取り消せません。
          </p>
          <div className="mt-4 p-4 bg-base-200 rounded-lg">
            <p className="font-semibold">メールアドレス: {user?.email}</p>
            <p className="text-sm text-base-content/70">ID: {user?.id}</p>
          </div>
          {error && (
            <div className="alert alert-error mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>
        <div className="modal-action">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            キャンセル
          </button>
          <button
            className="btn btn-error"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                削除中...
              </>
            ) : (
              "削除"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
