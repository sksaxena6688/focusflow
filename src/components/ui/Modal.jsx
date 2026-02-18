// Modal.jsx — reusable modal overlay
export default function Modal({ title, onClose, children, footer }) {
    return (
        <div
            className="fixed inset-0 bg-[#1A1A2E]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#EAE8E3]">
                    <h3 className="text-base font-semibold text-[#1A1A2E]">{title}</h3>
                    <button onClick={onClose} className="text-[#7A7A8A] hover:text-[#1A1A2E] text-lg leading-none transition-colors">✕</button>
                </div>
                <div className="px-6 py-4">{children}</div>
                {footer && (
                    <div className="flex gap-2 justify-end px-6 pb-6 pt-2 border-t border-[#EAE8E3]">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
