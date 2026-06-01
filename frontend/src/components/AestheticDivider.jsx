import { Circle } from 'lucide-react';

export function AestheticDivider() {
    return (
        <div className="mt-24 mb-16 flex items-center justify-center gap-4 text-secondary/30">
            <span className="h-px w-16 bg-gradient-to-r from-transparent to-current"></span>
            <Circle className="w-3 h-3" fill="currentColor" strokeWidth={0} />
            <span className="h-px w-16 bg-gradient-to-l from-transparent to-current"></span>
        </div>
    );
}