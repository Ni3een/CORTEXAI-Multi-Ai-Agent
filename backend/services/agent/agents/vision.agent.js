import { getModel } from "../config/llmModels.js"
import axios from "axios"
import { uploadToS3 } from "../utils/uploadToS3.js"
import { getFromS3 } from "../utils/getFromS3.js"
import { deductCredits } from "../utils/deductCredits.js"
import { checkAgentLimit } from "../config/agentLimit.js"

export const visionAgent=async (state) => {

    try {
        console.log("🎨 Vision Agent started - Image Generation")
        console.log("User prompt:", state.prompt)
        
        await checkAgentLimit(state.userId,"image")
        
        console.log("🤖 Enhancing prompt with AI...")
        const llm=await getModel("image")
        const res=await llm.invoke(`
You are an elite AI image prompt engineer.

Convert the user request into a highly detailed image generation prompt.

Requirements:

- Cinematic lighting
- Professional composition
- Ultra realistic
- High detail
- Beautiful color palette
- Sharp focus
- 8K quality
- Photorealistic
- Depth of field
- Professional photography
- Stunning visuals

Return only the enhanced image prompt (no extra text).

User Request:
${state.prompt}
        `)

        const enhancedPrompt=res.content.trim()
        console.log("✅ Enhanced prompt:", enhancedPrompt)

        console.log("🖼️ Generating image with Pollinations.ai (Free)...")
        
        // Pollinations.ai - Completely FREE, no API key needed
        const imageUrl=`https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&nologo=true&model=flux`
        
        console.log("⬇️ Downloading generated image...")
        const imageRes=await axios.get(imageUrl,{
            responseType:"arraybuffer",
            timeout: 30000  // 30 second timeout
        })
        
        console.log("✅ Image downloaded successfully!")
        
        await deductCredits(state.userId,"vision")
        console.log("💰 Credits deducted")
        
        // Upload to S3
        console.log("☁️ Uploading to S3...")
        const buffer=Buffer.from(imageRes.data)
        const filename=`image-${Date.now()}.png`

        await uploadToS3(filename,buffer,"image/png")
        const downloadUrl=await getFromS3(filename,24*60)
        
        console.log("✅ Image uploaded to S3!")
        console.log("🎉 Vision Agent completed successfully!")

        return {
            ...state,
            images: [downloadUrl],
            aiResponse: `Here is your generated image 🎨`
        }
    } catch (error) {
        console.error("❌ Vision Agent Error:", error)
        console.error("Error details:", error.message)
        
        return {
            ...state,
            aiResponse:`❌ Failed to generate image: ${error.message || "Unknown error"}. Please try again with a different prompt.`
        }
    }
}