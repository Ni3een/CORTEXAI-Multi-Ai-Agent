import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import MessageBubble from './MessageBubble'
import LoadingAnimation from './LoadingAnimation'

function MessageList() {
    const { selectedConversation } = useSelector(state => state.conversation)
    const { messages, isLoading } = useSelector(state => state.message)
    const bottemRef = useRef(null)

    useEffect(() => {
        requestAnimationFrame(() => {
            bottemRef?.current?.scrollIntoView({
                behavior: "smooth",
                block: "end"
            })
        })
    }, [messages?.length, isLoading])

    const featureCards = [
        {
            gradient: "from-purple-600 via-purple-700 to-indigo-800",
            bgGlow: "bg-purple-500/20",
            icon: (
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                    <line x1="12" y1="2" x2="12" y2="6" />
                    <line x1="12" y1="18" x2="12" y2="22" />
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                </svg>
            ),
            title: "Write a Netflix clone",
            desc: "Full-stack project with auth, UI, and deployment.",
        },
        {
            gradient: "from-teal-600 via-emerald-700 to-green-800",
            bgGlow: "bg-emerald-500/20",
            icon: (
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
            ),
            title: "Explain Redis",
            desc: "In-memory data structure store and caching.",
        },
        {
            gradient: "from-orange-600 via-amber-700 to-yellow-800",
            bgGlow: "bg-orange-500/20",
            icon: (
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6m5.2-14.2-4.2 4.2m0 6 4.2 4.2M23 12h-6m-6 0H1m14.2 5.2-4.2-4.2m0-6-4.2-4.2" />
                </svg>
            ),
            title: "Build a dashboard",
            desc: "Metrics, charts, and live data views.",
        },
    ]

    return (
        <div className='flex-1 overflow-y-auto px-6 py-6 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden relative'>

            {messages.length == 0 || !selectedConversation ? (
                <div className="h-full flex flex-col items-center justify-center gap-10 text-center px-4 relative overflow-hidden">

                    {/* Decorative Background Elements */}
                    {/* Left Planet */}
                    <div className="absolute left-0 bottom-20 w-80 h-80 rounded-full bg-gradient-to-br from-purple-600/30 to-indigo-900/40 blur-3xl" 
                         style={{ transform: 'translate(-30%, 20%)' }} />
                    
                    {/* Right Planet */}
                    <div className="absolute right-0 top-20 w-96 h-96 rounded-full bg-gradient-to-bl from-violet-600/30 to-purple-900/40 blur-3xl" 
                         style={{ transform: 'translate(30%, -20%)' }} />
                    
                    {/* Small orbital circles */}
                    <div className="absolute left-10 top-1/4 w-3 h-3 rounded-full bg-purple-400/60 animate-pulse" />
                    <div className="absolute right-20 bottom-1/3 w-2 h-2 rounded-full bg-indigo-400/60 animate-pulse delay-75" />
                    <div className="absolute left-1/4 bottom-20 w-2.5 h-2.5 rounded-full bg-violet-400/60 animate-pulse delay-150" />

                    {/* Stars */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(30)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-0.5 h-0.5 bg-white/30 rounded-full animate-pulse"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 3}s`,
                                    animationDuration: `${2 + Math.random() * 3}s`
                                }}
                            />
                        ))}
                    </div>

                    {/* Logo with enhanced glow */}
                    <div className="relative flex items-center justify-center z-10">
                        <div className="absolute w-96 h-96 rounded-full bg-indigo-500/20 blur-[100px] animate-pulse" />
                        <div className="absolute w-80 h-80 rounded-full bg-violet-500/25 blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
                        <div className="relative">
                            <img
                                src="/cortexaiwobackground.png"
                                alt="CortexAI"
                                className="relative w-48 h-48 object-contain drop-shadow-[0_0_60px_rgba(139,92,246,0.8)]"
                            />
                        </div>
                    </div>

                    {/* Title Section with improved styling */}
                    <div className="flex flex-col gap-3 max-w-2xl z-10">
                        <h1 className="text-5xl font-bold text-white tracking-tight">
                            Cortex<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AI</span>
                        </h1>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.25em]">
                            Think Smarter. Build Faster.
                        </p>
                        <p className="text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 mt-2">
                            Every thread, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">one train of thought.</span>
                        </p>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-xl mx-auto mt-1">
                            Ask a question, drop a file, or start building — Cortex keeps the context so you don't have to repeat yourself.
                        </p>
                    </div>

                    {/* Feature Cards with enhanced design */}
                    <div className="flex flex-wrap justify-center gap-4 w-full max-w-4xl z-10">
                        {featureCards.map((card, i) => (
                            <div
                                key={i}
                                className="group relative flex-1 min-w-[240px] max-w-[280px] bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 text-left hover:border-white/[0.15] transition-all duration-300 cursor-pointer overflow-hidden"
                                style={{
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                                    transform: 'translateY(0)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(139, 92, 246, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.4)';
                                }}
                            >
                                {/* Card background glow */}
                                <div className={`absolute inset-0 ${card.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`} />
                                
                                {/* Window dots decoration */}
                                <div className="flex gap-1.5 mb-4">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                                </div>

                                {/* Icon container */}
                                <div className="relative mb-4">
                                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg text-white group-hover:scale-110 transition-transform duration-300`}>
                                        {card.icon}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="relative">
                                    <h3 className="text-base font-semibold text-slate-100 mb-2 group-hover:text-white transition-colors">
                                        {card.title}
                                    </h3>
                                    <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                                        {card.desc}
                                    </p>
                                    
                                    {/* Arrow icon */}
                                    <div className="absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            ) : (
                <div className='space-y-5'>
                    {messages?.map((msg, i) => (
                        <div key={i}>
                            <MessageBubble role={msg?.role} content={msg?.content} images={msg.images || []} />
                        </div>
                    ))}
                    {isLoading && <LoadingAnimation />}
                </div>
            )}

            <div ref={bottemRef} />
        </div>
    )
}

export default MessageList
