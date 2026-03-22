# AgentManage - AI Agent 项目管理系统

**项目介绍**: AI 驱动的敏捷项目管理系统，支持多 Agent 协作开发、自动任务分配、进度追踪、文档自动化。

## 项目信息
- **项目位置**: `/Users/whh073/.openclaw/project/AgentManage/`
- **知识库**: `/.mulch/` (Mulch 自我改进知识库)
- **创建日期**: 2026-03-12
- **当前迭代**: 迭代 1

## 核心文档飞书链接

| 文档 | 类型 | 飞书链接 |
|------|------|----------|
| **编码规范** | 开发规范 | [https://feishu.cn/docx/KCjcdvL1AoyDFmxnNJtcB6cpnQd](https://feishu.cn/docx/KCjcdvL1AoyDFmxnNJtcB6cpnQd) |
| **Git 操作指南** | 开发规范 | [https://feishu.cn/docx/OjtZdnHJgogobYxXhgLcbeoqnLd](https://feishu.cn/docx/OjtZdnHJgogobYxXhgLcbeoqnLd) |
| **项目代码和文档管理策略** | 项目规范 | [https://feishu.cn/docx/Tz49dPmynoP9bgxJravcion2nMd](https://feishu.cn/docx/Tz49dPmynoP9bgxJravcion2nMd) |

## Mulch 知识库

- **知识库路径**: `/Users/whh073/.openclaw/project/AgentManage/.mulch/`
- **已添加领域**: `frontend`、`backend`、`docs`、`workflow`、`config`
- **已记录规范**: 4 条核心项目规范

## 核心规范（来自 Mulch 知识库）

1. **飞书文档创建必须遵循**: `create` → `write` → `read` 三步流程，**禁止创建空文档**
2. **代码命名规范**: 变量/函数 `camelCase`，类 `PascalCase`，文件 `kebab-case`；字符串单引号，JSX 属性双引号
3. **Git 分支规范**: `feature/功能名`、`fix/问题名`、`refactor/重构名`，提交信息遵循 `<type>(<scope>): description>` 格式
4. **PR 规则**: 必须至少 1 人 review 才能合并

## 目录结构

```
AgentManage/
├── ProFile/                    # 项目文档目录
│   ├── Iteration1/            # 迭代 1
│   │   ├── requirment/        # 需求文档
│   │   ├── requirmentReView/  # 需求评审
│   │   ├── design/            # 设计文档
│   │   ├── frontSolu/        # 前端方案
│   │   ├── tecSolu/          # 技术方案
│   │   ├── sysArchi/         # 系统架构
│   │   ├── testCase/         # 测试用例
│   │   └── projectPlan/      # 项目计划
│   └── ...
├── frontend/                 # 前端代码
├── backend/                 # 后端代码
├── .mulch/                 # Mulch 知识库（项目规范和经验沉淀）
├── README.md               # 本文档
└── .gitignore            # Git 忽略配置
```

## 维护

- 任何文档修改后，请更新本文档中的链接表
- 新增文档请按照目录结构放置，并更新本表
- 遵循 `项目代码和文档管理策略.md` 中的版本控制规范

---

**最后更新**: 2026-03-20 由白云更新
