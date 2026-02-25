export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-3rem)]">
            <svg className="h-6 w-6 animate-spin text-neutral-500" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
        </div>
    )
}