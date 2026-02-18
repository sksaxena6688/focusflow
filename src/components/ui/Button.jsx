// Button.jsx — reusable button component
export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
    const base = 'inline-flex items-center gap-1.5 font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C4A7C] cursor-pointer border-0';

    const variants = {
        primary: 'bg-[#2C4A7C] text-white hover:bg-[#3D5F99]',
        accent: 'bg-[#4A7C59] text-white hover:bg-[#5D9470]',
        ghost: 'bg-transparent text-[#4A4A5A] border border-[#E0DDD6] hover:bg-[#F0EEE9]',
        danger: 'bg-[#FDECEA] text-[#C0392B] hover:bg-[#C0392B] hover:text-white',
        icon: 'bg-transparent text-[#7A7A8A] hover:bg-[#F0EEE9] hover:text-[#1A1A2E] p-1.5 rounded-md',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base',
    };

    const sizeClass = variant === 'icon' ? '' : sizes[size];

    return (
        <button className={`${base} ${variants[variant]} ${sizeClass} ${className}`} {...props}>
            {children}
        </button>
    );
}
