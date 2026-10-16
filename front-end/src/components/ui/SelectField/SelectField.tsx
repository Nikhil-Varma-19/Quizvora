import { useId } from "react";
import type { ReactNode, SelectHTMLAttributes } from "react";
import "../TextField/TextField.css";
import "./SelectField.css";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
}

export default function SelectField({
  label,
  children,
  ...rest
}: SelectFieldProps) {
  const id = useId();
  return (
    <div className="field">
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <select id={id} className="field__input field__input--plain select" {...rest}>
        {children}
      </select>
    </div>
  );
}
