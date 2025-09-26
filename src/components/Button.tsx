import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  className = "",
  disabled = false,
  variant = 'primary',
  size = 'md'
}) => {
  const baseClasses = "font-medium rounded-md hover:cursor-pointer transition-transform duration-150 hover:translate-y-[-1px] active:translate-y-[1px]";
  
  const variantClasses = {
    primary: "bg-primary text-accent",
    secondary: "bg-gray-600 text-white",
    outline: "border border-gray-300 text-gray-700"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-3 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
