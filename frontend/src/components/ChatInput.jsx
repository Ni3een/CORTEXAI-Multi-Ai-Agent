import { FileText, Mic, MicOff, Paperclip, Send, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import sendMessage from '../features/sendMessage'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage, setArtifacts, setIsLoading, setMessages } from '../redux/messageSlice'
import { createConversation } from '../features/createConversation'
import { addConversation, setConvTitle, setSelectedConversation } from '../redux/conversationSlice'
import { updateConversation } from '../features/updateConversation'
import { useRef } from 'react'


function ChatInput() {
  const [value, setValue] = useState("")
  const { selectedAgent } = useSelector(state => state.agent)
  const { selectedConversation } = useSelector(state => state.conversation)
  const { messages, isLoading } = useSelector(state => state.message)
  const [selectedFile, setSelectedFile] = useState(null)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)
  const fileRef = useRef(null)
  const dispatch = useDispatch()


  // Listen for suggestion card clicks
  useEffect(() => {
    const handleFillInput = (e) => {
      setValue(e.detail.prompt)
    }
    window.addEventListener('fillChatInput', handleFillInput)
    return () => window.removeEventListener('fillChatInput', handleFillInput)
  }, [])


  const transcriptRef = useRef("")

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let interim = ""
      let final = ""

      for (let index = 0; index < event.results.length; index++) {
        if (event.results[index].isFinal) {
          final += event.results[index][0].transcript
        } else {
          interim += event.results[index][0].transcript
        }
      }

      // keep finalized text in ref, show interim alongside it
      if (final) transcriptRef.current = final
      setValue(transcriptRef.current + interim)
    }

    recognition.onend = () => {
      // browser auto-stops on silence with continuous=true
      // only mark as stopped if user intentionally clicked stop
      if (recognitionRef.current?._manualStop) {
        setListening(false)
        recognitionRef.current._manualStop = false
      } else if (recognitionRef.current) {
        // auto-restart to keep listening
        try { recognition.start() } catch (_) {}
      }
    }

    recognition.onerror = (e) => {
      if (e.error !== 'no-speech') {
        setListening(false)
      }
    }

    recognitionRef.current = recognition
  }, [])

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser")
      return   // ← was missing, caused crash
    }
    if (listening) {
      recognitionRef.current._manualStop = true
      recognitionRef.current.stop()
      setListening(false)
    } else {
      transcriptRef.current = ""   // reset accumulated text on new session
      recognitionRef.current.start()
      setListening(true)
    }
  }








  const handleSendMessage = async () => {
    dispatch(setIsLoading(true))
    let conversation = selectedConversation
    if (!conversation) {
      dispatch(setMessages([]))
      const conv = await createConversation()
      dispatch(setSelectedConversation(conv))

      dispatch(addConversation(conv))
      conversation = conv
    }

    if (conversation.title == "New Chat") {
      await updateConversation({ id: conversation?._id, title: value.trim() })
      dispatch(setConvTitle({ conversationId: conversation?._id, title: value.slice(0, 40) }))
    }

    console.log(selectedFile)
    
    // Determine agent based on file type
    let agentToUse = selectedAgent.toLowerCase()
    
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        agentToUse = "pdfRag"  // Force pdfRag for PDF files
      } else if (selectedFile.type.startsWith("image/")) {
        agentToUse = "imageAnalyzer"  // Force imageAnalyzer for images
      }
    }
    
    const formData = new FormData()
    formData.append("prompt", value.trim())
    formData.append("conversationId", conversation?._id)
    formData.append("agent", agentToUse)  // Use determined agent
    if (selectedFile) {
      formData.append("file", selectedFile)
    }



    dispatch(addMessage({ role: "user", content: value.trim(), images: selectedFile?.type.startsWith("image/") ? [URL.createObjectURL(selectedFile)] : [], createdAt: new Date().toISOString() }))
    setValue("")
    const data = await sendMessage(formData)
    dispatch(setIsLoading(false))
    setSelectedFile(null)
    fileRef.current.value = ""  // Reset file input
    dispatch(setArtifacts(data.artifacts || []))
    dispatch(addMessage({ role: "assistant", content: data?.answer, images: data?.images, createdAt: new Date().toISOString() }))
    console.log(data)
  }

  return (
    <div className='w-full overflow-hidden px-3 md:px-5 py-4 border-t border-white/[0.06] dark:border-white/[0.06] light:border-gray-200 dark:bg-[#0d0f14] light:bg-white'>
      <div className='flex flex-col gap-2 bg-white/[0.03] dark:bg-white/[0.03] light:bg-gray-50 border border-white/[0.07] dark:border-white/[0.07] light:border-gray-200 rounded-2xl px-4 pt-3.5 pb-3'>

        {
          selectedFile && <div className='my-3'>

            <div className='inline-flex items-center gap-2 rounded-xl border border-white/10 dark:border-white/10 light:border-gray-200 bg-white/[0.04] dark:bg-white/[0.04] light:bg-gray-100 px-3 py-2'>
              {
                selectedFile?.type === "application/pdf" ? <FileText size={16}

                  className="text-red-400"
                /> : selectedFile.type.startsWith("image/") && <img src={URL.createObjectURL(selectedFile)} className="h-10 w-10 rounded-xl object-cover mt-3"
                />
              }

              <div>
                <p className='text-xs dark:text-white light:text-gray-900'>
                  {selectedFile?.name}
                </p>
                <p className='text-[10px] dark:text-slate-500 light:text-gray-500'>
                  {Math.ceil(selectedFile.size)}KB
                </p>

              </div>
              <button className='ml-2' onClick={() => { setSelectedFile(null); fileRef.current.value = "" }}><X size={14} className='dark:text-slate-500 light:text-gray-500 hover:text-white dark:hover:text-white light:hover:text-gray-900' /></button>
            </div>


          </div>
        }


        <textarea
          placeholder='Ask anything...'
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (value.trim() && !isLoading) {
                handleSendMessage()
              }
            }
          }}
          value={value}
          className="w-full bg-transparent outline-none resize-none text-[14px] dark:text-slate-200 light:text-gray-900 dark:placeholder:text-slate-600 light:placeholder:text-gray-400 leading-relaxed [scrollbar-width:none] [&::-webkit-scrollbar]:hidden disabled:opacity-50"
          rows={1}
        />
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1'>

            <input type="file" accept='.pdf,image/*' hidden ref={fileRef} onChange={(e) => {
              const file = e.target.files[0]
              if (file) {
                setSelectedFile(file)
              }
            }} />

            <button className='flex items-center justify-center w-8 h-8 rounded-lg dark:text-slate-600 light:text-gray-500 hover:text-slate-400 dark:hover:text-slate-400 light:hover:text-gray-700 hover:bg-white/[0.05] dark:hover:bg-white/[0.05] light:hover:bg-gray-100 border border-transparent hover:border-white/[0.06] dark:hover:border-white/[0.06] light:hover:border-gray-200 transition-all duration-150 bg-transparent cursor-pointer' onClick={() => fileRef.current.click()}>
              <Paperclip size={16} />
            </button>
            <button
              onClick={toggleMic}
              className={`flex items-center justify-center w-8 h-8 rounded-lg  transition-all duration-150 cursor-pointer ${listening ? "bg-red-500 text-white" : "dark:text-slate-600 light:text-gray-500 hover:bg-white/[0.05] dark:hover:bg-white/[0.05] light:hover:bg-gray-100"}`}>
              {listening ? <Mic size={16} /> : <MicOff size={16} />}
            </button>
            <span className='text-[11px] dark:text-slate-600 light:text-gray-400 ml-1'>↵ Enter to send</span>
          </div>
          <button
            disabled={!value && isLoading}
            onClick={handleSendMessage}
            className={`flex items-center justify-center px-4 py-2 rounded-lg border-none cursor-pointer transition-all duration-150 ${value.trim() ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]" : "bg-white/[0.05] dark:bg-white/[0.05] light:bg-gray-200 dark:text-slate-600 light:text-gray-400 cursor-not-allowed"}`}>
            <Send size={15} />
          </button>
        </div>
      </div>
    </div >
  )
}

export default ChatInput
