# Complete CI/CD Pipeline Documentation for React + Vite Deployment to Google Cloud Run

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Google Cloud Platform Setup](#google-cloud-platform-setup)
5. [GitHub Repository Setup](#github-repository-setup)
6. [Configuration Files](#configuration-files)
7. [Deployment Process](#deployment-process)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance and Updates](#maintenance-and-updates)

---

## Overview

This documentation covers the complete setup for automatically deploying a React + TypeScript + Vite application to Google Cloud Run using GitHub Actions with Workload Identity Federation for secure authentication.

### Technology Stack
- **Frontend Framework**: React 19 + TypeScript + Vite 7
- **Web Server**: Nginx (Alpine)
- **Container Platform**: Google Cloud Run
- **CI/CD**: GitHub Actions
- **Authentication**: Workload Identity Federation (no service account keys stored)
- **Container Registry**: Google Container Registry (GCR)

### Architecture Flow
```
      Developer Push to GitHub (main branch)
              ↓
      GitHub Actions Triggered
              ↓
      Authenticate via Workload Identity Federation
              ↓
      Build Docker Image (Multi-stage build)
        - Install dependencies
        - Build React app with Vite
        - Package with Nginx
              ↓
      Push Image to Google Container Registry
              ↓
      Deploy to Cloud Run
        - Create/Update Service
        - Route Traffic to New Revision
              ↓
      Application Live at Cloud Run URL
```

---

## Prerequisites

### Required Accounts
- Google Cloud Platform account with billing enabled
- GitHub account with repository access
- Domain registrar account (optional, for custom domains)

### Required Tools
Install the following on your local machine:

```bash
# Google Cloud SDK
# Download from: https://cloud.google.com/sdk/docs/install

# Verify installation
gcloud --version

# Git
git --version

# Node.js 20+ (for local development)
node --version
npm --version
```

### Required Access Levels
- **Google Cloud**: Owner or Editor role on the project
- **GitHub**: Admin access to the repository

---

## Project Structure

```
aspect-web-portal/
├── .github/
│   └── workflows/
│       └── google-cloudrun-source.yml    # CI/CD workflow
├── .dockerignore                          # Files to exclude from Docker build
├── .env.example                           # Environment variables template
├── .gitignore                             # Git ignore rules
├── Dockerfile                             # Multi-stage Docker build
├── nginx.conf                             # Nginx configuration
├── package.json                           # NPM dependencies
├── package-lock.json                      # NPM lock file
├── tsconfig.json                          # TypeScript configuration
├── vite.config.ts                         # Vite configuration
├── index.html                             # HTML entry point
├── public/                                # Static assets
└── src/                                   # React source code
    ├── api/                               # API services
    ├── assets/                            # Images, SVGs
    ├── components/                        # React components
    ├── hooks/                             # Custom hooks
    └── pages/                             # Page components
```

---

## Google Cloud Platform Setup

### Project Information
```
Project ID: crm-portal-473609
Project Number: 657555485245
Region: europe-west2 (London)
Service Name: aspect-web-portal
```

### Step 1: Enable Required APIs

Run these commands in Windows Command Prompt:

```batch
gcloud services enable run.googleapis.com --project=crm-portal-473609

gcloud services enable cloudbuild.googleapis.com --project=crm-portal-473609

gcloud services enable artifactregistry.googleapis.com --project=crm-portal-473609

gcloud services enable iamcredentials.googleapis.com --project=crm-portal-473609
```

### Step 2: Create Service Account

```batch
gcloud iam service-accounts create github-deploy-sa --project=crm-portal-473609 --display-name="GitHub Actions Deployer" --description="Service account for GitHub Actions to deploy to Cloud Run"
```

**Service Account Email**: `github-deploy-sa@crm-portal-473609.iam.gserviceaccount.com`

### Step 3: Grant Permissions to Service Account

```batch
REM Grant Cloud Run Admin role
gcloud projects add-iam-policy-binding crm-portal-473609 --member="serviceAccount:github-deploy-sa@crm-portal-473609.iam.gserviceaccount.com" --role="roles/run.admin"

REM Grant Service Account User role
gcloud projects add-iam-policy-binding crm-portal-473609 --member="serviceAccount:github-deploy-sa@crm-portal-473609.iam.gserviceaccount.com" --role="roles/iam.serviceAccountUser"

REM Grant Cloud Build Builder role
gcloud projects add-iam-policy-binding crm-portal-473609 --member="serviceAccount:github-deploy-sa@crm-portal-473609.iam.gserviceaccount.com" --role="roles/cloudbuild.builds.builder"

REM Grant Artifact Registry Admin role
gcloud projects add-iam-policy-binding crm-portal-473609 --member="serviceAccount:github-deploy-sa@crm-portal-473609.iam.gserviceaccount.com" --role="roles/artifactregistry.admin"
```

### Step 4: Grant Permissions to Cloud Build Service Account

```batch
REM Grant Service Usage Consumer role
gcloud projects add-iam-policy-binding crm-portal-473609 --member="serviceAccount:657555485245@cloudbuild.gserviceaccount.com" --role="roles/serviceusage.serviceUsageConsumer"

REM Grant Cloud Run Admin role
gcloud projects add-iam-policy-binding crm-portal-473609 --member="serviceAccount:657555485245@cloudbuild.gserviceaccount.com" --role="roles/run.admin"

REM Grant Service Account User role
gcloud projects add-iam-policy-binding crm-portal-473609 --member="serviceAccount:657555485245@cloudbuild.gserviceaccount.com" --role="roles/iam.serviceAccountUser"

REM Grant Artifact Registry Writer role
gcloud projects add-iam-policy-binding crm-portal-473609 --member="serviceAccount:657555485245@cloudbuild.gserviceaccount.com" --role="roles/artifactregistry.writer"
```

### Step 5: Create Workload Identity Pool

```batch
gcloud iam workload-identity-pools create github-pool --project=crm-portal-473609 --location="global" --display-name="GitHub Actions pool" --description="Workload Identity Pool for GitHub Actions authentication"
```

**Pool Resource Name**: `projects/657555485245/locations/global/workloadIdentityPools/github-pool`

### Step 6: Create OIDC Provider

Replace `Chumley-Development` with your actual GitHub username or organization name:

```batch
gcloud iam workload-identity-pools providers create-oidc github-provider --project=crm-portal-473609 --location="global" --workload-identity-pool=github-pool --issuer-uri="https://token.actions.githubusercontent.com" --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" --attribute-condition="assertion.repository=='Chumley-Development/aspect-web-portal'"
```

**Provider Resource Name**: `projects/657555485245/locations/global/workloadIdentityPools/github-pool/providers/github-provider`

### Step 7: Bind Workload Identity to Service Account

Replace `Chumley-Development` with your actual GitHub username:

```batch
gcloud iam service-accounts add-iam-policy-binding github-deploy-sa@crm-portal-473609.iam.gserviceaccount.com --project=crm-portal-473609 --role="roles/iam.workloadIdentityUser" --member="principalSet://iam.googleapis.com/projects/657555485245/locations/global/workloadIdentityPools/github-pool/attribute.repository/Chumley-Development/aspect-web-portal"
```

### Step 8: Verify Setup

```batch
REM Verify service account permissions
gcloud projects get-iam-policy crm-portal-473609 --flatten="bindings[].members" --filter="bindings.members:serviceAccount:github-deploy-sa@crm-portal-473609.iam.gserviceaccount.com"

REM Verify workload identity pool
gcloud iam workload-identity-pools describe github-pool --project=crm-portal-473609 --location="global"

REM Verify OIDC provider
gcloud iam workload-identity-pools providers describe github-provider --project=crm-portal-473609 --location="global" --workload-identity-pool=github-pool
```

---

## GitHub Repository Setup

### Step 1: Create GitHub Environment

1. Go to your repository: `https://github.com/Chumley-Development/aspect-web-portal`
2. Click **Settings** → **Secrets and variables** -> **Actions**
3. Click **New environment**
4. Name it: `.env`
5. Click **Configure environment**

### Step 2: Add Environment Secrets

In the `.env` environment, add these 9 VITE secrets:

| Secret Name | Example Value | Description |
|-------------|---------------|-------------|
| `VITE_LOGIN_API_URL` | `https://chumley--portal.sandbox.my.site.com/services/apexrest/UserLogin` | Salesforce login API endpoint |
| `VITE_AUTH_URL` | `https://chumley--portal.sandbox.my.salesforce.com/services/oauth2/token` | Salesforce OAuth token endpoint |
| `VITE_CLIENT_ID` | `3MVG9eXciSTTfrSpdTujuVHOx...` | Salesforce OAuth client ID |
| `VITE_CLIENT_SECRET` | `06E898FD87E403BFA157ED846...` | Salesforce OAuth client secret |
| `VITE_FORGOT_PASSWORD_URL` | `https://chumley--portal.sandbox.my.site.com/services/apexrest/ForgotPassword` | Password reset endpoint |
| `VITE_PROFILEAPI_URL` | `https://chumley--qa.sandbox.my.salesforce.com/services/apexrest/Profile` | Profile API endpoint |
| `VITE_BACKEND_BASE_URL` | `https://chumley--qa.sandbox.my.site.com/services/apexrest/portal/api/v1` | Backend API base URL |
| `VITE_ADDRESSY_API_KEY` | `JJ18-CG38-MK69-DA98` | Address lookup API key |
| `VITE_ADDRESSY_BASE_URL` | `https://api.addressy.com/Capture/Interactive/Find/v1.10/json6.ws` | Address lookup API endpoint |

### Step 3: Add Repository Secrets

Go to **Settings** → **Secrets and variables** → **Actions** → **Secrets** tab

Add these 5 GCP secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `GCP_PROJECT_ID` | `crm-portal-473609` | Google Cloud project ID |
| `GCP_REGION` | `europe-west2` | Cloud Run deployment region |
| `CLOUD_RUN_SERVICE` | `aspect-web-portal` | Cloud Run service name |
| `WORKLOAD_IDENTITY_PROVIDER` | `projects/657555485245/locations/global/workloadIdentityPools/github-pool/providers/github-provider` | Full WIF provider resource name |
| `GCP_SA_EMAIL` | `github-deploy-sa@crm-portal-473609.iam.gserviceaccount.com` | Service account email |

---

## Configuration Files

### 1. Dockerfile

**Location**: `aspect-web-portal/Dockerfile`

```dockerfile
# Stage 1: Build the app
FROM node:20-slim AS builder

WORKDIR /app

# Declare build arguments
ARG VITE_LOGIN_API_URL
ARG VITE_AUTH_URL
ARG VITE_CLIENT_ID
ARG VITE_CLIENT_SECRET
ARG VITE_FORGOT_PASSWORD_URL
ARG VITE_PROFILEAPI_URL
ARG VITE_BACKEND_BASE_URL
ARG VITE_ADDRESSY_API_KEY
ARG VITE_ADDRESSY_BASE_URL

# Set as environment variables for Vite
ENV VITE_LOGIN_API_URL=$VITE_LOGIN_API_URL \
    VITE_AUTH_URL=$VITE_AUTH_URL \
    VITE_CLIENT_ID=$VITE_CLIENT_ID \
    VITE_CLIENT_SECRET=$VITE_CLIENT_SECRET \
    VITE_FORGOT_PASSWORD_URL=$VITE_FORGOT_PASSWORD_URL \
    VITE_PROFILEAPI_URL=$VITE_PROFILEAPI_URL \
    VITE_BACKEND_BASE_URL=$VITE_BACKEND_BASE_URL \
    VITE_ADDRESSY_API_KEY=$VITE_ADDRESSY_API_KEY \
    VITE_ADDRESSY_BASE_URL=$VITE_ADDRESSY_BASE_URL

# Copy package files
COPY package.json ./

# Install dependencies - use npm install instead of npm ci
RUN npm install

# Copy source code
COPY . .

# Build app
RUN npm run build

# Stage 2: Serve app using Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
```

**Key Features:**
- Multi-stage build (reduces final image size from ~1GB to ~50MB)
- Node 20 slim image for build stage
- Fresh npm install (no package-lock.json) to handle Rollup optional dependencies
- ARG/ENV declarations for Vite environment variables
- Nginx Alpine for production serving
- Port 8080 (Cloud Run requirement)

### 2. nginx.conf

**Location**: `aspect-web-portal/nginx.conf`

```nginx
server {
  listen 8080;
  server_name localhost;

  root /usr/share/nginx/html;
  index index.html;

  # SPA fallback for React Router
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Cache static assets aggressively
  location ~* \.(?:css|js|svg|png|jpg|jpeg|gif|ico|woff2?)$ {
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  # Always fetch index.html (no cache) so new deploys reflect quickly
  location = /index.html {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
  }
}
```

**Configuration Details:**
- Listens on port 8080 (Cloud Run requirement)
- SPA fallback handles React Router client-side routing
- Aggressive caching for static assets (1 year)
- No caching for index.html (ensures new deployments are immediately visible)

### 3. .dockerignore

**Location**: `aspect-web-portal/.dockerignore`

```
.git
.env
.env.*.local

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Env files
.env
```

**Purpose**: Excludes unnecessary files from Docker build context, reducing build time and image size.

### 4. GitHub Actions Workflow

**Location**: `.github/workflows/google-cloudrun-source.yml`

```yaml
name: Build & Deploy to Cloud Run
on:
  push:
    branches:
      - main
env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  REGION: ${{ secrets.GCP_REGION }}
  SERVICE: aspect-web-portal
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment: .env
    permissions:
      contents: read
      id-token: write
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
      
      - id: auth
        name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ secrets.GCP_SA_EMAIL }}
      
      - name: Configure gcloud project
        run: |
          gcloud config set project ${{ env.PROJECT_ID }}
          gcloud config set run/region ${{ env.REGION }}
      
      - name: Configure Docker for gcloud
        run: gcloud auth configure-docker --quiet
      
      - name: Set Docker Image Name
        run: echo "IMAGE=gcr.io/${{ env.PROJECT_ID }}/${{ env.SERVICE }}:${{ github.sha }}" >> $GITHUB_ENV
      
      - name: Set up QEMU and Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Build and Push Docker Image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ env.IMAGE }}
          build-args: |
            VITE_LOGIN_API_URL=${{ secrets.VITE_LOGIN_API_URL }}
            VITE_AUTH_URL=${{ secrets.VITE_AUTH_URL }}
            VITE_CLIENT_ID=${{ secrets.VITE_CLIENT_ID }}
            VITE_CLIENT_SECRET=${{ secrets.VITE_CLIENT_SECRET }}
            VITE_FORGOT_PASSWORD_URL=${{ secrets.VITE_FORGOT_PASSWORD_URL }}
            VITE_PROFILEAPI_URL=${{ secrets.VITE_PROFILEAPI_URL }}
            VITE_BACKEND_BASE_URL=${{ secrets.VITE_BACKEND_BASE_URL }}
            VITE_ADDRESSY_API_KEY=${{ secrets.VITE_ADDRESSY_API_KEY }}
            VITE_ADDRESSY_BASE_URL=${{ secrets.VITE_ADDRESSY_BASE_URL }}
      
      - name: Deploy to Cloud Run
        id: deploy
        uses: google-github-actions/deploy-cloudrun@v2
        with:
          project: ${{ env.PROJECT_ID }}
          service: ${{ env.SERVICE }}
          region: ${{ env.REGION }}
          image: ${{ env.IMAGE }}
          flags: --allow-unauthenticated
      
      - name: Delete old revisions (keep last 3)
        run: |
          echo "Checking for old revisions to delete..."
          
          # Get all revisions except the 3 most recent
          OLD_REVISIONS=$(gcloud run revisions list \
            --service=${{ env.SERVICE }} \
            --region=${{ env.REGION }} \
            --format="value(name)" \
            --sort-by="~creationTimestamp" | tail -n +4)
          
          if [ -n "$OLD_REVISIONS" ]; then
            echo "Deleting old revisions..."
            for revision in $OLD_REVISIONS; do
              echo "Deleting revision: $revision"
              gcloud run revisions delete $revision \
                --region=${{ env.REGION }} \
                --quiet || echo "Failed to delete $revision, continuing..."
            done
            echo "Cleanup completed"
          else
            echo "No old revisions to delete"
          fi
      
      - name: Show Deployment URL
        run: |
          echo "Deployment URL: ${{ steps.deploy.outputs.url }}"
```

**Workflow Breakdown:**

- **Trigger**: Runs on push to `main` branch
- **Environment**: Uses `.env` environment for VITE secrets
- **Permissions**: `id-token: write` required for Workload Identity Federation
- **Authentication**: Exchanges GitHub OIDC token for GCP credentials (no keys stored)
- **Build**: Multi-stage Docker build with environment variables passed as build-args
- **Deploy**: Updates Cloud Run service with new image
- **Service Name**: Fixed as `aspect-web-portal` (consistent URL across deployments)

---

## Deployment Process

### Initial Deployment

1. **Commit all configuration files**:

```bash
cd C:\Users\User\Desktop\React\aspect-web-portal

git add Dockerfile nginx.conf .dockerignore .github\workflows\google-cloudrun-source.yml

git commit -m "Add CI/CD pipeline for Cloud Run deployment"

git push origin main
```

2. **Monitor deployment**:
   - Go to: `https://github.com/Chumley-Development/aspect-web-portal/actions`
   - Click on the running workflow
   - Watch real-time logs for each step

3. **Access deployed application**:
   - Find the URL in the workflow output: "Deployment URL: https://aspect-web-portal-[hash]-europe-west2.a.run.app"
   - Or run: `gcloud run services describe aspect-web-portal --project=crm-portal-473609 --region=europe-west2 --format="value(status.url)"`

### Subsequent Deployments

Every push to `main` branch automatically:
1. Triggers GitHub Actions workflow
2. Builds new Docker image
3. Pushes to Google Container Registry
4. Deploys to Cloud Run
5. Routes traffic to new revision

**No manual commands needed!**

### Deployment Timeline

- **Build**: 2-4 minutes
- **Push to GCR**: 30-60 seconds
- **Deploy to Cloud Run**: 1-2 minutes
- **Total**: 3-7 minutes per deployment

---

## Troubleshooting

### Common Issues and Solutions

#### 1. Authentication Fails

**Error**: `Error: google-github-actions/auth failed with: retry function failed`

**Solution**:
```batch
REM Verify Workload Identity Pool exists
gcloud iam workload-identity-pools describe github-pool --project=crm-portal-473609 --location="global"

REM Verify service account binding
gcloud iam service-accounts get-iam-policy github-deploy-sa@crm-portal-473609.iam.gserviceaccount.com --project=crm-portal-473609
```

#### 2. Permission Denied Errors

**Error**: `PERMISSION_DENIED: Permission 'X' denied on resource`

**Solution**:
```batch
REM Check service account permissions
gcloud projects get-iam-policy crm-portal-473609 --flatten="bindings[].members" --filter="bindings.members:serviceAccount:github-deploy-sa@crm-portal-473609.iam.gserviceaccount.com"

REM Check Cloud Build service account permissions
gcloud projects get-iam-policy crm-portal-473609 --flatten="bindings[].members" --filter="bindings.members:serviceAccount:657555485245@cloudbuild.gserviceaccount.com"
```

**Note**: IAM permission changes can take 5-10 minutes to propagate.

#### 3. Rollup Build Errors

**Error**: `Cannot find module @rollup/rollup-linux-x64-gnu`

**Solution**: This is fixed in the Dockerfile by:
- Using `FROM node:20-slim` instead of `FROM node:20-alpine`
- Using `npm install` instead of `npm ci`
- Not copying `package-lock.json`

#### 4. Environment Variables Empty

**Error**: Build args show as empty: `--build-arg VITE_LOGIN_API_URL=`

**Causes**:
- Secrets not added to GitHub
- Wrong environment name in workflow
- Secrets in wrong location (repository vs environment)

**Solution**:
```bash
REM Verify workflow environment matches GitHub environment name
cd C:\Users\User\Desktop\React\aspect-web-portal
type .github\workflows\google-cloudrun-source.yml | findstr "environment"
```

Ensure the environment name matches exactly where secrets are stored.

#### 5. TypeScript Errors During Build

**Error**: TypeScript compilation fails with type errors

**Solution**: The workflow uses `npm run build` which only runs Vite build. To add type checking:

```json
{
  "scripts": {
    "build": "tsc -b && vite build",
    "build:skip-typecheck": "vite build"
  }
}
```

Or fix TypeScript errors before deploying.

#### 6. Cloud Run Service URL Changes

**Issue**: Service URL changes on every deployment

**Cause**: Workflow uses `SERVICE: my-vite-app-${{ github.run_id }}`

**Solution**: Use fixed service name (already corrected in documentation):
```yaml
SERVICE: aspect-web-portal
```

### Debugging Commands

```batch
REM View Cloud Run logs
gcloud run services logs read aspect-web-portal --project=crm-portal-473609 --region=europe-west2 --limit=100

REM Describe Cloud Run service
gcloud run services describe aspect-web-portal --project=crm-portal-473609 --region=europe-west2

REM List all revisions
gcloud run revisions list --service=aspect-web-portal --project=crm-portal-473609 --region=europe-west2

REM List all services in project
gcloud run services list --project=crm-portal-473609 --region=europe-west2

REM View current IAM policy for project
gcloud projects get-iam-policy crm-portal-473609

REM Test Docker build locally (in project directory)
docker build -t aspect-web-portal:test .

REM Run Docker container locally
docker run -p 8080:8080 aspect-web-portal:test
REM Access at http://localhost:8080
```

---

## Maintenance and Updates

### Updating Application Code

```bash
cd C:\Users\User\Desktop\React\aspect-web-portal

REM Make your code changes

git add .

git commit -m "Description of changes"

git push origin main

REM Deployment happens automatically
```

### Rollback to Previous Version

**Via gcloud CLI**:

```batch
REM List revisions
gcloud run revisions list --service=aspect-web-portal --project=crm-portal-473609 --region=europe-west2

REM Rollback to specific revision
gcloud run services update-traffic aspect-web-portal --to-revisions=REVISION_NAME=100 --project=crm-portal-473609 --region=europe-west2
```

**Via Cloud Console**:
1. Go to Cloud Run → aspect-web-portal
2. Click "Revisions" tab
3. Select previous revision
4. Click "Manage Traffic"
5. Route 100% traffic to selected revision

### Update Environment Variables

**Update GitHub Secrets**:
1. Go to repository Settings → Environments → .env
2. Edit existing secrets
3. Next deployment will use new values

**Update Cloud Run Runtime Variables** (not needed for VITE vars):
```batch
gcloud run services update aspect-web-portal --update-env-vars="KEY1=value1,KEY2=value2" --project=crm-portal-473609 --region=europe-west2
```

### Update Service Configuration

```batch
REM Change memory allocation
gcloud run services update aspect-web-portal --memory=512Mi --project=crm-portal-473609 --region=europe-west2

REM Change CPU allocation
gcloud run services update aspect-web-portal --cpu=1 --project=crm-portal-473609 --region=europe-west2

REM Set minimum instances (reduces cold starts but increases cost)
gcloud run services update aspect-web-portal --min-instances=1 --project=crm-portal-473609 --region=europe-west2

REM Set maximum instances (prevents runaway costs)
gcloud run services update aspect-web-portal --max-instances=10 --project=crm-portal-473609 --region=europe-west2

REM Set request timeout
gcloud run services update aspect-web-portal --timeout=300 --project=crm-portal-473609 --region=europe-west2

REM Set concurrency (requests per container)
gcloud run services update aspect-web-portal --concurrency=80 --project=crm-portal-473609 --region=europe-west2
```

### Add Custom Domain

```batch
REM Map custom domain
gcloud run domain-mappings create --service=aspect-web-portal --domain=app.yourdomain.com --region=europe-west2 --project=crm-portal-473609

REM List domain mappings
gcloud run domain-mappings list --project=crm-portal-473609 --region=europe-west2

REM Delete domain mapping
gcloud run domain-mappings delete --domain=app.yourdomain.com --region=europe-west2 --project=crm-portal-473609
```

**Note**: Custom domain setup requires:
1. Domain verification in Google Search Console
2. DNS records update (provided by gcloud command output)
3. SSL certificate auto-provisioned by Cloud Run

### Update Node.js Version

Update in Dockerfile:
```dockerfile
FROM node:22-slim AS builder
```

Commit and push - automatic deployment will use new version.

### Rotate Service Account

If service account is compromised:

```batch
REM Create new service account
gcloud iam service-accounts create github-deploy-sa-new --project=crm-portal-473609 --display-name="GitHub Actions Deployer New"

REM Grant all permissions (repeat steps from setup)
gcloud projects add-iam-policy-binding crm-portal-473609 --member="serviceAccount:github-deploy-sa-new@crm-portal-473609.iam.gserviceaccount.com" --role="roles/run.admin"

REM Update Workload Identity binding
gcloud iam service-accounts add-iam-policy-binding github-deploy-sa-new@crm-portal-473609.iam.gserviceaccount.com --project=crm-portal-473609 --role="roles/iam.workloadIdentityUser" --member="principalSet://iam.googleapis.com/projects/657555485245/locations/global/workloadIdentityPools/github-pool/attribute.repository/Chumley-Development/aspect-web-portal"

REM Update GitHub secret GCP_SA_EMAIL with new email

REM Delete old service account
gcloud iam service-accounts delete github-deploy-sa@crm-portal-473609.iam.gserviceaccount.com --project=crm-portal-473609
```

### Monitor Costs

```batch
REM View billing information
gcloud billing projects describe crm-portal-473609

REM Set up budget alerts (via Cloud Console)
REM Navigate to: Billing → Budgets & alerts → Create Budget
```

**Cost Optimization Tips**:
- Use `--min-instances=0` for low-traffic apps (accepts cold starts)
- Set `--max-instances` to prevent unexpected scaling
- Monitor Cloud Run metrics in Cloud Console
- Delete unused services and old container images

### Update Dependencies

```bash
cd C:\Users\User\Desktop\React\aspect-web-portal

REM Check for outdated packages
npm outdated

REM Update packages
npm update

REM Update major versions (carefully)
npm install package-name@latest

REM Check for security vulnerabilities
npm audit

REM Fix security issues
npm audit fix

REM Test locally
npm run dev

REM Commit and push
git add package.json package-lock.json
git commit -m "Update dependencies"
git push origin main
```

### Delete Service

```batch
REM Delete Cloud Run service
gcloud run services delete aspect-web-portal --project=crm-portal-473609 --region=europe-west2

REM Delete container images
gcloud container images list --repository=gcr.io/crm-portal-473609
gcloud container images delete gcr.io/crm-portal-473609/aspect-web-portal:TAG --quiet
```

---

## Additional Information

### Service Account Roles Explained

| Role | Purpose | Required For |
|------|---------|--------------|
| `roles/run.admin` | Deploy and manage Cloud Run services | Creating/updating services |
| `roles/iam.serviceAccountUser` | Act as service accounts | Deploying with service account identity |
| `roles/cloudbuild.builds.builder` | Build container images | Docker image building |
| `roles/artifactregistry.admin` | Create and manage repositories | First-time repository creation |
| `roles/serviceusage.serviceUsageConsumer` | Use GCP services | General API access |

### Cloud Run Pricing (as of 2025)

**Free tier (per month)**:
- 2 million requests
- 360,000 GB-seconds of memory
- 180,000 vCPU-seconds

**Typical costs for low-traffic app**:
- $0-5/month within free tier
- ~$10-20/month for moderate traffic
- Scales with usage

### Security Best Practices

1. **Never commit secrets**: Always use GitHub Secrets or environment variables
2. **Use Workload Identity**: Avoid service account keys
3. **Restrict API keys**: Configure API key restrictions in provider dashboards
4. **Regular updates**: Keep dependencies updated
5. **Monitor logs**: Review Cloud Run logs regularly for suspicious activity
6. **Least privilege**: Grant minimum required permissions
7. **Enable VPC**: For production, consider VPC Service Controls

### Useful Links

**Google Cloud Documentation**:
- Cloud Run: https://cloud.google.com/run/docs
- Workload Identity Federation: https://cloud.google.com/iam/docs/workload-identity-federation
- Container Registry: https://cloud.google.com/container-registry/docs
- Cloud Build: https://cloud.google.com/build/docs
- IAM Roles: https://cloud.google.com/iam/docs/understanding-roles

**GitHub Documentation**:
- GitHub Actions: https://docs.github.com/en/actions
- GitHub Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- Deploy Cloud Run Action: https://github.com/google-github-actions/deploy-cloudrun

**Technology Documentation**:
- Vite: https://vitejs.dev/guide/
- React: https://react.dev/
- Nginx: https://nginx.org/en/docs/
- Docker: https://docs.docker.com/

**Support Resources**:
- Google Cloud Support: https://console.cloud.google.com/support
- GitHub Support: https://support.github.com
- Stack Overflow (Cloud Run): https://stackoverflow.com/questions/tagged/google-cloud-run

---

## Quick Reference Commands

### Daily Operations

```batch
REM View service status
gcloud run services describe aspect-web-portal --project=crm-portal-473609 --region=europe-west2

REM View recent logs (last 50 lines)
gcloud run services logs read aspect-web-portal --project=crm-portal-473609 --region=europe-west2 --limit=50

REM View service URL
gcloud run services describe aspect-web-portal --project=crm-portal-473609 --region=europe-west2 --format="value(status.url)"

REM List all revisions
gcloud run revisions list --service=aspect-web-portal --project=crm-portal-473609 --region=europe-west2

REM View current traffic split
gcloud run services describe aspect-web-portal --project=crm-portal-473609 --region=europe-west2 --format="value(status.traffic)"
```

### Monitoring and Metrics

```batch
REM View service metrics (requires Cloud Console)
REM Navigate to: Cloud Run → aspect-web-portal → Metrics

REM Stream logs in real-time
gcloud run services logs tail aspect-web-portal --project=crm-portal-473609 --region=europe-west2

REM View error logs only
gcloud run services logs read aspect-web-portal --project=crm-portal-473609 --region=europe-west2 --log-filter="severity>=ERROR"

REM List container images
gcloud container images list --repository=gcr.io/crm-portal-473609

REM View image details
gcloud container images describe gcr.io/crm-portal-473609/aspect-web-portal:TAG
```

### Emergency Operations

```batch
REM Rollback to previous revision (emergency)
gcloud run revisions list --service=aspect-web-portal --project=crm-portal-473609 --region=europe-west2 --limit=5
gcloud run services update-traffic aspect-web-portal --to-revisions=PREVIOUS_REVISION=100 --project=crm-portal-473609 --region=europe-west2

REM Stop receiving traffic (emergency shutdown)
gcloud run services update aspect-web-portal --no-traffic --project=crm-portal-473609 --region=europe-west2

REM Resume traffic
gcloud run services update aspect-web-portal --traffic=LATEST=100 --project=crm-portal-473609 --region=europe-west2

REM Scale to zero (stop all instances)
gcloud run services update aspect-web-portal --no-traffic --min-instances=0 --project=crm-portal-473609 --region=europe-west2
```

---

## Complete Setup Checklist

### Pre-Deployment Checklist

- [ ] Google Cloud project created with billing enabled
- [ ] All required APIs enabled
- [ ] Service account created with correct permissions
- [ ] Cloud Build service account has permissions
- [ ] Workload Identity Pool created
- [ ] OIDC Provider configured with correct GitHub repository
- [ ] Service account bound to Workload Identity Pool
- [ ] GitHub repository created
- [ ] GitHub environment `.env` created
- [ ] 9 VITE secrets added to GitHub environment
- [ ] 5 GCP secrets added to GitHub repository secrets
- [ ] Dockerfile created in repository root
- [ ] nginx.conf created in repository root
- [ ] .dockerignore created in repository root
- [ ] GitHub Actions workflow file created
- [ ] All files committed to Git
- [ ] package.json has correct build script

### Post-Deployment Checklist

- [ ] First deployment completed successfully
- [ ] Application accessible at Cloud Run URL
- [ ] All pages load correctly
- [ ] React Router navigation works
- [ ] API calls function properly
- [ ] Environment variables loaded correctly
- [ ] Static assets loading (images, CSS, JS)
- [ ] Browser console shows no errors
- [ ] Mobile responsiveness verified
- [ ] SSL certificate auto-provisioned (HTTPS working)
- [ ] Subsequent deployments work automatically
- [ ] Rollback tested successfully
- [ ] Logs accessible and readable
- [ ] Cost monitoring set up
- [ ] Documentation updated with actual URLs

---

## Troubleshooting Decision Tree

```
Deployment Failed?
├─ Authentication Error?
│  ├─ Check GitHub secrets are set
│  ├─ Verify Workload Identity Pool exists
│  └─ Confirm service account binding
│
├─ Build Error?
│  ├─ Check Dockerfile syntax
│  ├─ Verify Node version compatibility
│  ├─ Check for TypeScript errors
│  └─ Verify package.json scripts
│
├─ Push to Registry Failed?
│  ├─ Check Artifact Registry permissions
│  ├─ Verify Docker authentication
│  └─ Check network connectivity
│
└─ Deployment to Cloud Run Failed?
   ├─ Check service account permissions
   ├─ Verify Cloud Run API enabled
   └─ Check region is correct

Application Not Working?
├─ 404 Errors on Routes?
│  └─ Check nginx.conf has SPA fallback
│
├─ Environment Variables Missing?
│  ├─ Verify GitHub secrets are set
│  ├─ Check workflow references environment
│  └─ Confirm Dockerfile ARG/ENV declarations
│
├─ Static Assets Not Loading?
│  ├─ Check build output directory (dist)
│  ├─ Verify Nginx root path
│  └─ Check browser console for errors
│
└─ API Calls Failing?
   ├─ Check CORS configuration
   ├─ Verify API endpoints in secrets
   └─ Check browser network tab for details
```

---

## Summary

This documentation provides a complete guide for deploying a React + Vite application to Google Cloud Run using GitHub Actions with Workload Identity Federation. The setup is production-ready with:

- **Security**: No service account keys stored, using Workload Identity Federation
- **Automation**: Fully automated CI/CD pipeline triggered on Git push
- **Performance**: Multi-stage Docker build, Nginx serving, aggressive caching
- **Scalability**: Cloud Run auto-scales from 0 to thousands of instances
- **Reliability**: Automatic health checks, zero-downtime deployments, easy rollbacks
- **Cost-Effective**: Pay-per-use pricing, generous free tier

### Key Configuration Values

| Setting | Value |
|---------|-------|
| **Project ID** | `crm-portal-473609` |
| **Project Number** | `657555485245` |
| **Region** | `europe-west2` |
| **Service Name** | `aspect-web-portal` |
| **Service Account** | `github-deploy-sa@crm-portal-473609.iam.gserviceaccount.com` |
| **GitHub Environment** | `.env` |
| **Trigger Branch** | `main` |
| **Container Registry** | `gcr.io/crm-portal-473609` |
| **Node Version** | `20-slim` |
| **Web Server** | `Nginx Alpine` |
| **Port** | `8080` |

### Next Steps After Setup

1. **Test the deployment pipeline** - Make a small code change and push to main
2. **Set up monitoring** - Enable Cloud Monitoring and set up alerts
3. **Configure custom domain** (optional) - Map your domain to Cloud Run service
4. **Set up staging environment** (optional) - Create separate workflow for dev branch
5. **Enable Cloud CDN** (optional) - For global content delivery
6. **Set up backup strategy** - Regular Git commits serve as code backup
7. **Document API endpoints** - For team collaboration
8. **Set up budget alerts** - Prevent unexpected costs

---

**Document Version**: 1.0  
**Last Updated**: September 30, 2025  
**Maintained By**: GenAI Team  
**Contact**: ajay.hiremath@aspect.co.uk

---

## Appendix A: Common Error Messages and Solutions

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `PERMISSION_DENIED: Permission 'artifactregistry.repositories.create' denied` | Service account lacks Artifact Registry permissions | Grant `roles/artifactregistry.admin` to service account |
| `Cannot find module @rollup/rollup-linux-x64-gnu` | Rollup optional dependencies not installed | Use `npm install` instead of `npm ci`, use `node:20-slim` base image |
| `Build failed because the default service account is missing required IAM permissions` | Cloud Build service account lacks permissions | Grant required roles to Cloud Build service account (`657555485245@cloudbuild.gserviceaccount.com`) |
| `Error: google-github-actions/auth failed` | Workload Identity Federation not configured correctly | Verify WIF pool, provider, and service account binding |
| `ERROR: (gcloud.run.deploy) ALREADY_EXISTS` | Service already exists with different configuration | Use `gcloud run services update` instead, or delete existing service |
| `Container failed to start. Failed to start and then listen on the port` | Application not listening on port 8080 | Ensure Nginx configured to listen on port 8080 |
| `404 Not Found` on React routes | Nginx not configured for SPA | Add `try_files $uri $uri/ /index.html;` to nginx.conf |

## Appendix B: GitHub Actions Workflow Variables Reference

| Variable | Type | Example | Description |
|----------|------|---------|-------------|
| `github.sha` | Automatic | `43dc75938f566...` | Git commit SHA |
| `github.run_id` | Automatic | `18123948617` | Unique workflow run ID |
| `secrets.GCP_PROJECT_ID` | Repository Secret | `crm-portal-473609` | GCP project ID |
| `secrets.GCP_REGION` | Repository Secret | `europe-west2` | GCP region |
| `secrets.WORKLOAD_IDENTITY_PROVIDER` | Repository Secret | `projects/657555485245/...` | WIF provider resource name |
| `secrets.GCP_SA_EMAIL` | Repository Secret | `github-deploy-sa@...` | Service account email |
| `secrets.VITE_*` | Environment Secret | Various | Application environment variables |

---