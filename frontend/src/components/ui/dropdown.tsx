import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { ErrorMsg, Label } from "../common";

type Option = {
  label: string;
  value: string;
  icon?: React.ReactNode;
};

interface DropdownProps {
  options: Option[];
  value?: string | null;
  onChange?: (value: Option) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  errorMessage?: string;
  isError?: boolean;
}

const Dropdown = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  disabled = false,
  label,
  required,
  errorMessage,
  isError,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  const updatePosition = () => {
    if (!dropdownRef.current || !menuRef.current) return;

    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current.offsetHeight;
    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - dropdownRect.bottom;
    const spaceAbove = dropdownRect.top;

    setOpenUpward(spaceBelow < menuHeight && spaceAbove > spaceBelow);
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);
    }

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    onChange?.(option);
    setIsOpen(false);
  };

  return (
    <div>
      {label && (
        <Label text={label} required={required} className="mb-1.5 2xl:mb-3" />
      )}
      <div
        className={`relative w-full text-xs 2xl:text-sm ${className}`}
        ref={dropdownRef}
      >
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
          w-full pl-3 pr-2 py-2 text-left border border-gray-200 rounded-md
          flex items-center justify-between gap-2
          ${disabled ? "cursor-not-allowed bg-gray-100" : "hover:bg-gray-50"}
          focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500
        `}
          disabled={disabled}
        >
          <span
            className={`block truncate ${
              !selectedOption ? "text-gray-400" : "text-gray-900"
            }`}
          >
            {selectedOption ? (
              <div className="flex items-center gap-2">
                {selectedOption.icon}
                {selectedOption.label}
              </div>
            ) : (
              placeholder
            )}
          </span>
          <FiChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div
            ref={menuRef}
            className={`
            absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg 
            max-h-60 overflow-y-auto
            ${openUpward ? "bottom-full mb-1" : "top-9 mt-1"}
          `}
          >
            <ul className="py-1">
              {options.length > 0 ? (
                options.map((option) => (
                  <li
                    key={option.value}
                    className={`
                    px-4 py-2 cursor-pointer hover:bg-indigo-50
                    ${
                      option.value === value
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-900"
                    }
                  `}
                    onClick={() => handleSelect(option)}
                  >
                    <div className="flex items-center gap-2">
                      {option.icon}
                      {option.label}
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-400">No options</li>
              )}
            </ul>
          </div>
        )}
        {isError && errorMessage && <ErrorMsg text={errorMessage} />}
      </div>
    </div>
  );
};

export { Dropdown };

