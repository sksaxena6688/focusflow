// EmptyState.jsx — empty list placeholder
export default function EmptyState({ message = 'Nothing here yet.' }) {
    return (
        <div className="text-center py-10 text-[#7A7A8A] text-sm">
            <div className="text-3xl mb-2 opacity-30">○</div>
            {message}
        </div>
    );
}
