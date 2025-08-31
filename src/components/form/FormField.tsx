import React from "react";
import style from "./ProjectForm.module.scss";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  children,
  error,
  required = false,
}) => {
  return (
    <div className={style.field}>
      <label className={style.label}>
        {label}
        {required && <span className={style.required}>*</span>}
      </label>
      {children}
      {error && <div className={style.error}>{error}</div>}
    </div>
  );
};

export default FormField;
