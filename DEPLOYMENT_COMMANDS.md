# 🚀 Quick Deployment Commands

## ⚡ Fast Track (Copy-Paste)

### 1️⃣ Set Variables (EDIT THESE!)
```powershell
$AWS_REGION = "us-east-1"
$AWS_ACCOUNT_ID = "123456789012"
$ECR_REGISTRY = "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
$ECS_CLUSTER = "cortex-ai-cluster"
$GATEWAY_SERVICE = "gateway-service"
$AUTH_SERVICE = "auth-service"
```

### 2️⃣ Login to ECR
```powershell
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
```

### 3️⃣ Build & Push Gateway
```powershell
docker build -f backend/gateway/Dockerfile -t gateway backend
docker tag gateway:latest "$ECR_REGISTRY/gateway:latest"
docker push "$ECR_REGISTRY/gateway:latest"
```

### 4️⃣ Build & Push Auth
```powershell
docker build -f backend/services/auth/Dockerfile -t auth-service backend
docker tag auth-service:latest "$ECR_REGISTRY/auth-service:latest"
docker push "$ECR_REGISTRY/auth-service:latest"
```

### 5️⃣ Deploy to ECS
```powershell
aws ecs update-service --cluster $ECS_CLUSTER --service $GATEWAY_SERVICE --force-new-deployment --no-cli-pager
aws ecs update-service --cluster $ECS_CLUSTER --service $AUTH_SERVICE --force-new-deployment --no-cli-pager
```

---

## 🎯 Single Command Deployment

```powershell
# Run the automated script
.\deploy.ps1
```

**Edit `deploy.ps1` first with your AWS values!**

---

## 📋 Check Your GitHub Secrets

Tumhare GitHub secrets se values nikalo:
- `AWS_REGION` → us-east-1 (example)
- `AWS_ACCOUNT_ID` → 123456789012 (example)
- `ECS_CLUSTER` → cortex-ai-cluster (example)
- `GATEWAY_SERVICE` → gateway-service (example)
- `AUTH_SERVICE` → auth-service (example)

---

## 🔍 Verify Deployment

### Check Service Status
```powershell
aws ecs describe-services --cluster $ECS_CLUSTER --services $GATEWAY_SERVICE --query "services[0].deployments"
aws ecs describe-services --cluster $ECS_CLUSTER --services $AUTH_SERVICE --query "services[0].deployments"
```

### Check Running Tasks
```powershell
aws ecs list-tasks --cluster $ECS_CLUSTER --service-name $GATEWAY_SERVICE
aws ecs list-tasks --cluster $ECS_CLUSTER --service-name $AUTH_SERVICE
```

### Watch Events
```powershell
aws ecs describe-services --cluster $ECS_CLUSTER --services $GATEWAY_SERVICE --query "services[0].events[0:5]"
```

---

## 🐛 Common Issues

### "unauthorized to perform: ecr:GetAuthorizationToken"
```powershell
# Check AWS credentials
aws sts get-caller-identity
aws configure list
```

### "repository does not exist"
```powershell
# Create ECR repositories
aws ecr create-repository --repository-name gateway
aws ecr create-repository --repository-name auth-service
```

### "No such service"
```powershell
# List all services
aws ecs list-services --cluster $ECS_CLUSTER
```

### Docker build fails
```powershell
# Make sure you're in project root
cd C:\Users\nitin\Downloads\1.cortexAI\1.cortexAI

# Check Docker is running
docker ps
```

---

## 📊 Monitoring

### CloudWatch Logs
```powershell
# Get log streams
aws logs tail /ecs/gateway --follow
aws logs tail /ecs/auth --follow
```

### Health Check
```powershell
# Check target group health
aws elbv2 describe-target-health --target-group-arn YOUR_TARGET_GROUP_ARN
```

---

## ⏱️ Deployment Timeline

- Build Gateway: ~2-3 min
- Push Gateway: ~30 sec
- Build Auth: ~2-3 min
- Push Auth: ~30 sec
- ECS Rolling Update: ~3-5 min
- **Total: ~8-10 minutes**

---

## ✅ Success Indicators

You'll know deployment succeeded when:
- ✓ New task revision created
- ✓ New tasks in RUNNING state
- ✓ Health checks passing
- ✓ Old tasks STOPPED
- ✓ Logout working in app! 🎉

---

## 🔄 Rollback (If Needed)

```powershell
# Rollback to previous task definition
aws ecs update-service --cluster $ECS_CLUSTER --service $GATEWAY_SERVICE --task-definition gateway-task:PREVIOUS_REVISION
aws ecs update-service --cluster $ECS_CLUSTER --service $AUTH_SERVICE --task-definition auth-task:PREVIOUS_REVISION
```

---

## 📞 Need Help?

1. Check CloudWatch Logs first
2. Verify environment variables in task definitions
3. Check security groups
4. Ensure Redis is accessible

---

**Pro Tip:** Save your AWS values in `deploy.ps1` so you don't have to type them every time! 🚀
