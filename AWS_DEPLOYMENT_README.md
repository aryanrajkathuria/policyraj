# AWS Deployment Guide for PolicyRaj

This project is now set up for AWS deployment with a backend container and static website.

## Architecture
- Static frontend: `website/`
- Backend API server: `backend/app.js`
- Container build: `Docker/Dockerfile`
- CI/CD:
  - `aws-deploy.yml` deploys to AWS ECR and ECS
  - `ci-cd.yml` is a build/check workflow

## GitHub Secrets
Set these repository secrets in GitHub before deploying:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_ECR_REGISTRY` (example: `123456789012.dkr.ecr.us-east-1.amazonaws.com`)
- `AWS_ECR_REPOSITORY` (example: `policyraj-backend`)
- `AWS_ECS_CLUSTER`
- `AWS_ECS_SERVICE`

## AWS Setup
1. Create or use an existing ECR repository.
2. Create an ECS cluster with Fargate.
3. Create an ECS service connected to the cluster.
4. Ensure task execution role has ECR and CloudWatch permissions.
5. Set the GitHub secrets listed above.

## Run locally
1. `cd backend`
2. `npm start`
3. Open `http://localhost:3000`

## Notes
- The ECS task definition is located at `aws/ecs-task-def.json`.
- The deploy workflow updates the task definition image and forces a new ECS service deploy.
