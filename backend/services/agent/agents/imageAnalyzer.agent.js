
import { HumanMessage, SystemMessage } from "@langchain/core/messages"
import { getModel } from "../config/llmModels.js"
import fs from "fs/promises"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"

export const imageAnalyzer =async (state) => {
    try {
        console.log("🖼️ Image Analyzer Agent started")
        console.log("Image info:", state.file)
        
        await checkAgentLimit(state.userId,"image")
        
        console.log("📸 Reading image file...")
        const imageBuffer = await fs.readFile(state.file.path)
        const base64Image = imageBuffer.toString("base64")
        console.log(`✅ Image loaded! Size: ${(base64Image.length / 1024).toFixed(2)} KB`)

        console.log("🤖 Calling Vision LLM...")
        const llm = await getModel("imageAnalyzer")

        const messages = [
            new SystemMessage(
                `You are CortexAI Image Analyzer Agent.

Rules:

- Analyze the uploaded image thoroughly.
- Answer the user's question accurately based on what you see.
- If text exists in the image, extract and present it clearly.
- If charts, graphs, or tables exist, explain them in detail.
- If diagrams or technical content exists, describe the structure and components.
- If the image quality is poor or something is unclear, mention it.
- Use Markdown formatting for better readability.
- Be descriptive and detailed.
- Do not make assumptions or hallucinate details not visible in the image.
- If the user didn't ask a specific question, provide a comprehensive analysis of the image.
`
            ),
            new HumanMessage(
                {
                    content: [
                        {
                            type: "text",
                            text: state.prompt || "Please analyze this image in detail. Describe what you see, any text present, and the overall context."
                        },
                        {
                            type:"image_url",
                            "image_url":{
                                url:`data:${state.file.mimetype};base64,${base64Image}`
                            }
                        }
                    ]
                }

            )
        ]

        const response=await llm.invoke(messages)
        console.log("✅ Image analysis completed")
        
        await deductCredits(state.userId,"vision")
        console.log("💰 Credits deducted")
        
        console.log("🎉 Image Analyzer completed successfully!")
        return {
            ...state,
            aiResponse:response.content
        }

    } catch (error) {
        console.error("❌ Image Analyzer Error:", error)
        console.error("Error details:", error.message)
        console.error("Stack:", error.stack)
        
        return {
            ...state,
            aiResponse: `❌ Failed to analyze image: ${error.message || "Unknown error"}. Please try again with a different image.`
        }
    }
    finally{
        try {
            if (state.file && state.file.path) {
                await fs.unlink(state.file.path)
                console.log("🗑️ Temp image file deleted")
            }
        } catch (cleanupError) {
            console.error("⚠️ Failed to delete temp image file:", cleanupError)
        }
    }
}