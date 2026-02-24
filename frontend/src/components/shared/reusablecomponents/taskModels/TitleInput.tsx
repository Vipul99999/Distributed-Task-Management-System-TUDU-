import { Input } from "@/components/ui/input";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { TaskFormData } from "@/validation/validateSchema";

interface TitleInputProps {
  register: UseFormRegister<TaskFormData>;
  errors: FieldErrors<TaskFormData>;
}

export const TitleInput: React.FC<TitleInputProps> = ({ register, errors }) => (
  <div>
    <label htmlFor="title" className="sr-only">Task title</label>
    <Input
      id="title"
      placeholder="Task title"
      aria-invalid={errors.title ? "true" : "false"}
      aria-describedby={errors.title ? "title-error" : undefined}
      {...register("title")}
    />
    {errors.title && (
      <p id="title-error" role="alert" className="text-red-500 text-sm mt-1">
        {errors.title.message}
      </p>
    )}
  </div>
);
