import { UI_MOTION } from "./motion";

const SIZE_STYLES = {
  sm: { padding: "6px 12px", fontSize: "0.9rem" },
  md: { padding: "8px 16px", fontSize: "1rem" },
  lg: { padding: "14px 36px", fontSize: "1.2rem" },
};

export default function Button({
  t,
  children,
  variant = "secondary",
  size = "md",
  pill = false,
  style = {},
  ...props
}) {
  const s = SIZE_STYLES[size] || SIZE_STYLES.md;

  const variantStyles = {
    primary: {
      background: t.ink,
      color: t.yellow,
      border: `1.5px solid ${t.border}`,
      boxShadow: t.shadow,
    },
    secondary: {
      background: t.surface,
      color: t.ink,
      border: `1.5px solid ${t.border}`,
      boxShadow: t.shadowSm,
    },
    ghost: {
      background: "transparent",
      color: t.ink,
      border: `1.5px solid ${t.border}`,
      boxShadow: "none",
    },
  };

  return (
    <button
      type="button"
      {...props}
      style={{
        fontFamily: "'Caveat',cursive",
        fontWeight: 700,
        borderRadius: pill ? 20 : 10,
        cursor: "pointer",
        transition: UI_MOTION.standard,
        ...s,
        ...(variantStyles[variant] || variantStyles.secondary),
        ...style,
      }}
    >
      {children}
    </button>
  );
}
