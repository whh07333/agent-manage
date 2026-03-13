# OpenClaw AI Agent项目管理系统 - Iteration1 部署文档

## 文档信息
- **项目名称**: OpenClaw AI Agent专属项目管理系统
- **文档版本**: v1.0
- **迭代版本**: Iteration1
- **创建时间**: 2026-03-13
- **作者**: 赵六（技术负责人）
- **状态**: 待审核

---

## 1. 部署概述

### 1.1 系统架构
```
┌───────────────────────────────────────────────────────────────┐
│                     OpenClaw AI Agent项目管理系统                     │
├───────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────┐ │
│  │  前端应用     │  │  后端API    │  │  数据库      │  │ 缓存  │ │
│  │  (React)     │  │  (Node.js)   │  │  (PostgreSQL)│  │  (Redis) │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────┘ │
│           │                │               │               │    │
│           └────────────┬────┘               │               │    │
│                        │                    │               │    │
│                  ┌──────────────┐           │               │    │
│                  │  负载均衡    │           │               │    │
│                  │  (Nginx)     │           │               │    │
│                  └──────────────┘           │               │    │
│                        │                    │               │    │
│                        │                    │               │    │
│                        │                    │               │    │
│                  ┌──────────────┐           │               │    │
│                  │  监控系统    │           │               │    │
│                  │  (Prometheus+Grafana)  │               │    │
│                  └──────────────┘           │               │    │
│                        │                    │               │    │
│                        │                    │               │    │
│                  ┌──────────────┐           │               │    │
│                  │  日志系统    │           │               │    │
│                  │  (ELK Stack) │           │               │    │
│                  └──────────────┘           │               │    │
└───────────────────────────────────────────────────────────────┘
```

### 1.2 部署方式
- **开发环境**: Docker Compose
- **测试环境**: Docker Compose
- **生产环境**: Kubernetes + Docker

### 1.3 部署顺序
1. 基础服务（数据库、缓存）
2. 后端API服务
3. 前端应用
4. 负载均衡
5. 监控系统
6. 日志系统

---

## 2. 开发环境部署

### 2.1 环境要求
| 软件 | 版本 | 说明 |
|------|------|----------|
| Docker | 20.10+ | 容器化平台 |
| Docker Compose | 1.28+ | 容器编排工具 |
| Node.js | 18.12+ | 开发工具 |
| Git | 2.30+ | 版本管理 |

### 2.2 部署步骤

#### 2.2.1 克隆代码
```bash
# 克隆代码
git clone https://github.com/openclaw/agent-manage.git
cd agent-manage

# 创建环境变量文件
cp .env.example .env
# 编辑.env文件，配置数据库密码、JWT密钥等
vim .env
```

#### 2.2.2 启动服务
```bash
# 启动所有服务
docker-compose -f docker-compose.dev.yml up -d

# 查看服务状态
docker-compose -f docker-compose.dev.yml ps

# 查看服务日志
docker-compose -f docker-compose.dev.yml logs -f
```

#### 2.2.3 初始化数据库
```bash
# 进入后端容器
docker exec -it agent-manage-backend bash

# 执行数据库迁移
npm run db:migrate

# 初始化种子数据（可选）
npm run db:seed
```

#### 2.2.4 验证部署
```bash
# 验证前端应用
curl -s http://localhost:3000 | head -20

# 验证后端API
curl -s http://localhost:3001/health | python -m json.tool

# 验证数据库连接
psql -h localhost -U postgres -d agent_manage -c "SELECT count(*) FROM users;"
```

### 2.3 开发环境配置
#### 2.3.1 前端开发配置
```bash
# 进入前端容器
docker exec -it agent-manage-frontend bash

# 安装依赖
npm install

# 启动开发服务器
npm start

# 或者使用热重载
npm run dev
```

#### 2.3.2 后端开发配置
```bash
# 进入后端容器
docker exec -it agent-manage-backend bash

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行单元测试
npm test

# 运行代码检查
npm run lint
```

---

## 3. 测试环境部署

### 3.1 环境要求
| 软件 | 版本 | 说明 |
|------|------|----------|
| Docker | 20.10+ | 容器化平台 |
| Docker Compose | 1.28+ | 容器编排工具 |

### 3.2 部署步骤

#### 3.2.1 克隆代码
```bash
# 克隆代码
git clone -b release-1.0 https://github.com/openclaw/agent-manage.git
cd agent-manage

# 创建环境变量文件
cp .env.example .env.test
# 编辑.env.test文件，配置测试环境参数
vim .env.test
```

#### 3.2.2 启动服务
```bash
# 启动所有服务
docker-compose -f docker-compose.test.yml up -d

# 查看服务状态
docker-compose -f docker-compose.test.yml ps

# 查看服务日志
docker-compose -f docker-compose.test.yml logs -f
```

#### 3.2.3 初始化数据库
```bash
# 进入后端容器
docker exec -it agent-manage-test-backend bash

# 执行数据库迁移
npm run db:migrate

# 初始化测试数据
npm run db:seed:test
```

#### 3.2.4 运行测试
```bash
# 运行后端单元测试
docker exec -it agent-manage-test-backend npm run test:coverage

# 运行前端单元测试
docker exec -it agent-manage-test-frontend npm run test:coverage

# 运行集成测试
npm run test:integration

# 运行性能测试
npm run test:performance
```

#### 3.2.5 验证部署
```bash
# 验证前端应用
curl -s http://test.agent-manage.openclaw.com | head -20

# 验证后端API
curl -s http://api.test.agent-manage.openclaw.com/health | python -m json.tool

# 验证数据库连接
psql -h test-db.agent-manage.openclaw.com -U testuser -d testdb -c "SELECT count(*) FROM users;"
```

---

## 4. 生产环境部署

### 4.1 环境要求
| 软件 | 版本 | 说明 |
|------|------|----------|
| Kubernetes | 1.23+ | 容器编排平台 |
| Docker | 20.10+ | 容器化平台 |
| Helm | 3.0+ | 包管理工具 |
| Terraform | 1.0+ | 基础设施即代码 |

### 4.2 基础设施部署

#### 4.2.1 创建Kubernetes集群
```hcl
# 使用Terraform创建Kubernetes集群
resource "aws_eks_cluster" "agent_manage" {
  name     = "agent-manage-cluster"
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = "1.23"

  vpc_config {
    subnet_ids         = aws_subnet.private.*.id
    security_group_ids = [aws_security_group.eks_cluster_sg.id]
  }

  tags = {
    Environment = "production"
  }
}
```

#### 4.2.2 创建数据库实例
```hcl
# 使用Terraform创建RDS实例
resource "aws_db_instance" "agent_manage_db" {
  identifier            = "agent-manage-db"
  allocated_storage     = 100
  storage_type          = "gp2"
  engine                = "postgres"
  engine_version        = "15.2"
  instance_class        = "db.m5.large"
  name                  = "agent_manage"
  username              = "dbadmin"
  password              = var.db_password
  db_subnet_group_name  = aws_db_subnet_group.agent_manage_db_sg.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  skip_final_snapshot   = false
}
```

#### 4.2.3 创建Redis实例
```hcl
# 使用Terraform创建ElastiCache实例
resource "aws_elasticache_cluster" "agent_manage_redis" {
  cluster_id           = "agent-manage-redis"
  engine               = "redis"
  node_type            = "cache.m5.large"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis6.x"
  engine_version       = "6.x"
  port                 = 6379

  cluster_mode {
    replicas_per_node_group = 1
    num_node_groups         = 1
  }
}
```

### 4.3 应用部署

#### 4.3.1 后端API部署
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-manage-backend
  namespace: agent-manage
  labels:
    app: agent-manage-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agent-manage-backend
  template:
    metadata:
      labels:
        app: agent-manage-backend
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3001"
    spec:
      containers:
        - name: agent-manage-backend
          image: openclaw/agent-manage-backend:1.0.0
          ports:
            - containerPort: 3001
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: agent-manage-secret
                  key: DATABASE_URL
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: agent-manage-secret
                  key: REDIS_URL
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: agent-manage-secret
                  key: JWT_SECRET
          livenessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 60
            periodSeconds: 30
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /health
              port: 3001
            initialDelaySeconds: 30
            periodSeconds: 15
            failureThreshold: 3
```

#### 4.3.2 前端应用部署
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-manage-frontend
  namespace: agent-manage
  labels:
    app: agent-manage-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: agent-manage-frontend
  template:
    metadata:
      labels:
        app: agent-manage-frontend
    spec:
      containers:
        - name: agent-manage-frontend
          image: openclaw/agent-manage-frontend:1.0.0
          ports:
            - containerPort: 3000
          env:
            - name: REACT_APP_API_URL
              value: "https://api.agent-manage.openclaw.com"
          livenessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 60
            periodSeconds: 30
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 15
            failureThreshold: 3
```

#### 4.3.3 负载均衡配置
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: agent-manage-ingress
  namespace: agent-manage
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
    - hosts:
        - agent-manage.openclaw.com
        - api.agent-manage.openclaw.com
      secretName: agent-manage-tls
  rules:
    - host: agent-manage.openclaw.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: agent-manage-frontend
                port:
                  number: 3000
    - host: api.agent-manage.openclaw.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: agent-manage-backend
                port:
                  number: 3001
```

### 4.4 监控与日志

#### 4.4.1 监控系统部署
```yaml
apiVersion: monitoring.coreos.com/v1
kind: Prometheus
metadata:
  name: agent-manage-prometheus
  namespace: agent-manage
spec:
  serviceAccountName: prometheus
  serviceMonitorSelector:
    matchLabels:
      app: agent-manage
  ruleSelector:
    matchLabels:
      app: agent-manage
  resources:
    requests:
      memory: 400Mi
    limits:
      memory: 1000Mi
  enableAdminAPI: false

---

apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: agent-manage-backend-monitor
  namespace: agent-manage
  labels:
    app: agent-manage
spec:
  selector:
    matchLabels:
      app: agent-manage-backend
  endpoints:
    - port: 3001
      path: /metrics
      interval: 30s
      scrapeTimeout: 10s
```

#### 4.4.2 日志系统部署
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluent-bit-config
  namespace: logging
data:
  fluent-bit.conf: |
    [SERVICE]
        Flush        1
        Log_Level    info
        Daemon       off
        Parsers_File parsers.conf
        HTTP_Server  On
        HTTP_Listen  0.0.0.0
        HTTP_Port    2020

    [INPUT]
        Name              tail
        Path              /var/log/containers/agent-manage*.log
        Parser            docker
        Tag               kube.agent-manage.*
        Refresh_Interval  10

    [FILTER]
        Name                kubernetes
        Match               kube.agent-manage.*
        Kube_URL            https://kubernetes.default.svc.cluster.local:443
        Merge_Log           On
        Keep_Log            Off
        K8S-Logging.Parser  On
        K8S-Logging.Exclude Off

    [OUTPUT]
        Name            es
        Match           kube.agent-manage.*
        Host            ${FLUENT_ELASTICSEARCH_HOST}
        Port            ${FLUENT_ELASTICSEARCH_PORT}
        Logstash_Format On
        Logstash_Prefix agent-manage
        Retry_Limit     False
        Type            _doc
```

---

## 5. 应用配置

### 5.1 环境变量配置
| 变量名 | 说明 | 必填 | 默认值 |
|------|------|------|----------|
| NODE_ENV | 运行环境 | 是 | development |
| PORT | 监听端口 | 是 | 3001 |
| DATABASE_URL | 数据库连接字符串 | 是 | postgres://localhost/agent_manage |
| REDIS_URL | Redis连接字符串 | 是 | redis://localhost:6379 |
| JWT_SECRET | JWT密钥 | 是 |  |
| JWT_EXPIRES_IN | JWT有效期 | 否 | 24h |
| MAX_UPLOAD_SIZE | 最大上传文件大小 | 否 | 50MB |
| ALLOWED_ORIGINS | 允许的跨域来源 | 否 | http://localhost:3000 |
| LOG_LEVEL | 日志级别 | 否 | info |

### 5.2 数据库配置
```json
{
  "development": {
    "username": "postgres",
    "password": "password",
    "database": "agent_manage",
    "host": "localhost",
    "dialect": "postgres",
    "logging": false
  },
  "test": {
    "username": "testuser",
    "password": "testpassword",
    "database": "testdb",
    "host": "localhost",
    "dialect": "postgres",
    "logging": false
  },
  "production": {
    "username": process.env.DB_USERNAME,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_NAME,
    "host": process.env.DB_HOST,
    "dialect": "postgres",
    "logging": false,
    "dialectOptions": {
      "ssl": {
        "rejectUnauthorized": false
      }
    }
  }
}
```

### 5.3 日志配置
```javascript
const winston = require('winston');
const { combine, timestamp, label, printf } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    label({ label: 'agent-manage' }),
    timestamp(),
    myFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

module.exports = logger;
```

---

## 6. 安全与合规

### 6.1 网络安全
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: agent-manage-network-policy
  namespace: agent-manage
spec:
  podSelector:
    matchLabels:
      app: agent-manage
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: nginx
      ports:
        - protocol: TCP
          port: 3000
        - protocol: TCP
          port: 3001
    - from:
        - podSelector:
            matchLabels:
              app: prometheus
      ports:
        - protocol: TCP
          port: 3001
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - podSelector:
            matchLabels:
              app: redis
      ports:
        - protocol: TCP
          port: 6379
    - to:
        - ipBlock:
            cidr: 0.0.0.0/0
      ports:
        - protocol: UDP
          port: 53
```

### 6.2 加密传输
```nginx
server {
    listen 443 ssl http2;
    server_name api.agent-manage.openclaw.com;

    ssl_certificate /etc/letsencrypt/live/agent-manage.openclaw.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/agent-manage.openclaw.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers off;

    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    location / {
        proxy_pass http://agent-manage-backend:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6.3 备份与恢复
```bash
# 数据库备份
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/path/to/backups
DATABASE_URL="postgres://dbadmin:password@agent-manage-db:5432/agent_manage"

pg_dump -F c -b -v -f $BACKUP_DIR/agent_manage_$DATE.dump $DATABASE_URL
gzip $BACKUP_DIR/agent_manage_$DATE.dump

# 保留最近30天的备份
find $BACKUP_DIR -name "agent_manage_*.dump.gz" -type f -mtime +30 -delete
```

---

## 7. 维护与监控

### 7.1 常见问题

#### 7.1.1 数据库连接失败
```bash
# 检查数据库连接
curl -v http://api.agent-manage.openclaw.com/health

# 查看数据库日志
kubectl logs -n agent-manage -l app=postgres

# 检查网络连接
kubectl exec -it agent-manage-backend-5d6f7f8d7-2kf4j -- ping postgres
```

#### 7.1.2 内存泄漏
```bash
# 查看内存使用情况
kubectl top pod -n agent-manage

# 查看进程信息
kubectl exec -it agent-manage-backend-5d6f7f8d7-2kf4j -- ps aux

# 分析堆快照
kubectl port-forward agent-manage-backend-5d6f7f8d7-2kf4j 9229:9229
# 使用Chrome DevTools连接分析
```

#### 7.1.3 高CPU使用率
```bash
# 查看CPU使用情况
kubectl top pod -n agent-manage

# 查看进程信息
kubectl exec -it agent-manage-backend-5d6f7f8d7-2kf4j -- top

# 分析火焰图
kubectl port-forward agent-manage-backend-5d6f7f8d7-2kf4j 4040:4040
# 使用pprof分析
```

### 7.2 定期维护任务
| 任务 | 频率 | 操作 |
|------|------|----------|
| 数据库优化 | 每周 | VACUUM FULL VERBOSE ANALYZE; |
| 日志清理 | 每天 | 删除超过7天的日志文件 |
| 备份检查 | 每周 | 验证备份文件的完整性 |
| 性能测试 | 每月 | 运行性能测试，检查系统响应时间 |
| 安全扫描 | 每季度 | 使用OWASP ZAP进行安全扫描 |

---

## 8. 升级与回滚

### 8.1 应用升级
```bash
# 备份当前部署
kubectl get deployments -o yaml > deployments.backup.yaml

# 查看可用的版本
helm search repo openclaw/agent-manage

# 升级应用
helm upgrade agent-manage openclaw/agent-manage --version 1.0.0

# 验证升级结果
kubectl rollout status deployment agent-manage-backend

# 查看新部署的Pods
kubectl get pods -n agent-manage
```

### 8.2 数据库迁移
```bash
# 执行迁移
kubectl exec -it agent-manage-backend-5d6f7f8d7-2kf4j -- npm run db:migrate

# 查看迁移历史
kubectl exec -it agent-manage-backend-5d6f7f8d7-2kf4j -- npm run db:migrate:status

# 回滚迁移
kubectl exec -it agent-manage-backend-5d6f7f8d7-2kf4j -- npm run db:migrate:undo
```

### 8.3 系统回滚
```bash
# 回滚到上一个版本
kubectl rollout undo deployment agent-manage-backend

# 回滚到特定版本
kubectl rollout undo deployment agent-manage-backend --to-revision=2

# 查看回滚历史
kubectl rollout history deployment agent-manage-backend

# 验证回滚结果
kubectl rollout status deployment agent-manage-backend
```

---

## 9. 文档更新

### 9.1 部署文档更新
- **版本变更**: 更新文档版本号和更新日期
- **内容修改**: 记录修改内容和修改时间
- **格式调整**: 保持文档结构一致

### 9.2 操作手册更新
- 新增功能的操作步骤
- 变更功能的操作说明
- 删除功能的操作指导

### 9.3 问题记录更新
- 新增常见问题和解决方案
- 更新现有问题的解决方法
- 删除已过时的问题记录

---

## 10. 联系方式

### 10.1 技术支持
- **邮箱**：support@openclaw.com
- **电话**：400-123-4567
- **在线客服**：工作日 9:00-18:00

### 10.2 反馈渠道
- **问题反馈**：通过API返回错误信息
- **功能建议**：发送邮件到 product@openclaw.com
- **bug报告**：在GitHub提交issue

---

