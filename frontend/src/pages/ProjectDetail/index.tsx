import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Tabs, Tag, Progress, List, Avatar } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { projectApi, taskApi } from '../../services/api';
import type { Project, Task } from '../../types';

// 模拟项目数据
const mockProject: Project = {
  id: '1',
  name: '项目A - 电商平台重构',
  description: '基于微服务架构的电商平台重构项目',
  status: 'active',
  priority: 'P0',
  manager: '产品Agent',
  startDate: '2026-03-12',
  endDate: '2026-04-12',
  progress: 85,
  taskCount: 24,
  tasks: {
    total: 24,
    unassigned: 3,
    inProgress: 12,
    completed: 9,
    blocked: 0,
  },
  createdAt: '2026-03-12',
  updatedAt: '2026-03-13',
};

// 模拟任务数据
const mockTasks: Task[] = [
  {
    id: '1',
    name: '需求分析',
    description: '电商平台重构需求分析',
    status: 'unassigned',
    priority: 'P0',
    assignee: '产品Agent',
    projectId: '1',
    startDate: '2026-03-12',
    endDate: '2026-03-15',
    progress: 0,
    dependencies: [],
    deliverables: [],
    comments: [],
    createdAt: '2026-03-12',
    updatedAt: '2026-03-13',
  },
  {
    id: '2',
    name: '系统设计',
    description: '系统架构设计',
    status: 'inProgress',
    priority: 'P0',
    assignee: '开发Agent',
    projectId: '1',
    startDate: '2026-03-13',
    endDate: '2026-03-20',
    progress: 60,
    dependencies: [],
    deliverables: [],
    comments: [],
    createdAt: '2026-03-13',
    updatedAt: '2026-03-13',
  },
  {
    id: '3',
    name: '后端开发',
    description: '后端服务开发',
    status: 'blocked',
    priority: 'P0',
    assignee: '开发Agent',
    projectId: '1',
    startDate: '2026-03-15',
    endDate: '2026-03-25',
    progress: 30,
    dependencies: [],
    deliverables: [],
    comments: [],
    createdAt: '2026-03-15',
    updatedAt: '2026-03-13',
  },
  {
    id: '4',
    name: '前端开发',
    description: '前端界面开发',
    status: 'inProgress',
    priority: 'P1',
    assignee: '前端Agent',
    projectId: '1',
    startDate: '2026-03-20',
    endDate: '2026-03-30',
    progress: 45,
    dependencies: [],
    deliverables: [],
    comments: [],
    createdAt: '2026-03-20',
    updatedAt: '2026-03-13',
  },
  {
    id: '5',
    name: '测试',
    description: '功能测试',
    status: 'pendingReview',
    priority: 'P1',
    assignee: '测试Agent',
    projectId: '1',
    startDate: '2026-03-25',
    endDate: '2026-04-05',
    progress: 80,
    dependencies: [],
    deliverables: [],
    comments: [],
    createdAt: '2026-03-25',
    updatedAt: '2026-03-13',
  },
];

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 获取项目详情
        const projectResponse = await projectApi.getProject(id!);
        if (projectResponse.code === 0) {
          setProject(projectResponse.data);
        } else {
          console.error('获取项目详情失败:', projectResponse.msg);
          // 使用模拟数据
          setProject(mockProject);
        }

        // 获取任务列表
        const taskResponse = await taskApi.getTasks();
        if (taskResponse.code === 0) {
          setTasks(taskResponse.data);
        } else {
          console.error('获取任务列表失败:', taskResponse.msg);
          // 使用模拟数据
          setTasks(mockTasks);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
        // 使用模拟数据
        setProject(mockProject);
        setTasks(mockTasks);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        加载中...
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        项目不存在
      </div>
    );
  }

  // 获取状态标签颜色
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'blue';
      case 'overdue':
        return 'red';
      case 'completed':
        return 'green';
      case 'archived':
        return 'gray';
      default:
        return 'blue';
    }
  };

  // 获取任务状态图标
  const getTaskStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'unassigned':
        return <ClockCircleOutlined />;
      case 'inProgress':
        return <WarningOutlined />;
      case 'blocked':
        return <WarningOutlined style={{ color: '#f5222d' }} />;
      case 'pendingReview':
        return <CheckCircleOutlined style={{ color: '#faad14' }} />;
      case 'reviewed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'cancelled':
        return <DeleteOutlined style={{ color: '#d9d9d9' }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const tabItems = [
    {
      key: 'projectInfo',
      label: '项目信息',
      children: (
        <Card>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
              项目信息
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>项目名称</div>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>{project.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>负责人</div>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>{project.manager}</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>优先级</div>
                <Tag color={project.priority === 'P0' ? 'red' : 
                     project.priority === 'P1' ? 'orange' : 
                     project.priority === 'P2' ? 'blue' : 'green'}>
                  {project.priority}
                </Tag>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>状态</div>
                <Tag color={getStatusColor(project.status)}>
                  {project.status === 'active' ? '进行中' : 
                   project.status === 'overdue' ? '逾期' : 
                   project.status === 'completed' ? '已完成' : '已归档'}
                </Tag>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>周期</div>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>
                  {project.startDate} 至 {project.endDate}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>进度</div>
                <Progress percent={project.progress} strokeColor="#1890ff" size="small" />
              </div>
            </div>
          </div>
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
              项目描述
            </h3>
            <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
              {project.description}
            </div>
          </div>
          <div style={{ marginTop: '16px' }}>
            <Space>
              <Button icon={<EditOutlined />} onClick={() => console.log('编辑项目')}>
                编辑项目
              </Button>
              <Button icon={<DeleteOutlined />} danger onClick={() => console.log('删除项目')}>
                删除项目
              </Button>
            </Space>
          </div>
        </Card>
      ),
    },
    {
      key: 'taskManagement',
      label: '任务管理',
      children: (
        <Card>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
              任务列表 ({project.tasks.total}个任务)
            </h3>
            <Button icon={<PlusOutlined />} type="primary">
              创建任务
            </Button>
          </div>
          <List
            dataSource={tasks}
            renderItem={(task) => (
              <List.Item
                key={task.id}
                actions={[
                  <Button type="text" onClick={() => console.log('查看详情')}>
                    详情
                  </Button>,
                  <Button type="text" onClick={() => console.log('编辑')}>
                    编辑
                  </Button>,
                  <Button type="text" danger onClick={() => console.log('删除')}>
                    删除
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar style={{ backgroundColor: '#1890ff' }}>
                      {getTaskStatusIcon(task.status)}
                    </Avatar>
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '16px', fontWeight: '500' }}>{task.name}</span>
                      <Tag color={task.priority === 'P0' ? 'red' : 
                               task.priority === 'P1' ? 'orange' : 
                               task.priority === 'P2' ? 'blue' : 'green'}>
                        {task.priority}
                      </Tag>
                    </div>
                  }
                  description={
                    <div>
                      <p style={{ margin: '8px 0' }}>{task.description}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          负责人: {task.assignee}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          截止日期: {task.endDate}
                        </div>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ),
    },
    {
      key: 'ganttChart',
      label: '甘特图',
      children: (
        <Card>
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            甘特图功能开发中...
          </div>
        </Card>
      ),
    },
    {
      key: 'deliverables',
      label: '交付物',
      children: (
        <Card>
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            交付物管理功能开发中...
          </div>
        </Card>
      ),
    },
    {
      key: 'operationLog',
      label: '操作日志',
      children: (
        <Card>
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            操作日志功能开发中...
          </div>
        </Card>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')}>
          返回项目列表
        </Button>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          {project.name}
        </h2>
        <Space>
          <Button icon={<EditOutlined />} onClick={() => console.log('编辑')}>
            编辑项目
          </Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => console.log('删除')}>
            删除项目
          </Button>
        </Space>
      </div>

      <Tabs defaultActiveKey="projectInfo" items={tabItems} />
    </div>
  );
};
