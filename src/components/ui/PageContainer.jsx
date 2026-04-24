export default function PageContainer({
  children,
  mobile = false,
  maxWidth = 900,
  paddingMobile = "24px 12px",
  paddingDesktop = "40px 24px",
  style = {},
}) {
  return (
    <div
      style={{
        maxWidth,
        margin: "0 auto",
        padding: mobile ? paddingMobile : paddingDesktop,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
