import * as React from "react";
import { useFormContext, type FieldError } from "react-hook-form";

// ---------------------------------------------------------------------------
// FormFieldContext
// Provided by a wrapper around <Controller> (not shown here, but typically a
// <FormField> component that calls <Controller render=...> and sets this ctx).
// ---------------------------------------------------------------------------
type FormFieldContextValue = {
  name: string; // the field name registered with react-hook-form
};

export const FormFieldContext = React.createContext<
  FormFieldContextValue | undefined
>(undefined);

// ---------------------------------------------------------------------------
// FormItemContext
// Provided by <FormItem>. Exported so form.tsx can import it instead of
// defining its own duplicate — that's what lets useFormField reach it.
// ---------------------------------------------------------------------------
type FormItemContextValue = {
  id: string;
};

export const FormItemContext = React.createContext<
  FormItemContextValue | undefined
>(undefined);

// ---------------------------------------------------------------------------
// useFormField
// Combines both contexts with react-hook-form's formState to derive the
// stable IDs and error state that FormLabel / FormControl / FormMessage need.
// ---------------------------------------------------------------------------
export function useFormField() {
  const fieldCtx = React.useContext(FormFieldContext);
  const itemCtx = React.useContext(FormItemContext);

  if (!fieldCtx) {
    throw new Error("useFormField must be used within a <FormField>");
  }
  if (!itemCtx) {
    throw new Error("useFormField must be used within a <FormItem>");
  }

  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(fieldCtx.name, formState);

  const { id } = itemCtx;

  return {
    // The field name as registered with react-hook-form
    name: fieldCtx.name,

    // Stable, prefixed IDs consumed by FormLabel, FormControl, etc.
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,

    // Spread all react-hook-form field state (invalid, isDirty, error, …)
    ...fieldState,

    // Narrow the type so callers can safely do `error?.message`
    error: fieldState.error as FieldError | undefined,
  };
}