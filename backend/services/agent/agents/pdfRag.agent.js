import fs, { stat } from "fs"
import {PDFParse} from "pdf-parse"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { vectorStore } from "../config/vectorDb.js"
import { getModel } from "../config/llmModels.js"
import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"
export const pdfRag=async (state)=>{
   try {
    console.log("🔍 PDF RAG Agent started")
    console.log("File info:", state.file)
    
    await checkAgentLimit(state.userId,"pdf")
    
    console.log("📄 Reading PDF file...")
    const buffer=fs.readFileSync(state.file.path)
    
    console.log("📋 Parsing PDF...")
    const pdf=new PDFParse({
      data:buffer
    })

    const result=await pdf.getText()
    const text=result.text
    
    console.log(`✅ PDF parsed successfully! Text length: ${text.length} characters`)
    
    if (!text || text.trim().length === 0) {
      return {
        ...state,
        aiResponse: "❌ Could not extract text from the PDF. The PDF might be image-based or corrupted. Please try another PDF."
      }
    }

    console.log("🔪 Splitting text into chunks...")
    const splitter=new RecursiveCharacterTextSplitter({
      chunkSize:1000,
      chunkOverlap:200
    })

    const docs=await splitter.createDocuments([text])
    console.log(`✅ Created ${docs.length} chunks`)
    
    const collectionName=`pdf-${Date.now()}`;
    console.log(`💾 Creating vector store: ${collectionName}`)
    const store=await vectorStore(docs,collectionName)

    console.log(`🔍 Searching for relevant chunks for query: "${state.prompt}"`)
    const relevantDocs=await store.similaritySearch(state.prompt,5)
    console.log(`✅ Found ${relevantDocs.length} relevant chunks`)
    
    const context=relevantDocs.map(d=>d.pageContent).join("\n\n")
    
    console.log("🤖 Calling LLM with context...")
    const llm=await getModel("pdf-rag")

     const messages=[
      new SystemMessage(`You are CortexAI PDF Assistant.

Rules:

- Answer ONLY from the uploaded PDF.

- Never make up information.

- If the answer is not present in the PDF, reply:

"I couldn't find this information in the uploaded PDF."

- Use Markdown formatting.

- Be concise and accurate.
`),

new HumanMessage(`
  Context from PDF:
  ${context}
  
  User Question: ${state.prompt}
  `)
     ]


    const response=await llm.invoke(messages)
    console.log("✅ LLM response received")
    
    await deductCredits(state.userId,"pdf")
    console.log("💰 Credits deducted")
    
    console.log("🎉 PDF RAG completed successfully!")
    return {
      ...state,
      aiResponse:response.content
    }



   } catch (error) {
    console.error("❌ PDF RAG Error:", error)
    console.error("Error details:", error.message)
    console.error("Stack:", error.stack)
    
    return {
      ...state,
      aiResponse: `❌ Failed to analyze PDF: ${error.message || "Unknown error"}. Please try again with a different PDF.`
    }
   }finally{
    try {
      if (state.file && state.file.path && fs.existsSync(state.file.path)) {
        fs.unlinkSync(state.file.path)
        console.log("🗑️ Temp file deleted")
      }
    } catch (cleanupError) {
      console.error("⚠️ Failed to delete temp file:", cleanupError)
    }
   }


}