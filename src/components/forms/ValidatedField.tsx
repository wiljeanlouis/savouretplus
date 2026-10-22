import { cloneElement } from "react";

export function ValidatedField({
  id,
  label,
  required = false,
  error = undefined,
  hint = undefined,
  children,
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");
  const control = cloneElement(children, {
    id,
    required,
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy || undefined,
  });

  return (
    <label className="grid gap-2 text-sm font-semibold text-zinc-700" htmlFor={id}>
      <span>
        {label}
        {required ? <span className="ml-1 text-rose-600">*</span> : null}
      </span>
      <div className="[&>input]:h-11 [&>input]:w-full [&>input]:rounded-md [&>input]:border [&>input]:border-zinc-200 [&>input]:bg-white [&>input]:px-3 [&>input[aria-invalid='true']]:border-red-500 [&>input[aria-invalid='true']]:ring-1 [&>input[aria-invalid='true']]:ring-red-200 [&>select]:h-11 [&>select]:w-full [&>select]:rounded-md [&>select]:border [&>select]:border-zinc-200 [&>select]:bg-white [&>select]:px-3 [&>select[aria-invalid='true']]:border-red-500 [&>select[aria-invalid='true']]:ring-1 [&>select[aria-invalid='true']]:ring-red-200 [&>textarea]:w-full [&>textarea]:rounded-md [&>textarea]:border [&>textarea]:border-zinc-200 [&>textarea]:bg-white [&>textarea]:px-3 [&>textarea]:py-2 [&>textarea[aria-invalid='true']]:border-red-500 [&>textarea[aria-invalid='true']]:ring-1 [&>textarea[aria-invalid='true']]:ring-red-200">
        {control}
      </div>
      {hint ? (
        <span className="text-xs font-medium text-zinc-500" id={hintId} aria-live="polite">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="text-sm font-medium text-red-700" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function focusFirstInvalidField() {
  window.requestAnimationFrame(() => {
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  });
}
