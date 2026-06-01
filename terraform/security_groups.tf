# ── RDS 보안 그룹 ─────────────────────────────────────────────
# 인바운드: VPC 내부 (앱 서버)에서만 3306 허용
# 아웃바운드: 없음 (DB는 응답만)

resource "aws_security_group" "rds" {
  name        = "${local.name_prefix}-rds-sg"
  description = "RDS MySQL - VPC 내부 트래픽만 허용"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "MySQL from app servers"
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = [var.allowed_app_cidr]
  }

  egress {
    description = "deny all outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = []
    self        = false
  }

  tags = { Name = "${local.name_prefix}-rds-sg" }
}

# ── 앱 서버 보안 그룹 (참조용 - 앱 팀이 EC2/ECS에 연결) ──────
resource "aws_security_group" "app" {
  name        = "${local.name_prefix}-app-sg"
  description = "앱 서버 SG (RDS 접근 허용)"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.name_prefix}-app-sg" }
}

# 앱 SG → RDS SG 명시적 허용 (CIDR 대신 SG 참조 - 더 안전)
resource "aws_security_group_rule" "rds_from_app" {
  type                     = "ingress"
  from_port                = 3306
  to_port                  = 3306
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = aws_security_group.app.id
  description              = "앱 SG에서 MySQL 허용"
}
