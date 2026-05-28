"use client";

import { deleteQuestion } from "./actions";
import { useTransition } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (window.confirm("確定要刪除這道題目嗎？")) {
      startTransition(async () => {
        const result = await deleteQuestion(id);
        if (result.error) {
          alert(result.error);
        }
      });
    }
  };

  return (
    <button 
      type="button" 
      onClick={handleDelete} 
      className="button ghost" 
      style={{ color: "var(--color-red-600)" }}
      disabled={isPending}
    >
      {isPending ? "刪除中..." : "刪除"}
    </button>
  );
}
