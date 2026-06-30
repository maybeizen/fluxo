export default function BetaTag() {
    return (
        <>
            <div className="pointer-events-none fixed top-0 right-0 left-0 z-50 md:hidden">
                <div className="shadow-primary-400/30 from-primary-500 to-primary-500 border-primary-300/40 via-primary-700 w-full border-b bg-gradient-to-r py-1.5 text-white shadow-lg backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-2">
                        <i className="fas fa-flask text-xs text-white opacity-90"></i>
                        <span className="text-xs font-bold tracking-wider uppercase drop-shadow-sm">
                            Beta Version
                        </span>
                        <i className="fas fa-flask text-xs text-white opacity-90"></i>
                    </div>
                </div>
            </div>

            <div className="pointer-events-none fixed top-2 right-2 z-50 hidden md:block">
                <div className="shadow-primary-400/30 from-primary-500 border-primary-300/40 to-primary-700 flex items-center gap-2 rounded-tr-md rounded-bl-md border bg-gradient-to-r px-3 py-1 text-white shadow-md backdrop-blur-sm">
                    <i className="fas fa-flask text-xs text-white opacity-80"></i>
                    <span className="text-xs font-bold tracking-wide uppercase drop-shadow-sm">
                        Beta
                    </span>
                </div>
            </div>
        </>
    )
}
