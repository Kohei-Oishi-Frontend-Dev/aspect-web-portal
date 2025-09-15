import React from "react";

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string; // forwarded to <input>
  disabled?: boolean;
  required?: boolean;
  name?: string;
  error?: string;
  label?: string;
  labelClassName?: string; // NEW: control label color from parent
}

const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChange,
  placeholder = "Enter your email",
  className = "",
  disabled = false,
  required = false,
  name = "email",
  error,
  label,
  labelClassName = "text-[#646F86]",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="w-full">
      {label && (
        <label className={`block mb-1 text-xs font-semibold ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="email"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={[
          "w-full px-4 h-11 border rounded",
          "placeholder-[#646F86]",
          // error look (border/bg/ring). NO fixed text color here; we inherit from parent className.
          error
            ? "border-[#812F1D] ring-2 ring-[#812F1D] bg-[#FAEDEA] focus:ring-[#812F1D] outline-none focus:outline-none"
            : "border-gray-300 focus:ring-2 focus:ring-[#2457A6] outline-none",
          disabled ? "bg-gray-100 cursor-not-allowed" : "",
          className, // <- parent can force !text color etc.
        ].join(" ")}
        disabled={disabled}
        required={required}
        name={name}
      />
      {error && <p className="mt-1 text-xs text-[#812F1D]">{error}</p>}
    </div>
  );
};

export default EmailInput;
