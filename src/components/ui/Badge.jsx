// Badge.jsx — priority / status badge
const VARIANTS = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-amber-50 text-amber-700',
    high: 'bg-red-50 text-red-700',
    success: 'bg-green-50 text-green-700',
    primary: 'bg-[#EBF0F8] text-[#2C4A7C]',
    accent: 'bg-[#EBF5EE] text-[#4A7C59]',
    warn: 'bg-amber-50 text-amber-700',
};

export default function Badge({ children, variant = 'primary', className = '' }) {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.7rem] font-semibold uppercase tracking-wide ${VARIANTS[variant] ?? VARIANTS.primary} ${className}`}>
            {children}
        </span>
    );
}
