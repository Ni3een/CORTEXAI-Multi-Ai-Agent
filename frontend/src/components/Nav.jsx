import { Code2, FileText, Globe, ImageIcon, MessageSquare, Moon, Presentation, Sun, Zap } from 'lucide-react'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedAgent } from '../redux/agentSlice'
import { useTheme } from '../context/ThemeContext'

function Nav() {
  const { selectedConversation } = useSelector(state => state.conversation)
  const { selectedAgent } = useSelector(state => state.agent)
  const dispatch = useDispatch()
  const { theme, toggleTheme } = useTheme()

  const agents = [
    {
      id: "Auto",
      icon: Zap,
      label: "Auto"
    },
    {
      id: "Chat",
      icon: MessageSquare,
      label: "Chat"
    },
    {
      id: "Coding",
      icon: Code2,
      label: "Coding"
    },
    {
      id: "PDF",
      icon: FileText,
      label: "PDF"
    },
    {
      id: "PPT",
      icon: Presentation,
      label: "PPT"
    },
    {
      id: "Vision",
      icon: ImageIcon,
      label: "Vision"
    },
    {
      id: "Search",
      icon: Globe,
      label: "Search"
    }
  ]

  return (
    <div className='h-14 flex items-center justify-between px-5 border-b border-white/[0.06] dark:border-white/[0.06] bg-[#0d0f14] dark:bg-[#0d0f14] light:bg-white light:border-gray-200'>
      
      {/* Left: Logo and Agent Selection */}
      <div className='flex items-center gap-3'>
        {/* Logo */}
        <div className='flex items-center gap-2'>
          <img
            src='/ailogo.png'
            alt='CortexAI'
            className='w-6 h-6 object-contain'
          />
          <span className='text-[15px] font-bold text-white dark:text-white light:text-gray-900'>
            Cortex<span className='text-indigo-500'>AI</span>
          </span>
        </div>

        {/* Agent Selection Pills */}
        <div className='flex items-center gap-2 ml-1'>
          {agents.map((agent) => {
            const isActive = selectedAgent === agent.label
            const Icon = agent.icon
            return (
              <button
                key={agent.id}
                onClick={() => dispatch(setSelectedAgent(agent.label))}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium border-none cursor-pointer transition-all duration-200
                  ${isActive
                    ? "bg-indigo-600 text-white"
                    : "bg-transparent dark:text-slate-400 light:text-gray-600 hover:bg-white/[0.05] dark:hover:bg-white/[0.05] light:hover:bg-gray-100"
                  }
                `}
              >
                <Icon size={16} />
                {agent.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Right: Theme Toggle */}
      <div className='flex items-center gap-3'>
        <button
          onClick={toggleTheme}
          className='flex items-center justify-center w-9 h-9 rounded-lg bg-transparent dark:text-slate-400 light:text-gray-600 hover:bg-white/[0.05] dark:hover:bg-white/[0.05] light:hover:bg-gray-100 border-none cursor-pointer transition-all duration-200'
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  )
}

export default Nav
