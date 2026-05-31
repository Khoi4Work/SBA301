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
                               })  {
    const [isFocused, setIsFocused] = useState(false);

return (
    <div className="group relative">
        <label htmlFor={name}
            className={`block font-body text-sm font-semibold mb-2 transition-all duration-400 ease-in-out ${
        isFocused
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
            required
            minLength={minLength}
            maxLength={maxLength}
            pattern={pattern}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="signature-input w-full bg-transparent py-2 text-on-surface font-body placeholder:text-outline-variant/50 focus:ring-0"
        />
    </div>
    );
}