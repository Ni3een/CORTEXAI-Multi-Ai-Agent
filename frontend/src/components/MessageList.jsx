import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import MessageBubble from './MessageBubble'
import LoadingAnimation from './LoadingAnimation'
import { Code2, FileText, Globe, MessageSquare, Search as SearchIcon } from 'lucide-react'

function MessageList() {
    const { selectedConversation } = useSelector(state => state.conversation)
    const { messages, isLoading } = useSelector(state => state.message)
    const { userData } = useSelector(state => state.user)
    const bottemRef = useRef(null)
    const dispatch = useDispatch()

    useEffect(() => {
        requestAnimationFrame(() => {
            bottemRef?.current?.scrollIntoView({
                behavior: "smooth",
                block: "end"
            })
        })
    }, [messages?.length, isLoading])

    const suggestionCards = [
        {
            gradient: "from-purple-600 to-indigo-600",
            icon: MessageSquare,
            title: "Explain a concept",
            desc: "Quantum computing in simple terms",
            prompt: "Explain quantum computing in simple terms",
            iconBg: "bg-purple-600"
        },
        {
            gradient: "from-amber-500 to-orange-600",
            icon: Code2,
            title: "Write code",
            desc: "Python function to check prime number",
            prompt: "Write a Python function to check if a number is prime",
            iconBg: "bg-amber-500"
        },
        {
            gradient: "from-red-500 to-rose-600",
            icon: FileText,
            title: "Summarize PDF",
            desc: "Key takeaways from this document",
            prompt: "Summarize the key takeaways from this document",
            iconBg: "bg-red-500"
        },
        {
            gradient: "from-blue-500 to-cyan-500",
            icon: SearchIcon,
            title: "Research anything",
            desc: "Latest AI trends in 2024",
            prompt: "What are the latest AI trends in 2024?",
            iconBg: "bg-blue-500"
        },
    ]

    const handleSuggestionClick = (prompt) => {
        // This will trigger the input to be filled - can be enhanced to auto-send
        const event = new CustomEvent('fillChatInput', { detail: { prompt } })
        window.dispatchEvent(event)
    }

    return (
        <div className='flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden dark:bg-[#0d0f14] light:bg-gray-50'>

            {messages.length == 0 || !selectedConversation ? (
                <div className="h-full flex flex-col items-center justify-center gap-6 text-center px-4 max-w-4xl mx-auto">

                    {/* Welcome Icon with Sparkle */}
                    <div className="relative flex items-center justify-center mb-2">
                        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 dark:from-indigo-600/20 dark:to-purple-600/20 light:from-indigo-100 light:to-purple-100 flex items-center justify-center border border-indigo-500/30 dark:border-indigo-500/30 light:border-indigo-300">
                            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="url(#sparkleGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <defs>
                                    <linearGradient id="sparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#818cf8" />
                                        <stop offset="100%" stopColor="#a78bfa" />
                                    </linearGradient>
                                </defs>
                                <path d="M12 2L15 8.5L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L9 8.5L12 2Z" fill="url(#sparkleGrad)" fillOpacity="0.2"/>
                            </svg>
                        </div>
                    </div>

                    {/* Welcome Message */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-[32px] font-bold dark:text-white light:text-gray-900 tracking-tight">
                            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">{userData?.name?.split(' ')[0] || 'Nitin'}!</span> 👋
                        </h1>
                        <p className="text-[15px] dark:text-slate-400 light:text-gray-600 leading-relaxed">
                            How can I help you today?
                        </p>
                    </div>

                    {/* Suggestion Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 w-full">
                        {suggestionCards.map((card, i) => {
                            const Icon = card.icon
                            return (
                                <div
                                    key={i}
                                    onClick={() => handleSuggestionClick(card.prompt)}
                                    className="group flex flex-col gap-3 bg-white/[0.02] dark:bg-white/[0.02] light:bg-white border border-white/[0.06] dark:border-white/[0.06] light:border-gray-200 rounded-2xl p-4 text-left hover:bg-white/[0.05] dark:hover:bg-white/[0.05] light:hover:bg-gray-50 hover:border-white/[0.1] dark:hover:border-white/[0.1] light:hover:border-gray-300 transition-all duration-200 cursor-pointer"
                                >
                                    <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center shadow-lg`}>
                                        <Icon size={20} className="text-white" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-[13px] font-semibold dark:text-slate-100 light:text-gray-900 group-hover:text-white dark:group-hover:text-white light:group-hover:text-gray-900 transition-colors">
                                            {card.title}
                                        </p>
                                        <p className="text-[11.5px] dark:text-slate-500 light:text-gray-500 leading-relaxed">
                                            {card.desc}
                                        </p>
                                    </div>
                                    {/* Arrow Icon */}
                                    <div className="flex justify-end">
                                        <svg 
                                            viewBox="0 0 24 24" 
                                            width="16" 
                                            height="16" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                            className="dark:text-slate-600 light:text-gray-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-500 light:group-hover:text-indigo-600 transition-colors"
                                        >
                                            <line x1="5" y1="12" x2="19" y2="12"/>
                                            <polyline points="12 5 19 12 12 19"/>
                                        </svg>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                </div>
            ) : (
                <div className='space-y-5'>
                    {messages?.map((msg, i) => (
                        <div key={i}>
                            <MessageBubble 
                                role={msg?.role} 
                                content={msg?.content} 
                                images={msg.images || []} 
                                createdAt={msg?.createdAt}
                            />
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
