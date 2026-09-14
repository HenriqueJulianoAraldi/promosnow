"use client";
import { useFormStatus } from "react-dom";
export function Submit({
  children,
  disabled = false,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      className="button dark"
      type="submit"
      disabled={disabled || pending}
    >
      {pending ? "Aguarde…" : children}
    </button>
  );
}
