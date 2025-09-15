import React, { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string; // forwarded to <input>
  disabled?: boolean;
  required?: boolean;
  name?: string;
  error?: string;
  label?: string;
  validatePassword?: boolean;
  labelClassName?: string; // NEW: control label color from parent
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = "Enter your password",
  className = "",
  disabled = false,
  required = false,
  name = "password",
  error,
  label,
  validatePassword = false,
  labelClassName = "text-[#646F86]",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  const validatePasswordRequirements = (password: string) => {
    const minLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (!minLength) return "Password must be at least 8 characters long";
    if (!hasLetter) return "Password must contain at least 1 letter";
    if (!hasNumber) return "Password must contain at least 1 number";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (validatePassword && newValue) {
      setValidationError(validatePasswordRequirements(newValue));
    } else {
      setValidationError("");
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className={`block mb-1 text-xs font-semibold ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          aria-invalid={!!error}
          className={[
            "w-full px-4 h-11 pr-10 border rounded",
            "placeholder-[#646F86]",
            error
              ? "border-[#812F1D] ring-2 ring-[#812F1D] bg-[#FAEDEA] focus:ring-[#812F1D] outline-none focus:outline-none"
              : "border-gray-300 focus:ring-2 focus:ring-[#2457A6] outline-none",
            disabled ? "bg-gray-100 cursor-not-allowed" : "",
            className, // parent can force !text color
          ].join(" ")}
          disabled={disabled}
          required={required}
          name={name}
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          {showPassword ? (
            <HugeiconsIcon icon={ViewIcon} />
          ) : (
            <HugeiconsIcon icon={ViewOffSlashIcon} />
          )}
        </button>
      </div>
      {(error || validationError) && (
        <p className="mt-1 text-xs text-[#812F1D]">
          {error || validationError}
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
