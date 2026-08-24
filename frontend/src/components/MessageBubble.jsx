import { Check, Copy, Download, ExternalLink, Maximize2, ThumbsDown, ThumbsUp, X } from 'lucide-react'
import React from 'react'
import { useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

function MessageBubble({ role, content, images }) {
  const isUser = role === "user"
  const [lightBox, setLightBox] = useState(null)
  const [copiedCode, setCopiedCode] = useState("")
  const [copiedLink, setCopiedLink] = useState(false)

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => {
      setCopiedCode("")
    }, 2000)
  }

  const copyImageLink = async (imageUrl) => {
    await navigator.clipboard.writeText(imageUrl)
    setCopiedLink(true)
    setTimeout(() => {
      setCopiedLink(false)
    }, 2000)
  }

  const downloadImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `cortexai-image-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleAnalyze = () => {
    console.log("Analyzing message:", content)
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-3 group`}>

      {/* AI Avatar - only shown for assistant messages */}
      {!isUser && (
        <div className="shrink-0 w-9 h-9 rounded-full border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center mt-0.5">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="url(#brainGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.69A3 3 0 0 1 5 10a2.99 2.99 0 0 1 2.53-2.95A2.5 2.5 0 0 1 9.5 2Z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.69A3 3 0 0 0 19 10a2.99 2.99 0 0 0-2.53-2.95A2.5 2.5 0 0 0 14.5 2Z"/>
          </svg>
        </div>
      )}

      <div className="flex flex-col gap-2 max-w-[92vw] md:max-w-[72%]">
        
        {/* User Message Bubble */}
        {isUser && (
          <div className="self-end flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white px-4 py-2.5 rounded-2xl rounded-tr-md text-[14px] leading-relaxed break-words">
              {content}
            </div>
            <span className="text-[11px] text-slate-500 shrink-0">12:45 PM</span>
          </div>
        )}

        {/* AI Message Container */}
        {!isUser && (
          <div className="flex flex-col gap-3">
            
            {/* AI Name and Timestamp */}
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-slate-200">CortexAI</span>
              <span className="text-[11px] text-slate-500">12:45 PM</span>
            </div>

            {/* AI Text Response */}
            {content && !content.includes('🎨 **Image Generated Successfully!**') && (
              <div className="text-slate-200 text-[14px] leading-relaxed">
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className='text-2xl font-bold mt-5 mb-3'>{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className='text-xl font-semibold mt-4 mb-2'>{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className='text-lg font-semibold mt-3 mb-2'>{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className='mb-3 whitespace-pre-wrap break-words'>{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className='list-disc pl-5 space-y-1 my-2'>{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className='list-decimal pl-5 space-y-1 my-2'>{children}</ol>
                    ),
                    table: ({ children }) => (
                      <div className='overflow-x-auto my-4'>
                        <table className='min-w-full border border-white/10'>
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className='border border-white/10 bg-white/5 px-3 py-2 text-left'>
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className='border border-white/10 px-3 py-2'>
                        {children}
                      </td>
                    ),
                    a: ({ href, children }) => (
                      <a href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 underline inline-flex items-center gap-1"
                      >
                        {children}
                        <ExternalLink size={14} />
                      </a>
                    ),
                    code: ({ className, children }) => {
                      const value = String(children).trim()
                      
                      if (!className) {
                        return (
                          <code className='px-1.5 py-0.5 rounded bg-white/10 text-indigo-200'>
                            {value}
                          </code>
                        )
                      }

                      const language = className.replace("language-", "")

                      return (
                        <div className='my-4 overflow-hidden rounded-xl border border-white/10 bg-[#111318]'>
                          <div className='flex items-center justify-between bg-[#1b1d24] border-b border-white/10 px-4 py-2'>
                            <span className='uppercase text-xs text-slate-400'>
                              {language}
                            </span>
                            <button className='flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors' 
                              onClick={() => copyCode(value)}>
                              {copiedCode == value ? (
                                <>
                                  <Check size={14}/>
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy size={14} />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>

                          <SyntaxHighlighter
                            language={language}
                            style={oneDark}
                            wrapLongLines
                            showLineNumbers
                            customStyle={{
                              margin: 0,
                              padding: "16px",
                              background: "#0d1117",
                              fontSize: "13px",
                            }}
                          >
                            {value}
                          </SyntaxHighlighter>
                        </div>
                      )
                    },
                  }}
                >
                  {content}
                </Markdown>
              </div>
            )}

            {/* Generated Images with Actions */}
            {images.length > 0 && (
              <div className='flex flex-col gap-3'>
                {images.map((img, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    
                    {/* Image Card */}
                    <div className="relative group/img w-fit">
                      <img
                        src={img}
                        loading="lazy"
                        onError={(e) => e.currentTarget.remove()}
                        className="w-full max-w-md h-auto rounded-2xl object-cover"
                        alt="Generated"
                      />
                      
                      {/* Fullscreen Button */}
                      <button
                        onClick={() => setLightBox(img)}
                        className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover/img:opacity-100 transition-all duration-200 border-none cursor-pointer"
                      >
                        <Maximize2 size={16} />
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2.5">
                      {/* Download Image Button */}
                      <button
                        onClick={() => downloadImage(img)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white text-[13px] font-medium transition-all duration-200 border-none cursor-pointer"
                      >
                        <Download size={16} />
                        Download Image
                        <ExternalLink size={14} className="ml-0.5" />
                      </button>

                      {/* Copy Link Button */}
                      <button
                        onClick={() => copyImageLink(img)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-transparent hover:bg-white/[0.05] text-slate-300 hover:text-white text-[13px] font-medium transition-all duration-200 border border-white/[0.15] hover:border-white/[0.25] cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                        </svg>
                        {copiedLink ? "Copied!" : "Copy Link"}
                      </button>
                    </div>

                    {/* Expiry Warning */}
                    <div className="flex items-center gap-2 text-slate-400 text-[12px]">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>Link expires in 10 minutes.</span>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>

      {/* User Avatar Placeholder */}
      {isUser && (
        <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-white text-[13px] font-semibold mt-0.5">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      )}

      {/* Lightbox */}
      {lightBox && (
        <div className='fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6'>
          <button
            className='absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-colors border-none cursor-pointer'
            onClick={() => setLightBox(null)}
          >
            <X size={20} />
          </button>
          <img
            src={lightBox}
            className="max-w-[90vw] max-h-[85vh] rounded-2xl border border-white/20 shadow-2xl object-contain"
            alt="Fullscreen"
          />
        </div>
      )}
    </div>
  )
}

export default MessageBubble
