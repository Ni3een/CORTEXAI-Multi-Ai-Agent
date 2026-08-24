# 🚀 xAI Grok Image Generation Setup

## 📝 Overview

CortexAI now uses **xAI Grok** for image generation instead of external APIs!

## 🔑 Get xAI API Key

### Step 1: Sign up for xAI
1. Go to: https://x.ai/api
2. Sign up / Login with your account
3. Navigate to API Keys section
4. Create a new API key

### Step 2: Add API Key to Environment Variables

**Agent Service (.env):**
```bash
# Add this to: backend/services/agent/.env

XAI_API_KEY=xai-your-api-key-here
```

**Example:**
```bash
XAI_API_KEY=xai-1234567890abcdef1234567890abcdef
```

## 🎨 How It Works

### Flow:
```
User: "Create an image of a sunset"
    ↓
1. Enhance prompt with AI
    ↓
2. Call xAI Grok Image API
    ↓
3. Generate 1024x1024 image
    ↓
4. Download image
    ↓
5. Upload to S3
    ↓
6. Return download URL ✅
```

### Fallback System:
```
xAI Grok Fails?
    ↓
Automatically fallback to Pollinations.ai
    ↓
Still works! ✅
```

## 📊 xAI Grok Features

- ✅ Model: `grok-2-image-1212` (Latest)
- ✅ Size: `1024x1024` (High quality)
- ✅ Response: Direct URL
- ✅ Timeout: 60 seconds
- ✅ Fallback: Pollinations.ai

## 💰 Pricing (xAI)

Check latest pricing at: https://x.ai/api/pricing

Approximate costs:
- Image generation: ~$0.01-0.05 per image
- Much better quality than free alternatives

## 🧪 Testing

### Test 1: Simple Image
```
Prompt: "A beautiful sunset over mountains"
Expected: High-quality realistic image ✅
```

### Test 2: Complex Scene
```
Prompt: "A futuristic city with flying cars at night"
Expected: Detailed cinematic image ✅
```

### Test 3: Specific Style
```
Prompt: "A cat in anime style"
Expected: Anime-styled cat image ✅
```

## 🔍 Logs to Check

```
🎨 Vision Agent started - Image Generation
User prompt: create a sunset
🤖 Enhancing prompt with AI...
✅ Enhanced prompt: A breathtaking cinematic sunset over...
🖼️ Generating image with xAI Grok...
✅ Grok image generated successfully!
Image URL: https://...
⬇️ Downloading image...
💰 Credits deducted
☁️ Uploading to S3...
✅ Image uploaded to S3!
🎉 Vision Agent completed successfully!
```

## ⚠️ Error Handling

### If xAI fails:
```
❌ Vision Agent Error: ...
⚠️ Grok failed, falling back to Pollinations.ai...
```

### Common Issues:

**1. Invalid API Key**
```
Error: 401 Unauthorized
Fix: Check XAI_API_KEY in .env file
```

**2. Rate Limit**
```
Error: 429 Too Many Requests
Fix: Wait a few seconds, then retry
```

**3. Quota Exceeded**
```
Error: Insufficient credits
Fix: Add credits to xAI account
```

**4. Network Timeout**
```
Error: Timeout
Fix: Automatically uses fallback (Pollinations.ai)
```

## 🔄 Deployment Steps

### 1. Update Environment Variables

**Local Development:**
```bash
# In backend/services/agent/.env
XAI_API_KEY=xai-your-key-here
```

**AWS ECS:**
```bash
# Add to ECS Task Definition
{
  "name": "XAI_API_KEY",
  "value": "xai-your-key-here"
}
```

**Or use AWS Secrets Manager:**
```bash
aws secretsmanager create-secret \
    --name cortexai/xai-api-key \
    --secret-string "xai-your-key-here"
```

### 2. Rebuild & Deploy Agent Service

```powershell
# Build
docker build -f backend/services/agent/Dockerfile -t agent-service backend

# Tag
docker tag agent-service:latest "$ECR_REGISTRY/agent-service:latest"

# Push
docker push "$ECR_REGISTRY/agent-service:latest"

# Deploy
aws ecs update-service --cluster YOUR_CLUSTER --service YOUR_AGENT_SERVICE --force-new-deployment
```

### 3. Verify Deployment

Check logs for:
```
✅ Grok image generated successfully!
```

## 📈 Benefits Over Previous Setup

| Feature | Pollinations.ai | xAI Grok |
|---------|----------------|----------|
| **Quality** | Good | Excellent ⭐ |
| **Speed** | Fast | Fast |
| **Reliability** | Free (unreliable) | Paid (reliable) ⭐ |
| **Customization** | Limited | High ⭐ |
| **Resolution** | 1024x1024 | 1024x1024 |
| **Style Control** | Basic | Advanced ⭐ |
| **Fallback** | None | Yes (Pollinations) ⭐ |

## 🎯 Response Format

### User Message:
```
🎨 **Image Generated Successfully!**

![Generated Image](https://s3-url...)

📥 [Download High-Quality Image](https://s3-url...)

🤖 **Generated with:** xAI Grok Image Model
📝 **Enhanced Prompt:** A breathtaking cinematic sunset...

⏳ *Download link expires in 24 hours.*
```

## 🔐 Security Notes

- ✅ API key stored in environment variables
- ✅ Never commit API key to Git
- ✅ Use AWS Secrets Manager in production
- ✅ Images stored temporarily in S3 (auto-delete after 24h)

## 📞 Support

If xAI Grok is not working:
1. Check API key is correct
2. Verify xAI account has credits
3. Check CloudWatch logs for errors
4. Fallback to Pollinations.ai will work automatically

## 🚀 Quick Start

```bash
# 1. Get API key from x.ai
# 2. Add to .env:
echo "XAI_API_KEY=xai-your-key" >> backend/services/agent/.env

# 3. Restart agent service
# Local: npm run dev
# Production: Redeploy ECS service

# 4. Test
# Upload image request: "Create a beautiful landscape"
# Expected: High-quality Grok-generated image ✅
```

---

**Powered by xAI Grok 🚀**
