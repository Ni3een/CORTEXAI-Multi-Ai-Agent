import React from 'react'
import { MessageSquare, ChevronRight, MoreVertical } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { setSelectedConversation } from '../redux/conversationSlice'

function RecentChats() {
  const dispatch = useDispatch()
  const { conversations, selectedConversation } = useSelector(state => state.conversation)
  
  // Get the 6 most recent conversations
  const recentChats = conversations.slice(0, 6)

  // Color palette for chat icons (matching the image)
  const iconColors = [
    'bg-purple-500/15 text-purple-400',
    'bg-blue-500/15 text-blue-400',
    'bg-indigo-500/15 text-indigo-400',
    'bg-green-500/15 text-green-400',
    'bg-orange-500/15 text-orange-400',
    'bg-pink-500/15 text-pink-400',
  ]

  // Format time ago
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now'
    
    const now = new Date()
    const chatTime = new Date(timestamp)
    const diffMs = now - chatTime
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const handleChatClick = (conv) => {
    dispatch(setSelectedConversation(conv))
  }

  const handleNewChat = () => {
    dispatch(setSelectedConversation(null))
  }

  return (
    <div className="w-full max-w-[540px] mx-auto px-4">
      {/* New Chat Button */}
      <button
        onClick={handleNewChat}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-2xl py-4 px-6 mb-6 border-none cursor-pointer transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 font-medium text-base"
      >
        <span className="text-2xl font-light">+</span>
        <span>New Chat</span>
        <div className="ml-auto flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-lg text-sm">
          <span className="text-white/90">⌘</span>
          <span className="text-white/90">K</span>
        </div>
      </button>

      {/* Recents Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Recents
        </h2>
        <button className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 bg-transparent border-none cursor-pointer transition-colors duration-150">
          <span>View all</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Recent Chats List */}
      <div className="flex flex-col gap-2">
        {recentChats.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No recent conversations
          </div>
        ) : (
          recentChats.map((chat, index) => {
            const isActive = selectedConversation?._id === chat._id
            const colorClass = iconColors[index % iconColors.length]
            
            return (
              <div
                key={chat._id}
                onClick={() => handleChatClick(chat)}
                className={`
                  group relative flex items-center gap-3.5 px-5 py-3.5 rounded-2xl cursor-pointer
                  border transition-all duration-200
                  ${isActive 
                    ? 'bg-slate-800/60 border-slate-700/50' 
                    : 'bg-slate-900/40 border-slate-800/40 hover:bg-slate-800/50 hover:border-slate-700/50'
                  }
                `}
              >
                {/* Chat Icon */}
                <div className={`flex items-center justify-center shrink-0 w-10 h-10 rounded-xl ${colorClass} transition-all duration-200`}>
                  <MessageSquare size={18} strokeWidth={2.5} />
                </div>

                {/* Chat Title */}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-slate-100 truncate">
                    {chat.title || 'New Chat'}
                  </p>
                </div>

                {/* Time and Menu */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-500 font-medium">
                    {getTimeAgo(chat.updatedAt || chat.createdAt)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // Add menu logic here if needed
                    }}
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 bg-transparent border-none cursor-pointer transition-all duration-150 opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default RecentChats
