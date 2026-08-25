import React from 'react'
import { Coins, LogOut, Menu, MessageSquare, PanelLeftIcon, PanelRight, PenBoxIcon, PenSquare, Plus, User, X, Code2, FileText, Presentation, ImageIcon, Globe, Command } from "lucide-react"
import { useState } from 'react'
import { useEffect } from 'react'
import { getConversations } from '../features/getConversations'
import { useDispatch, useSelector } from 'react-redux'
import { addConversation, setConversations, setSelectedConversation } from '../redux/conversationSlice'
import { setSelectedAgent } from '../redux/agentSlice'
import { createConversation } from '../features/createConversation'
import logOut from '../features/logOut'
import { setUserdata } from '../redux/userSlice'
import BillingDrawer from './BillingDrawer'
function SideBar() {
    const [collapsed, setCollapsed] = useState(false)
    const dispatch = useDispatch()
    const [imageError, setImageError] = useState(false)
    const { conversations, selectedConversation } = useSelector(state => state.conversation)
    const { userData } = useSelector(state => state.user)
    const { selectedAgent } = useSelector(state => state.agent)
    const [showBilling, setShowBilling] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    const agentMenuItems = [
        { id: 'Chat', icon: MessageSquare, label: 'Chat' },
        { id: 'Coding', icon: Code2, label: 'Coding' },
        { id: 'PDF', icon: FileText, label: 'PDF' },
        { id: 'PPT', icon: Presentation, label: 'PPT' },
        { id: 'Vision', icon: ImageIcon, label: 'Vision' },
        { id: 'Search', icon: Globe, label: 'Search' },
    ]
    useEffect(() => {
        const getConv = async () => {
            const data = await getConversations()
            dispatch(setConversations(data))
        }
        getConv()
    }, [userData?._id])

    const handleCreateConversation = async () => {
        const data = await createConversation()
        dispatch(addConversation(data))
    }

    return (
        <>
         
       <button className='lg:hidden fixed top-3.5 left-4 z-50 flex items-center justify-center w-8 h-8 rounded-lg bg-[#0d0f14] border border-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors duration-150 cursor-pointer' onClick={()=>setMobileOpen(true)}>
            <Menu size={14}/>
         </button>

         {mobileOpen && <div onClick={()=>setMobileOpen(false)} className='lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm'/>}
  


        <div className={` fixed lg:static inset-y-0 left-0 z-50
        w-[270px] h-screen shrink-0
        dark:bg-[#0d0f14] light:bg-white border-r dark:border-white/[0.06] light:border-gray-200
        transition-transform duration-250
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
`}
      >

            

            <div className='flex flex-col h-full'>
                {/* Logo Section */}
                <div className='flex items-center gap-3 px-5 py-5'>
                    <img
                        src='/ailogo.png'
                        alt='CortexAI'
                        className='w-9 h-9 object-contain'
                    />
                    <div className='flex flex-col'>
                        <span className='text-[17px] font-bold dark:text-white light:text-gray-900 tracking-tight'>
                            Cortex<span className='text-indigo-500'>AI</span>
                        </span>
                        <span className='text-[11px] dark:text-slate-500 light:text-gray-500'>
                            Your AI Copilot
                        </span>
                    </div>
                    <button  
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden ml-auto flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* New Chat Button */}
                <div className='px-4 pb-4'>
                    <button 
                        className='w-full flex items-center justify-center gap-2.5 text-[14px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl py-3 border-none cursor-pointer transition-all duration-150 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                        onClick={() => dispatch(setSelectedConversation(null))}
                    >
                        <Plus size={18} />
                        New Chat
                        <div className='ml-auto flex items-center gap-1 text-[11px] bg-white/10 px-2 py-0.5 rounded'>
                            <Command size={10} />
                            <span>K</span>
                        </div>
                    </button>
                </div>

                {/* Agent Selection Menu */}
                <div className='px-3 pb-3'>
                    {agentMenuItems.map((agent) => {
                        const isActive = selectedAgent === agent.id
                        const Icon = agent.icon
                        return (
                            <button
                                key={agent.id}
                                onClick={() => dispatch(setSelectedAgent(agent.id))}
                                className={`w-full flex items-center gap-3 px-3.5 py-3 mb-1 rounded-lg text-[14px] font-medium border-none cursor-pointer transition-all duration-150
                                    ${isActive 
                                        ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]' 
                                        : 'bg-transparent dark:text-slate-400 light:text-gray-600 hover:bg-white/[0.05] dark:hover:bg-white/[0.05] light:hover:bg-gray-100'
                                    }`}
                            >
                                <Icon size={18} />
                                {agent.label}
                            </button>
                        )
                    })}
                </div>

                {/* Recent Chats Section */}
                <div className='flex-1 overflow-y-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                    <div className='flex items-center justify-between px-2 py-3'>
                        <span className='text-[12px] font-semibold dark:text-slate-600 light:text-gray-500'>
                            Recent Chats
                        </span>
                        <button className='text-[12px] font-semibold text-indigo-500 hover:text-indigo-400 bg-transparent border-none cursor-pointer'>
                            View all
                        </button>
                    </div>

                    {conversations.length === 0 ? (
                        <div className='px-3 py-4 text-center'>
                            <p className='text-[13px] dark:text-slate-600 light:text-gray-500'>
                                No conversations yet
                            </p>
                        </div>
                    ) : (
                        conversations.map((conv, i) => {
                            const isActive = selectedConversation?._id == conv?._id
                            return (
                                <div
                                    key={i}
                                    onClick={() => dispatch(setSelectedConversation(conv))}
                                    className={`flex items-center gap-3 cursor-pointer mb-1 px-3 py-3 rounded-lg transition-all duration-150
                                        ${isActive 
                                            ? "bg-white/[0.05] dark:bg-white/[0.05] light:bg-gray-100" 
                                            : "hover:bg-white/[0.03] dark:hover:bg-white/[0.03] light:hover:bg-gray-50"
                                        }`}
                                >
                                    <MessageSquare size={16} className={`shrink-0 ${isActive ? 'dark:text-slate-300 light:text-gray-700' : 'dark:text-slate-600 light:text-gray-500'}`} />
                                    <div className='flex-1 min-w-0'>
                                        <span className={`text-[13px] font-medium truncate block ${isActive ? 'dark:text-slate-200 light:text-gray-900' : 'dark:text-slate-400 light:text-gray-600'}`}>
                                            {conv?.title || "New Chat"}
                                        </span>
                                        <span className='text-[11px] dark:text-slate-600 light:text-gray-500'>
                                            {new Date(conv?.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* User Profile Section */}
                <div className='border-t dark:border-white/[0.06] light:border-gray-200 px-3.5 py-3.5'>
                    {userData ? (
                        <div className='flex items-center gap-3 cursor-pointer rounded-xl px-3 py-3 hover:bg-white/[0.03] dark:hover:bg-white/[0.03] light:hover:bg-gray-50 transition-colors duration-150'>
                            <div className='relative shrink-0'>
                                {(userData?.avatar && !imageError) ? (
                                    <img
                                        className='w-10 h-10 rounded-full object-cover border-2 border-indigo-500/30'
                                        src={userData?.avatar}
                                        alt={"avatar"}
                                        onError={() => setImageError(true)} 
                                    />
                                ) : (
                                    <div className='w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[15px] font-semibold'>
                                        {userData?.name?.charAt(0).toUpperCase() || 'N'}
                                    </div>
                                )}
                            </div>
                            <div className='flex-1 min-w-0'>
                                <p className='text-[14px] font-semibold dark:text-slate-100 light:text-gray-900 truncate'>
                                    {userData?.name || "User"}
                                </p>
                                <p className='text-[12px] dark:text-slate-600 light:text-gray-500 capitalize'>
                                    {userData?.plan || "Free"} Plan
                                </p>
                            </div>
                            <div className='flex gap-1'>
                                <button 
                                    onClick={(e) => {e.stopPropagation(); setShowBilling(true)}}
                                    className='flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-yellow-600 cursor-pointer hover:bg-white/[0.08] transition-all duration-150'
                                >
                                    <Coins size={16} />
                                </button>
                                <button 
                                    className='flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent dark:text-slate-600 light:text-gray-500 cursor-pointer hover:bg-white/[0.08] dark:hover:text-slate-400 light:hover:text-gray-700 transition-all duration-150'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        logOut();
                                        dispatch(setUserdata(null))
                                    }}
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button className='w-full flex items-center justify-center gap-2 text-sm font-medium dark:text-slate-200 light:text-gray-900 bg-white/[0.05] dark:bg-white/[0.05] light:bg-gray-100 border border-white/[0.08] dark:border-white/[0.08] light:border-gray-200 rounded-xl py-3 cursor-pointer hover:bg-white/[0.08] dark:hover:bg-white/[0.08] light:hover:bg-gray-200 transition-colors duration-150'>
                            Login
                        </button>
                    )}
                </div>
            </div>

        </div>

        
           <BillingDrawer
           open={showBilling}
           onClose={()=>setShowBilling(false)}
           />

        </>
    )




}

export default SideBar
