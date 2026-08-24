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

        console.log("🖼️ Generating image with xAI Grok...")
        
        // xAI Grok Image Generation API
        const grokResponse = await axios.post(
            'https://api.x.ai/v1/images/generations',
            {
                model: "grok-2-image-1212",  // Latest Grok image model
                prompt: enhancedPrompt,
                n: 1,  // Number of images
                size: "1024x1024",  // Image size
                response_format: "url"  // Get URL instead of base64
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000  // 60 second timeout
            }
        )

        console.log("✅ Grok image generated successfully!")
        
        // Get image URL from Grok response
        const imageUrl = grokResponse.data.data[0].url
        console.log("Image URL:", imageUrl)
        
        // Download image from Grok
        console.log("⬇️ Downloading image...")
        const imageRes = await axios.get(imageUrl, {responseType:"arraybuffer"})
        
        await deductCredits(state.userId,"vision")
        console.log("💰 Credits deducted")
        
        // Upload to S3
        console.log("☁️ Uploading to S3...")
        const buffer = Buffer.from(imageRes.data)
        const filename = `grok-image-${Date.now()}.png`

        await uploadToS3(filename, buffer, "image/png")
        const downloadUrl = await getFromS3(filename, 24*60)
        
        console.log("✅ Image uploaded to S3!")
        console.log("🎉 Vision Agent completed successfully!")

        return {
            ...state,
            images: [downloadUrl],
            aiResponse: `
🎨 **Image Generated Successfully!**

![Generated Image](${downloadUrl})

📥 [Download High-Quality Image](${downloadUrl})

🤖 **Generated with:** xAI Grok Image Model
📝 **Enhanced Prompt:** ${enhancedPrompt}

⏳ *Download link expires in 24 hours.*
`
        }
    } catch (error) {
        console.error("❌ Vision Agent Error:", error)
        console.error("Error details:", error.response?.data || error.message)
        console.error("Stack:", error.stack)
        
        // Fallback to Pollinations.ai if Grok fails
        console.log("⚠️ Grok failed, falling back to Pollinations.ai...")
        try {
            const llm=await getModel("image")
            const res=await llm.invoke(`
You are an elite AI image prompt engineer.

Convert the user request into a highly detailed image generation prompt.

Requirements:
- Cinematic lighting, Professional composition, Ultra realistic
- High detail, Beautiful color palette, Sharp focus
- 8K quality, Photorealistic, Depth of field

Return only the image prompt.

User Request: ${state.prompt}
            `)

            const prompt=res.content.trim()
            const imageUrl=`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`
            const imageRes=await axios.get(imageUrl,{responseType:"arraybuffer"})
            
            await deductCredits(state.userId,"vision")
            
            const buffer=Buffer.from(imageRes.data)
            const filename=`image-${Date.now()}.png`
            await uploadToS3(filename,buffer,"image/png")
            const downloadUrl=await getFromS3(filename,24*60)

            return {
                ...state,
                images: [downloadUrl],
                aiResponse:`
🎨 **Image Generated Successfully!**

![Generated Image](${downloadUrl})

📥 [Download Image](${downloadUrl})

🤖 **Generated with:** Pollinations.ai (Fallback)

⏳ *Link expires in 24 hours.*
`
            }
        } catch (fallbackError) {
            console.error("❌ Fallback also failed:", fallbackError)
            return {
                ...state,
                aiResponse: `❌ Failed to generate image: ${error.response?.data?.error?.message || error.message || "Unknown error"}. Please try again with a different prompt.`
            }
        }
    }
}