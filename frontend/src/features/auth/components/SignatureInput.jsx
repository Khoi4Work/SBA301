import { useState } from 'react';

export function SignatureInput({
                                   label,
                                   name,
                                   type = 'text',
                                   placeholder,
                                   value,
                                   onChange,
                                   minLength,
                                   maxLength,
                                   pattern,
                                   error,
                                   onFocus,
                                   onBlur,
                                   ...rest
                               })  {
    const [isFocused, setIsFocused] = useState(false);

    const borderClass = error
        ? 'border-red-500 focus:border-red-500'
        : isFocused
            ? 'border-secondary'
            : 'border-outline-variant/50';

    return (
        <div className="group relative w-full flex flex-col">
            <label htmlFor={name}
                className={`block font-body text-sm font-semibold mb-2 transition-all duration-400 ease-in-out ${
                    error
                        ? 'text-red-400'
                        : isFocused
                            ? 'text-secondary tracking-[0.15em]'
                            : 'text-on-tertiary-fixed-variant tracking-[0.05em]'
                }`}
            >
                {label}
            </label>

            <input
                id={name}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                minLength={minLength}
                maxLength={maxLength}
                pattern={pattern}
                onFocus={(e) => {
                    setIsFocused(true);
                    if (onFocus) onFocus(e);
                }}
                onBlur={(e) => {
                    setIsFocused(false);
                    if (onBlur) onBlur(e);
                }}
                className={`w-full bg-transparent py-2 text-on-surface font-body placeholder:text-outline-variant/30 focus:ring-0 border-0 border-b ${borderClass} outline-none transition-colors duration-300`}
                {...rest}
            />

            {error && (
                <p className="mt-1.5 text-xs text-red-400 font-medium font-body leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                    {error}
                </p>
            )}
        </div>
    );
}