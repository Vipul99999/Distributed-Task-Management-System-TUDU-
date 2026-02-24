"use client";
interface FormInputProps{
    id:string;
    name:string;
    type:string;
    label: string;
    autoComplete? : string;
    defaultValue : string;
    error ?: {_errors : string[]};
    className?: string; 
}
export default function FormInput({id, label,error, className,...props}:FormInputProps){
  console.log("Rendering FormInput:", { id, label, error, props }); // log props each render

 return(
    <div className="space-y-1">
  <label
    htmlFor={id}
    className="block text-sm font-medium text-gray-700"
  >
    {label}
  </label>

  <input
    id={id}
   
    {...props}
className={`${className ?? ''} mt-1 block w-full rounded-lg border  bg-white
            px-4 py-2.5 text-gray-900 shadow-sm
            placeholder:text-gray-500 transition-all duration-200
            focus:border-blue-500 focus:ring-2
              focus:ring-blue-500/60 focus:outline-none sm:text-sm ${
              error ? "border-red-500 bg-red-100" 
            : "border-gray-200 hover:border-gray-300"}`}

  />
  {
    error && <p
    className="mt-2 text-sm text-red-500">
      {error._errors[0]}
    </p>
  }
</div>
 )
}