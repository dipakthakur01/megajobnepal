"use client";

import * as React from "react";
import { cn } from "./utils";

// Type definitions
interface FormContextValue {
  errors?: Record<string, string>;
  values?: Record<string, any>;
  setValue?: (name: string, value: any) => void;
}

interface FormFieldContextValue {
  name: string;
}

interface FormItemContextValue {
  id: string;
}

// Simple form context
const FormContext = React.createContext<FormContextValue>({});

// Form provider component
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  errors?: Record<string, string>;
  values?: Record<string, any>;
  onValueChange?: (name: string, value: any) => void;
}

function Form({ children, errors, values, onValueChange, ...props }: FormProps) {
  return (
    <FormContext.Provider value={{ errors, values, setValue: onValueChange }}>
      <form {...props}>
        {children}
      </form>
    </FormContext.Provider>
  );
}

// Form field context
const FormFieldContext = React.createContext<FormFieldContextValue>({ name: "" });

interface FormFieldProps {
  name: string;
  children: React.ReactNode;
}

function FormField({ name, children }: FormFieldProps) {
  return (
    <FormFieldContext.Provider value={{ name }}>
      {children}
    </FormFieldContext.Provider>
  );
}

// Form item context
const FormItemContext = React.createContext<FormItemContextValue>({ id: "" });

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

function FormItem({ className, ...props }: FormItemProps) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

function FormLabel({ className, ...props }: FormLabelProps) {
  const { errors } = React.useContext(FormContext);
  const { name } = React.useContext(FormFieldContext);
  const { id } = React.useContext(FormItemContext);
  const hasError = errors && errors[name];

  return (
    <label
      data-slot="form-label"
      data-error={!!hasError}
      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", hasError && "text-destructive", className)}
      htmlFor={`${id}-form-item`}
      {...props}
    />
  );
}

interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function FormControl({ children, ...props }: FormControlProps) {
  const { errors } = React.useContext(FormContext);
  const { name } = React.useContext(FormFieldContext);
  const { id } = React.useContext(FormItemContext);
  const hasError = errors && errors[name];

  return (
    <div
      data-slot="form-control"
      id={`${id}-form-item`}
      aria-describedby={`${id}-form-item-description`}
      aria-invalid={!!hasError}
      {...props}
    >
      {children}
    </div>
  );
}

interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

function FormDescription({ className, ...props }: FormDescriptionProps) {
  const { id } = React.useContext(FormItemContext);

  return (
    <p
      data-slot="form-description"
      id={`${id}-form-item-description`}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

function FormMessage({ className, ...props }: FormMessageProps) {
  const { errors } = React.useContext(FormContext);
  const { name } = React.useContext(FormFieldContext);
  const { id } = React.useContext(FormItemContext);
  const error = errors && errors[name];

  if (!error && !props.children) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={`${id}-form-item-message`}
      className={cn("text-sm text-destructive", className)}
      {...props}
    >
      {error || props.children}
    </p>
  );
}

// Hook to use form field
function useFormField() {
  const { errors, values, setValue } = React.useContext(FormContext);
  const { name } = React.useContext(FormFieldContext);
  const { id } = React.useContext(FormItemContext);

  return {
    id,
    name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    error: errors && errors[name],
    value: values && values[name],
    setValue: setValue ? (value: any) => setValue(name, value) : undefined,
  };
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
