// StatCard.jsx — metric display card
export default function StatCard({ icon: Icon, value, label, iconBg, iconColor }) {
    return (
        <div className="bg-white border border-[#E0DDD6] rounded-xl p-5 shadow-sm">
            {Icon && (
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${iconBg}`}>
                    <Icon size={18} color={iconColor} />
                </div>
            )}
            <div className="text-2xl font-bold text-[#1A1A2E] tracking-tight leading-none">{value}</div>
            <div className="text-xs text-[#7A7A8A] font-medium mt-1">{label}</div>
        </div>
    );
}
