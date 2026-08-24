# 🚀 Manual Docker Build & Push Commands

## 📋 Changed Services (Logout Fix)
- ✅ Gateway Service
- ✅ Auth Service

---

## 🔧 Prerequisites

Make sure you have:
```bash
# AWS CLI configured
aws --version

# Docker installed
docker --version

# Environment variables (from GitHub Secrets)
# AWS_REGION (e.g., us-east-1)
# AWS_ACCOUNT_ID (your AWS account ID)
```

---

## 📝 Step-by-Step Commands

### 1️⃣ Set Environment Variables

```powershell
# Windows PowerShell
$AWS_REGION = "YOUR_REGION"              # Example: us-east-1
$AWS_ACCOUNT_ID = "YOUR_ACCOUNT_ID"      # Example: 123456789012
$ECR_REGISTRY = "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
```

**Or use your actual values:**
```powershell
# Replace with your actual values from GitHub Secrets
$AWS_REGION = "us-east-1"
$AWS_ACCOUNT_ID = "123456789012"
$ECR_REGISTRY = "123456789012.dkr.ecr.us-east-1.amazonaws.com"
```

---

### 2️⃣ Login to AWS ECR

```powershell
# Get ECR login password and login to Docker
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
```

**Expected Output:**
```
Login Succeeded
```

---

### 3️⃣ Build & Push Gateway Service

```powershell
# Navigate to project root (if not already there)
cd C:\Users\nitin\Downloads\1.cortexAI\1.cortexAI

# Build Gateway image
Write-Host "🏗️ Building Gateway Service..." -ForegroundColor Cyan
docker build -f backend/gateway/Dockerfile -t gateway backend

# Tag Gateway image (latest)
Write-Host "🏷️ Tagging Gateway..." -ForegroundColor Cyan
docker tag gateway:latest "$ECR_REGISTRY/gateway:latest"

# Push Gateway to ECR
Write-Host "📤 Pushing Gateway to ECR..." -ForegroundColor Green
docker push "$ECR_REGISTRY/gateway:latest"

Write-Host "✅ Gateway pushed successfully!" -ForegroundColor Green
```

---

### 4️⃣ Build & Push Auth Service

```powershell
# Build Auth Service image
Write-Host "🏗️ Building Auth Service..." -ForegroundColor Cyan
docker build -f backend/services/auth/Dockerfile -t auth-service backend

# Tag Auth Service image (latest)
Write-Host "🏷️ Tagging Auth Service..." -ForegroundColor Cyan
docker tag auth-service:latest "$ECR_REGISTRY/auth-service:latest"

# Push Auth Service to ECR
Write-Host "📤 Pushing Auth Service to ECR..." -ForegroundColor Green
docker push "$ECR_REGISTRY/auth-service:latest"

Write-Host "✅ Auth Service pushed successfully!" -ForegroundColor Green
```

---

### 5️⃣ Force ECS Deployment

```powershell
# Deploy Gateway Service
Write-Host "🚀 Deploying Gateway to ECS..." -ForegroundColor Magenta
aws ecs update-service `
    --cluster "YOUR_CLUSTER_NAME" `
    --service "YOUR_GATEWAY_SERVICE_NAME" `
    --force-new-deployment `
    --no-cli-pager

# Deploy Auth Service
Write-Host "🚀 Deploying Auth Service to ECS..." -ForegroundColor Magenta
aws ecs update-service `
    --cluster "YOUR_CLUSTER_NAME" `
    --service "YOUR_AUTH_SERVICE_NAME" `
    --force-new-deployment `
    --no-cli-pager

Write-Host "🎉 Deployment initiated successfully!" -ForegroundColor Green
```

---

## 🔥 Complete Script (Copy-Paste)

```powershell
# ==========================================
# MANUAL DEPLOYMENT SCRIPT
# ==========================================

# 1. Set your AWS credentials
$AWS_REGION = "YOUR_REGION"              # Replace
$AWS_ACCOUNT_ID = "YOUR_ACCOUNT_ID"      # Replace
$ECS_CLUSTER = "YOUR_CLUSTER_NAME"       # Replace
$GATEWAY_SERVICE = "YOUR_GATEWAY_SERVICE" # Replace
$AUTH_SERVICE = "YOUR_AUTH_SERVICE"      # Replace

# Computed values
$ECR_REGISTRY = "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "    CortexAI Manual Deployment        " -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 2. Login to ECR
Write-Host "🔑 Logging in to ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ECR Login successful!" -ForegroundColor Green
} else {
    Write-Host "❌ ECR Login failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "    Building Gateway Service          " -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# 3. Build Gateway
docker build -f backend/gateway/Dockerfile -t gateway backend

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Gateway build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Gateway build failed!" -ForegroundColor Red
    exit 1
}

# 4. Tag Gateway
docker tag gateway:latest "$ECR_REGISTRY/gateway:latest"

# 5. Push Gateway
docker push "$ECR_REGISTRY/gateway:latest"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Gateway pushed to ECR!" -ForegroundColor Green
} else {
    Write-Host "❌ Gateway push failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "    Building Auth Service             " -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# 6. Build Auth Service
docker build -f backend/services/auth/Dockerfile -t auth-service backend

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Auth Service build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Auth Service build failed!" -ForegroundColor Red
    exit 1
}

# 7. Tag Auth Service
docker tag auth-service:latest "$ECR_REGISTRY/auth-service:latest"

# 8. Push Auth Service
docker push "$ECR_REGISTRY/auth-service:latest"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Auth Service pushed to ECR!" -ForegroundColor Green
} else {
    Write-Host "❌ Auth Service push failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "    Deploying to ECS                  " -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# 9. Deploy Gateway
Write-Host "🚀 Deploying Gateway..." -ForegroundColor Magenta
aws ecs update-service `
    --cluster $ECS_CLUSTER `
    --service $GATEWAY_SERVICE `
    --force-new-deployment `
    --no-cli-pager

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Gateway deployment initiated!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Gateway deployment may have issues" -ForegroundColor Yellow
}

# 10. Deploy Auth Service
Write-Host "🚀 Deploying Auth Service..." -ForegroundColor Magenta
aws ecs update-service `
    --cluster $ECS_CLUSTER `
    --service $AUTH_SERVICE `
    --force-new-deployment `
    --no-cli-pager

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Auth Service deployment initiated!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Auth Service deployment may have issues" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "    🎉 Deployment Complete!           " -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Images pushed:" -ForegroundColor Cyan
Write-Host "  • $ECR_REGISTRY/gateway:latest" -ForegroundColor White
Write-Host "  • $ECR_REGISTRY/auth-service:latest" -ForegroundColor White
Write-Host ""
Write-Host "🚀 ECS Services updating..." -ForegroundColor Cyan
Write-Host "  • Cluster: $ECS_CLUSTER" -ForegroundColor White
Write-Host "  • Gateway Service: $GATEWAY_SERVICE" -ForegroundColor White
Write-Host "  • Auth Service: $AUTH_SERVICE" -ForegroundColor White
Write-Host ""
Write-Host "⏱️ Rolling deployment in progress (this may take 3-5 minutes)..." -ForegroundColor Yellow
```

---

## 🔍 Verify Deployment

```powershell
# Check Gateway Service status
aws ecs describe-services `
    --cluster "YOUR_CLUSTER_NAME" `
    --services "YOUR_GATEWAY_SERVICE_NAME" `
    --query "services[0].deployments" `
    --output table

# Check Auth Service status
aws ecs describe-services `
    --cluster "YOUR_CLUSTER_NAME" `
    --services "YOUR_AUTH_SERVICE_NAME" `
    --query "services[0].deployments" `
    --output table
```

---

## 🐛 Troubleshooting

### Issue: Docker build fails
```powershell
# Check Docker is running
docker ps

# Check Dockerfile exists
Test-Path backend/gateway/Dockerfile
Test-Path backend/services/auth/Dockerfile
```

### Issue: ECR login fails
```powershell
# Verify AWS credentials
aws sts get-caller-identity

# Check ECR repository exists
aws ecr describe-repositories --repository-names gateway auth-service
```

### Issue: Push fails
```powershell
# Make sure you're logged in
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Check image exists locally
docker images | Select-String "gateway"
docker images | Select-String "auth-service"
```

### Issue: ECS deployment fails
```powershell
# Check ECS service exists
aws ecs list-services --cluster YOUR_CLUSTER_NAME

# Check task definition
aws ecs describe-task-definition --task-definition gateway-task
aws ecs describe-task-definition --task-definition auth-task
```

---

## 📊 Monitoring Deployment

```powershell
# Watch Gateway service events
aws ecs describe-services `
    --cluster "YOUR_CLUSTER_NAME" `
    --services "YOUR_GATEWAY_SERVICE_NAME" `
    --query "services[0].events[0:5]" `
    --output table

# Watch Auth service events  
aws ecs describe-services `
    --cluster "YOUR_CLUSTER_NAME" `
    --services "YOUR_AUTH_SERVICE_NAME" `
    --query "services[0].events[0:5]" `
    --output table

# Check running tasks
aws ecs list-tasks `
    --cluster "YOUR_CLUSTER_NAME" `
    --service-name "YOUR_GATEWAY_SERVICE_NAME"
```

---

## ✅ Success Checklist

- [ ] ECR login successful
- [ ] Gateway image built successfully
- [ ] Gateway image pushed to ECR
- [ ] Auth Service image built successfully
- [ ] Auth Service image pushed to ECR
- [ ] Gateway ECS deployment initiated
- [ ] Auth Service ECS deployment initiated
- [ ] New tasks running in ECS
- [ ] Health checks passing
- [ ] Old tasks terminated
- [ ] Logout working correctly! 🎉

---

## 📞 Need Help?

If deployment fails:
1. Check CloudWatch Logs for errors
2. Verify environment variables in ECS task definitions
3. Check security groups and network connectivity
4. Ensure Redis is accessible from ECS tasks

---

**Deployment Time:** ~5-7 minutes (build + push + rolling update)

**Note:** This is a manual deployment. For automatic deployments, fix your CI/CD pipeline.
