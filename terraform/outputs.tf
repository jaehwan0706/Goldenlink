output "rds_endpoint" {
  description = "RDS 접속 엔드포인트 (앱 서버 환경변수 DB_HOST에 사용)"
  value       = aws_db_instance.main.address
  sensitive   = false
}

output "rds_port" {
  value = aws_db_instance.main.port
}

output "db_secret_arn" {
  description = "Secrets Manager ARN (앱 서버 IAM 정책에 허용 필요)"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

output "rds_security_group_id" {
  description = "앱 서버 SG에 추가할 RDS SG ID"
  value       = aws_security_group.rds.id
}

output "app_security_group_id" {
  description = "EC2/ECS 앱 서버에 연결할 SG ID"
  value       = aws_security_group.app.id
}

output "vpc_id" {
  value = aws_vpc.main.id
}

output "private_subnet_ids" {
  description = "앱 서버(ECS/EC2) 배포 시 사용할 프라이빗 서브넷"
  value       = aws_subnet.private[*].id
}

output "public_subnet_ids" {
  description = "ALB 배포 시 사용할 퍼블릭 서브넷"
  value       = aws_subnet.public[*].id
}
