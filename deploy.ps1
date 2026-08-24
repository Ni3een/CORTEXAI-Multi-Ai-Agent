# ==========================================
# CortexAI Manual Deployment Script
# Services: Gateway + Auth (Logout Fix)
# ==========================================

# CONFIGURATION - REPLACE WITH YOUR VALUES
$AWS_REGION = "us-east-1"                    # Your AWS region
$AWS_ACCOUNT_ID = "123456789012"             # Your AWS account ID
$ECS_CLUSTER = "cortex-ai-cluster"           # Your ECS cluster name
$GATEWAY_SERVICE = "gateway-service"         # Your Gateway service name
$AUTH_SERVICE = "auth-service"               # Your Auth service name

# ==========================================
# DO NOT EDIT BELOW THIS LINE
# ==========================================

$ECR_REGISTRY = "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "      CortexAI Manual Deployment      " -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "  Region:         $AWS_REGION" -ForegroundColor White
Write-Host "  Account ID:     $AWS_ACCOUNT_ID" -ForegroundColor White
Write-Host "  ECS Cluster:    $ECS_CLUSTER" -ForegroundColor White
Write-Host "  ECR Registry:   $ECR_REGISTRY" -ForegroundColor White
Write-Host ""

# Confirm before proceeding
$confirmation = Read-Host "Continue with deployment? (y/n)"
if ($confirmation -ne 'y') {
    Write-Host "❌ Deployment cancelled." -ForegroundColor Red
    exit 0
}

Write-Host ""

# ==========================================
# STEP 1: ECR Login
# ==========================================
Write-Host "━━━ Step 1/5: ECR Login ━━━" -ForegroundColor Magenta
Write-Host "🔑 Logging in to Amazon ECR..." -ForegroundColor Yellow

$loginCommand = "aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY"
Invoke-Expression $loginCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ECR Login successful!" -ForegroundColor Green
} else {
    Write-Host "❌ ECR Login failed! Check AWS credentials." -ForegroundColor Red
    exit 1
}

Write-Host ""

# ==========================================
# STEP 2: Build Gateway
# ==========================================
Write-Host "━━━ Step 2/5: Build Gateway Service ━━━" -ForegroundColor Magenta
Write-Host "🏗️ Building Gateway Docker image..." -ForegroundColor Yellow

docker build -f backend/gateway/Dockerfile -t gateway backend

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Gateway build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Gateway build failed!" -ForegroundColor Red
    exit 1
}

# Tag and Push
Write-Host "🏷️ Tagging Gateway image..." -ForegroundColor Yellow
docker tag gateway:latest "$ECR_REGISTRY/gateway:latest"

Write-Host "📤 Pushing Gateway to ECR..." -ForegroundColor Yellow
docker push "$ECR_REGISTRY/gateway:latest"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Gateway pushed to ECR!" -ForegroundColor Green
} else {
    Write-Host "❌ Gateway push failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ==========================================
# STEP 3: Build Auth Service
# ==========================================
Write-Host "━━━ Step 3/5: Build Auth Service ━━━" -ForegroundColor Magenta
Write-Host "🏗️ Building Auth Service Docker image..." -ForegroundColor Yellow

docker build -f backend/services/auth/Dockerfile -t auth-service backend

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Auth Service build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Auth Service build failed!" -ForegroundColor Red
    exit 1
}

# Tag and Push
Write-Host "🏷️ Tagging Auth Service image..." -ForegroundColor Yellow
docker tag auth-service:latest "$ECR_REGISTRY/auth-service:latest"

Write-Host "📤 Pushing Auth Service to ECR..." -ForegroundColor Yellow
docker push "$ECR_REGISTRY/auth-service:latest"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Auth Service pushed to ECR!" -ForegroundColor Green
} else {
    Write-Host "❌ Auth Service push failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ==========================================
# STEP 4: Deploy Gateway
# ==========================================
Write-Host "━━━ Step 4/5: Deploy Gateway to ECS ━━━" -ForegroundColor Magenta
Write-Host "🚀 Updating Gateway ECS service..." -ForegroundColor Yellow

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

Write-Host ""

# ==========================================
# STEP 5: Deploy Auth Service
# ==========================================
Write-Host "━━━ Step 5/5: Deploy Auth Service to ECS ━━━" -ForegroundColor Magenta
Write-Host "🚀 Updating Auth Service ECS service..." -ForegroundColor Yellow

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

# ==========================================
# SUMMARY
# ==========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "      🎉 Deployment Complete!         " -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Docker Images Pushed:" -ForegroundColor Cyan
Write-Host "  ✓ $ECR_REGISTRY/gateway:latest" -ForegroundColor White
Write-Host "  ✓ $ECR_REGISTRY/auth-service:latest" -ForegroundColor White
Write-Host ""
Write-Host "🚀 ECS Services Updated:" -ForegroundColor Cyan
Write-Host "  ✓ Cluster: $ECS_CLUSTER" -ForegroundColor White
Write-Host "  ✓ Gateway Service: $GATEWAY_SERVICE" -ForegroundColor White
Write-Host "  ✓ Auth Service: $AUTH_SERVICE" -ForegroundColor White
Write-Host ""
Write-Host "⏱️ Rolling deployment in progress..." -ForegroundColor Yellow
Write-Host "   This may take 3-5 minutes to complete." -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 Monitor deployment:" -ForegroundColor Cyan
Write-Host "   aws ecs describe-services --cluster $ECS_CLUSTER --services $GATEWAY_SERVICE" -ForegroundColor DarkGray
Write-Host "   aws ecs describe-services --cluster $ECS_CLUSTER --services $AUTH_SERVICE" -ForegroundColor DarkGray
Write-Host ""
Write-Host "🔍 Check CloudWatch Logs if issues occur." -ForegroundColor Yellow
Write-Host ""
