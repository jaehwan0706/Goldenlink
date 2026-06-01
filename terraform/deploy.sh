#!/bin/bash
# 5MIN RDS 배포 스크립트
# 실행 전: AWS CLI 로그인 확인 (aws sts get-caller-identity)

set -e

ENV=${1:-prod}
echo "▶ 배포 환경: $ENV"

# 1. S3 백엔드 버킷 & DynamoDB 락 테이블 사전 생성 (최초 1회)
REGION="ap-northeast-2"
BUCKET="fivemin-tfstate"
TABLE="fivemin-tfstate-lock"

aws s3api create-bucket \
  --bucket "$BUCKET" \
  --region "$REGION" \
  --create-bucket-configuration LocationConstraint="$REGION" 2>/dev/null || true

aws s3api put-bucket-versioning \
  --bucket "$BUCKET" \
  --versioning-configuration Status=Enabled

aws s3api put-bucket-encryption \
  --bucket "$BUCKET" \
  --server-side-encryption-configuration \
    '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

aws dynamodb create-table \
  --table-name "$TABLE" \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region "$REGION" 2>/dev/null || true

echo "✓ 백엔드 스토리지 준비 완료"

# 2. Terraform 초기화 및 배포
terraform init
terraform plan -var="env=$ENV" -out=tfplan
terraform apply tfplan

# 3. 출력값 저장 (앱 팀에 전달)
echo ""
echo "═══════════════════════════════════════"
echo "  배포 완료 - 앱 팀 전달 정보"
echo "═══════════════════════════════════════"
terraform output rds_endpoint
terraform output db_secret_arn
terraform output app_security_group_id
terraform output private_subnet_ids
