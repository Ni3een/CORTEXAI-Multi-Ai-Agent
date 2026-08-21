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
            gradient: "from-violet-600 to-purple-700",
            icon: (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
            ),
            title: "Write a Netflix clone",
            desc: "Full-stack build: catalog, player, auth",
        },
        {
            gradient: "from-emerald-500 to-teal-600",
            icon: (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
            ),
            title: "Explain Redis",
            desc: "In-memory stores, caching, pub/sub",
        },
        {
            gradient: "from-orange-500 to-amber-600",
            icon: (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                </svg>
            ),
            title: "Build a dashboard",
            desc: "Metrics, charts, live data views",
        },
    ]

    return (
        <div className='flex-1 overflow-y-auto px-6 py-6 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>

            {messages.length == 0 || !selectedConversation ? (
                <div className="h-full flex flex-col items-center justify-center gap-6 text-center px-4">

                    {/* Logo with glow */}
                    <div className="relative flex items-center justify-center">
                        <div className="absolute w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl" />
                        <div className="absolute w-64 h-64 rounded-full bg-violet-500/15 blur-2xl" />
                        <img
                            src="/cortexaiwobackground.png"
                            alt="CortexAI"
                            className="relative w-64 h-64 object-contain drop-shadow-[0_0_48px_rgba(139,92,246,0.7)]"
                        />
                    </div>

                    {/* Title + tagline + desc */}
                    <div className="flex flex-col gap-2 max-w-md">
                        <h1 className="text-[28px] font-bold text-white tracking-tight">CortexAI</h1>
                        <p className="text-[15px] font-medium text-emerald-400 italic">
                            Every thread, one train of thought.
                        </p>
                        <p className="text-[13px] text-slate-400 leading-relaxed max-w-[340px] mx-auto">
                            Ask a question, drop a file, or start building — Cortex keeps the context so you don't have to repeat yourself.
                        </p>
                    </div>

                    {/* Feature cards */}
                    <div className="flex flex-wrap justify-center gap-3 mt-1 w-full max-w-2xl">
                        {featureCards.map((card, i) => (
                            <div
                                key={i}
                                className="flex-1 min-w-[160px] max-w-[220px] bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 text-left hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200 cursor-pointer group"
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                                    {card.icon}
                                </div>
                                <p className="text-[13px] font-semibold text-slate-100 mb-1 group-hover:text-white transition-colors">
                                    {card.title}
                                </p>
                                <p className="text-[11.5px] text-slate-500 leading-relaxed">
                                    {card.desc}
                                </p>
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
