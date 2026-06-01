# ── DB 비밀번호 자동 생성 ─────────────────────────────────────
resource "random_password" "db_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}:?"
}

# ── Secrets Manager (DB 자격증명 보관) ────────────────────────
resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${local.name_prefix}/rds/credentials"
  description             = "5MIN RDS MySQL 접속 정보"
  recovery_window_in_days = 7

  tags = { Name = "${local.name_prefix}-db-secret" }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db_password.result
    host     = aws_db_instance.main.address
    port     = 3306
    dbname   = var.db_name
  })
}

# ── DB 서브넷 그룹 ────────────────────────────────────────────
resource "aws_db_subnet_group" "main" {
  name       = "${local.name_prefix}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = { Name = "${local.name_prefix}-db-subnet-group" }
}

# ── 파라미터 그룹 (MySQL 8.0 한국어 최적화) ──────────────────
resource "aws_db_parameter_group" "main" {
  name   = "${local.name_prefix}-mysql80"
  family = "mysql8.0"

  parameter { name = "character_set_server";    value = "utf8mb4" }
  parameter { name = "character_set_client";    value = "utf8mb4" }
  parameter { name = "collation_server";        value = "utf8mb4_unicode_ci" }
  parameter { name = "time_zone";               value = "Asia/Seoul" }
  parameter { name = "require_secure_transport"; value = "ON" }
  parameter { name = "slow_query_log";          value = "1" }
  parameter { name = "long_query_time";         value = "1" }

  tags = { Name = "${local.name_prefix}-param-group" }
}

# ── RDS MySQL 인스턴스 (프리 티어) ────────────────────────────
resource "aws_db_instance" "main" {
  identifier = "${local.name_prefix}-mysql"

  engine         = "mysql"
  engine_version = "8.0"
  instance_class = var.db_instance_class   # db.t2.micro (프리 티어)

  # 프리 티어: gp2 20GB (gp3는 프리 티어 미해당)
  allocated_storage = var.db_allocated_storage   # 20GB
  storage_type      = "gp2"
  storage_encrypted = false   # t2.micro는 암호화 미지원

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db_password.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false

  parameter_group_name = aws_db_parameter_group.main.name

  # 프리 티어: Single-AZ
  multi_az = false

  # 백업 (프리 티어 포함)
  backup_retention_period  = var.backup_retention_days
  backup_window            = "18:00-19:00"     # KST 03:00~04:00
  maintenance_window       = "sun:19:00-sun:20:00"
  copy_tags_to_snapshot    = true

  # 모니터링 비활성화 (Enhanced Monitoring은 추가 비용)
  monitoring_interval          = 0
  performance_insights_enabled = false

  # 학교 프로젝트: 삭제 보호 OFF, 최종 스냅샷 생략
  deletion_protection       = false
  skip_final_snapshot       = true
  delete_automated_backups  = true

  tags = { Name = "${local.name_prefix}-mysql" }
}
