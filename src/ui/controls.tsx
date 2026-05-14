import { PropsWithChildren } from "react";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "danger" | "ghost" | "warning";
  size?: "md" | "sm" | "icon";
}) {
  const cls = ["btn"];
  if (variant === "primary") cls.push("btnPrimary");
  if (variant === "danger") cls.push("btnDanger");
  if (variant === "ghost") cls.push("btnGhost");
  if (variant === "warning") cls.push("btnWarning");
  if (size === "sm") cls.push("btnSmall");
  if (size === "icon") cls.push("btnIcon");
  if (className) cls.push(className);
  return <button {...props} className={cls.join(" ")} />;
}

export function Panel({ children }: PropsWithChildren) {
  return <div className="panel">{children}</div>;
}

export function Field({ label, children }: PropsWithChildren<{ label: string }>) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

export function Modal({
  title,
  onClose,
  children
}: PropsWithChildren<{ title: string; onClose: () => void }>) {
  return (
    <div className="modalOverlay" role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div style={{ fontWeight: 700 }}>{title}</div>
          <button className="btn btnSmall" onClick={onClose}>
            Close <span className="kbd">Esc</span>
          </button>
        </div>
        <div className="modalBody">{children}</div>
      </div>
    </div>
  );
}

