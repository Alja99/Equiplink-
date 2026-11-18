import { Link } from "react-router-dom";

export default function Button({
  children,
  to,
  href,
  variant = "primary",
  type = "button",
  className = "",
  ...props
}) {
  const classes = `app-button app-button-${variant} ${className}`.trim();
  if (to) return <Link className={classes} to={to} {...props}>{children}</Link>;
  if (href) return <a className={classes} href={href} {...props}>{children}</a>;
  return <button className={classes} type={type} {...props}>{children}</button>;
}
