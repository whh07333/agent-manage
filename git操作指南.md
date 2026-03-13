# Git 和 GitHub 操作指南

## 项目状态
✅ 项目已成功初始化 Git 仓库
✅ 第一次提交已完成（fd9255e）
✅ .gitignore 配置已创建
✅ 项目结构已完整建立

## 1. 建立代码仓库

### 方法一：在 GitHub 上创建（推荐）
1. 访问 [GitHub](https://github.com) 并登录
2. 点击页面右上角的 "+" 按钮
3. 选择 "New repository"
4. 填写：
   - 仓库名称：agent-manage
   - 描述：产品开发流程管理系统
   - 选择 public 或 private
   - 不勾选 "Initialize this repository with a README"（我们已经有了）
5. 点击 "Create repository"

### 方法二：使用 GitHub CLI
```bash
gh repo create agent-manage --description "产品开发流程管理系统" --private
```

## 2. 关联本地仓库到远程

### 在 GitHub 上创建仓库后，运行以下命令：
```bash
# 1. 复制 GitHub 提供的仓库地址
# 格式：git@github.com:username/agent-manage.git

# 2. 关联远程仓库
git remote add origin git@github.com:username/agent-manage.git

# 3. 验证关联
git remote -v

# 4. 推送到远程仓库
git push -u origin main
```

## 3. 提交代码

### 基本工作流程
```bash
# 1. 检查当前状态
git status

# 2. 查看变更内容
git diff

# 3. 暂存更改
git add .

# 4. 提交到本地仓库
git commit -m "feat: 添加用户管理功能"

# 5. 推送到远程仓库
git push
```

### 使用分支开发（推荐）
```bash
# 1. 创建新分支
git checkout -b feature/用户管理

# 2. 进行修改
# ... 编辑代码 ...

# 3. 提交修改
git add .
git commit -m "feat: 添加用户管理功能"

# 4. 推送到远程分支
git push origin feature/用户管理

# 5. 创建 PR（Pull Request）
gh pr create --base main --head feature/用户管理 --title "feat: 添加用户管理功能"
```

## 4. 修改代码

### 更新本地代码
```bash
# 1. 获取最新代码
git pull origin main

# 2. 创建新分支进行修改
git checkout -b fix/修复登录问题

# 3. 进行修改
# ... 修复代码 ...

# 4. 提交修改
git add .
git commit -m "fix: 修复登录验证问题"

# 5. 推送到远程
git push origin fix/修复登录问题

# 6. 创建 PR
gh pr create --base main --head fix/修复登录问题 --title "fix: 修复登录验证问题"
```

### 解决冲突
```bash
# 1. 检查冲突文件
git status

# 2. 编辑冲突文件，手动解决冲突

# 3. 标记冲突已解决
git add 冲突的文件

# 4. 完成提交
git commit -m "fix: 解决合并冲突"

# 5. 继续合并
git merge --continue
```

## 5. 查看和管理 PR

### 使用 GitHub CLI
```bash
# 列出所有 PR
gh pr list

# 查看 PR 详情
gh pr view 123

# 检查 PR 的 CI 状态
gh pr checks 123

# 查看评论
gh pr view 123 --comments

# 合并 PR
gh pr merge 123 --squash
```

### 使用 GitHub 网站
1. 访问仓库的 "Pull requests" 页面
2. 点击 PR 标题查看详情
3. 评论、添加标签、审批
4. 点击 "Merge pull request" 进行合并

## 6. 项目维护

### 查看项目信息
```bash
# 查看提交记录
git log --oneline

# 查看文件历史
git log -- filename

# 查看统计信息
git log --stat

# 查看提交图
git log --graph --oneline
```

### 恢复代码
```bash
# 恢复到某个提交
git reset --hard commit-hash

# 恢复文件的某个版本
git checkout commit-hash -- filename
```

## 7. 常用命令速查表

### 仓库操作
```bash
git init                      # 初始化本地仓库
git clone <url>              # 克隆远程仓库
git remote add origin <url>  # 添加远程仓库
git remote -v                # 查看远程配置
```

### 分支管理
```bash
git branch                   # 列出分支
git branch <name>           # 创建分支
git checkout <branch>       # 切换分支
git merge <branch>          # 合并分支
git branch -d <branch>      # 删除分支
```

### 提交操作
```bash
git add .                   # 暂存所有文件
git add <file>             # 暂存特定文件
git commit -m "message"    # 提交到本地仓库
git commit -a              # 跳过暂存区直接提交
```

### 远程操作
```bash
git pull                    # 拉取最新代码
git push                    # 推送到远程仓库
git push -u origin main     # 第一次推送并关联分支
```

## 8. 最佳实践

### 分支命名规范
```
feature/功能名称          # 新功能开发
fix/修复内容              # 修复 bug
refactor/重构内容          # 代码重构
docs/文档更新              # 文档修改
```

### 提交信息规范
```
feat: 添加用户管理功能     # 新功能
fix: 修复登录验证问题     # 修复 bug
refactor: 重构数据处理逻辑 # 代码重构
docs: 更新 API 文档       # 文档修改
```

### 定期维护
- 每周至少 push 代码到远程仓库
- 定期创建新分支进行开发
- 完成功能后及时创建 PR
- 定期更新 .gitignore 文件

---

**文档创建时间：** 2026-03-13  
**最后修改：** 2026-03-13  
**版本：** v1.0
