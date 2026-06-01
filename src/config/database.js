const mysql = require('mysql2/promise');
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');

let pool;

async function loadDbCredentials() {
  // 로컬/dev 환경: 환경변수 직접 사용
  if (process.env.NODE_ENV !== 'production') {
    return {
      host:     process.env.DB_HOST     || '127.0.0.1',
      port:     Number(process.env.DB_PORT) || 3306,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME     || 'fivemin',
    };
  }

  // 프로덕션: AWS Secrets Manager에서 로드
  const client = new SecretsManagerClient({ region: process.env.AWS_REGION || 'ap-northeast-2' });
  const command = new GetSecretValueCommand({
    SecretId: process.env.DB_SECRET_ARN,  // terraform output: db_secret_arn
  });
  const response = await client.send(command);
  const secret   = JSON.parse(response.SecretString);

  return {
    host:     secret.host,
    port:     secret.port || 3306,
    user:     secret.username,
    password: secret.password,
    database: secret.dbname,
  };
}

async function createPool() {
  const creds = await loadDbCredentials();

  return mysql.createPool({
    ...creds,
    charset:            'utf8mb4',
    timezone:           '+09:00',

    connectionLimit:    Number(process.env.DB_POOL_LIMIT) || 20,
    waitForConnections: true,
    queueLimit:         0,

    // RDS 파라미터 그룹에서 require_secure_transport=ON 설정됨
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: true }
      : false,

    connectTimeout: 10_000,
  });
}

// 앱 시작 시 1회 초기화 후 싱글톤 반환
async function getPool() {
  if (!pool) {
    pool = await createPool();
    const conn = await pool.getConnection();
    conn.release();
    console.log('[DB] 연결 성공:', process.env.NODE_ENV === 'production' ? '(Secrets Manager)' : '(env)');
  }
  return pool;
}

// 초기화를 기다리지 않는 직접 호출용 proxy
// 사용: const db = require('./database'); await db.query(...)
module.exports = new Proxy(
  {},
  {
    get(_, prop) {
      return async (...args) => {
        const p = await getPool();
        return p[prop](...args);
      };
    },
  },
);

module.exports.getPool = getPool;
