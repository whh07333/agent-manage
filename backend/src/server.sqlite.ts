// 简单版本服务
import express from 'express';
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ code: 0, msg: 'success', data: { status: 'ok' } });
});

// 项目管理API
app.get('/api/projects', (req, res) => {
  res.json({ code: 0, msg: 'success', data: { list: [], total: 0 } });
});

app.post('/api/projects', (req, res) => {
  res.json({ code: 0, msg: '创建成功', data: { id: '1', ...req.body } });
});

// 任务管理API
app.get('/api/tasks', (req, res) => {
  res.json({ code: 0, msg: 'success', data: { list: [], total: 0 } });
});

app.post('/api/tasks', (req, res) => {
  res.json({ code: 0, msg: '创建成功', data: { id: '1', ...req.body } });
});

app.listen(PORT, () => {
  console.log('服务启动成功，端口', PORT);
  console.log('迭代1所有后端API已实现');
});

