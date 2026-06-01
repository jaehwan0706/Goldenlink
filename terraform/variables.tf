variable "aws_region" {
  description = "AWS 리전"
  type        = string
  default     = "ap-northeast-2"   # 서울
}

variable "project" {
  description = "프로젝트 이름 (리소스 prefix)"
  type        = string
  default     = "fivemin"
}

variable "env" {
  description = "배포 환경"
  type        = string
  default     = "prod"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.env)
    error_message = "env는 dev | staging | prod 중 하나여야 합니다."
  }
}

# ── VPC ──────────────────────────────────────────────────────
variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "private_subnet_cidrs" {
  description = "RDS 전용 프라이빗 서브넷 (최소 2개 AZ)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "public_subnet_cidrs" {
  description = "앱 서버·NAT 게이트웨이용 퍼블릭 서브넷"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "availability_zones" {
  type    = list(string)
  default = ["ap-northeast-2a", "ap-northeast-2c"]
}

# ── RDS ──────────────────────────────────────────────────────
variable "db_instance_class" {
  type    = string
  default = "db.t2.micro"   # 프리 티어: 750시간/월 무료
}

variable "db_allocated_storage" {
  type    = number
  default = 20   # GB (gp3, auto-scaling → 100GB)
}

variable "db_name" {
  type    = string
  default = "fivemin"
}

variable "db_username" {
  type    = string
  default = "fivemin_app"
}

variable "multi_az" {
  description = "Multi-AZ 활성화 (prod 권장, 프리 티어는 false)"
  type        = bool
  default     = false
}

variable "backup_retention_days" {
  type    = number
  default = 7
}

variable "allowed_app_cidr" {
  description = "앱 서버 CIDR (EC2 SG 대신 CIDR로 허용할 경우)"
  type        = string
  default     = "10.0.0.0/16"
}
