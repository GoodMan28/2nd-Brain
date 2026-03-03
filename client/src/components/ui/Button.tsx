import type { ButtonHTMLAttributes, ReactElement } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  text: string;
  startIcon?: ReactElement;
  endIcon?: ReactElement;
}

export function Button({
  variant = "primary",
  size = "md",
  text,
  startIcon,
  endIcon,
  className = "",
  ...props
}: ButtonProps) {

  // 1. Define your variant styles manually
  const variantStyles = {
    primary: "bg-[#6c5ce7] border-[#6c5ce7] text-white hover:bg-[#5a4db8] hover:border-[#5a4db8] hover:ring-4 hover:ring-[#6c5ce7]/30 focus-visible:ring-4 focus-visible:ring-[#6c5ce7]/30",

    secondary: "bg-[#a29bfe] border-[#a29bfe] text-gray-900 hover:bg-[#8b7fc9] hover:border-[#8b7fc9] focus-visible:ring-4 focus-visible:ring-[#a29bfe]/30 outline-none",
  };

  // 2. Define your size styles manually
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  // 3. Define the base styles (layout, rounded corners, etc.)
  const baseStyles = "inline-flex items-center justify-center rounded-lg border-2 font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

  return (
    <button
      // 4. Combine them using a simple Template Literal
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {startIcon && <span className="mr-2 flex items-center">{startIcon}</span>}
      {text}
      {endIcon && <span className="ml-2 flex items-center">{endIcon}</span>}
    </button>
  );
}