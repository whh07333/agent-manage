import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Tabs, Tag, Avatar, Progress, List, Divider, Timeline } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  PlusOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { taskApi, projectApi } from '../../services/api';
import type { Task, Project } from '../../types';

// 任务历史记录类型定义
export interface TaskHistoryItem {
  id: string;
  action: 'create' | 'update' | 'status_change' | 'assign' | 'comment' | 'deliverable_upload' | 'accept' | 'block' | 'unblock';
  actor: string;
  actorType: 'agent' | 'human';
  oldValue?: any;
  newValue?: any;
  comment?: string;
  timestamp: string;
}

// 模拟任务数据
const mockTask: Task = {
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
  deliverables: [
    {
      id: '1',
      name: '需求分析文档',
      type: 'document',
      url: 'https://example.com/doc',
      version: '1.0',
      uploadedBy: '产品Agent',
      uploadedAt: '2026-03-12',
      comments: '文档已完成',
    },
    {
      id: '2',
      name: 'PRD文档',
      type: 'document',
      url: 'https://example.com/prd',
      version: '1.0',
      uploadedBy: '产品Agent',
      uploadedAt: '2026-03-12',
      comments: 'PRD文档已完成',
    },
  ],
  comments: [
    {
      id: '1',
      content: '需求分析已完成，等待评审',
      author: '产品Agent',
      authorType: 'agent',
      createdAt: '2026-03-12',
      replies: [],
    },
    {
      id: '2',
      content: '需求分析文档已审阅，内容完整',
      author: '开发Agent',
      authorType: 'agent',
      createdAt: '2026-03-13',
      replies: [],
    },
  ],
  createdAt: '2026-03-12',
  updatedAt: '2026-03-13',
};

// 模拟历史记录数据
const mockHistory: TaskHistoryItem[] = [
  {
    id: '1',
    action: 'create',
    actor: '产品Agent',
    actorType: 'agent',
    newValue: mockTask,
    timestamp: mockTask.createdAt,
  },
  {
    id: '2',
    action: 'update',
    actor: '产品Agent',
    actorType: 'agent',
    oldValue: { status: 'unassigned' },
    newValue: { status: 'inProgress' },
    comment: '开始需求分析工作',
    timestamp: '2026-03-12 09:30:00',
  },
  {
    id: '3',
    action: 'deliverable_upload',
    actor: '产品Agent',
    actorType: 'agent',
    newValue: { deliverable: '需求分析文档' },
    comment: '上传需求分析文档',
    timestamp: '2026-03-12 16:45:00',
  },
  {
    id: '4',
    action: 'comment',
    actor: '开发Agent',
    actorType: 'agent',
    newValue: { comment: '需求分析文档已审阅，内容完整' },
    timestamp: '2026-03-13 10:15:00',
  },
];

// 模拟项目数据
const mockProject: Project = {
  id: '1',
  name: '项目A - 电商平台重构',
  description: '基于微服务架构的电商平台重构项目',
  status: 'active',
  priority: 'P0',
  managerId: '00000000-0000-0000-0000-000000000001',
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

// 获取动作描述
const getActionDescription = (action: TaskHistoryItem['action']): string => {
  const descriptions: Record<TaskHistoryItem['action'], string> = {
    create: '创建任务',
    update: '更新信息',
    status_change: '状态变更',
    assign: '分配任务',
    comment: '添加评论',
    deliverable_upload: '上传交付物',
    accept: '验收任务',
    block: '上报阻塞',
    unblock: '解除阻塞',
  };
  return descriptions[action] || action;
};

// 获取动作颜色
const getActionColor = (action: TaskHistoryItem['action']): string => {
  const colors: Record<TaskHistoryItem['action'], string> = {
    create: 'green',
    update: 'blue',
    status_change: 'orange',
    assign: 'purple',
    comment: 'default',
    deliverable_upload: 'cyan',
    accept: 'green',
    block: 'red',
    unblock: 'green',
  };
  return colors[action] || 'default';
};

export const TaskDetail: React.FC = () => {
  const { id, taskId } = useParams<{ id: string; taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [history] = useState<TaskHistoryItem[]>(mockHistory);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 获取任务详情
        const taskResponse = await taskApi.getTask(taskId!);
        if (taskResponse.code === 0) {
          setTask(taskResponse.data);
        } else {
          console.error('获取任务详情失败:', taskResponse.msg);
          // 使用模拟数据
          setTask(mockTask);
        }

        // 获取项目详情
        const projectResponse = await projectApi.getProject(id!);
        if (projectResponse.code === 0) {
          setProject(projectResponse.data);
        } else {
          console.error('获取项目详情失败:', projectResponse.msg);
          // 使用模拟数据
          setProject(mockProject);
        }

        // TODO: 实际项目中从API获取历史记录
        // const historyResponse = await taskApi.getTaskHistory(taskId!);
        // if (historyResponse.code === 0) {
        //   setHistory(historyResponse.data);
        // }
      } catch (error) {
        console.error('获取数据失败:', error);
        // 使用模拟数据
        setTask(mockTask);
        setProject(mockProject);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, taskId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        加载中...
      </div>
    );
  }

  if (!task || !project) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        任务或项目不存在
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 xl:px-12 max-w-screen-2xl">
      <div style={{ marginBottom: '24px' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/projects/${id}`)}>
          返回项目详情
        </Button>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          {task.name}
        </h2>
        <Space>
          <Button icon={<EditOutlined />} onClick={() => console.log('编辑')}>
            编辑
          </Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => console.log('删除')}>
            删除
          </Button>
        </Space>
      </div>

      <Tabs defaultActiveKey="taskInfo" items={[
        {
          key: 'taskInfo',
          label: '任务信息',
          children: (
            <Card>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
                  任务信息
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>任务名称</div>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>{task.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>负责人</div>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>{task.assignee}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>优先级</div>
                    <Tag color={task.priority === 'P0' ? 'red' : 
                         task.priority === 'P1' ? 'orange' : 
                         task.priority === 'P2' ? 'blue' : 'green'}>
                      {task.priority}
                    </Tag>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>状态</div>
                    <Tag color={task.status === 'unassigned' ? 'blue' : 
                         task.status === 'inProgress' ? 'orange' : 
                         task.status === 'blocked' ? 'red' : 
                         task.status === 'pendingReview' ? 'gold' : 
                         task.status === 'reviewed' ? 'green' : 'gray'}>
                      {task.status === 'unassigned' ? '待分配' : 
                       task.status === 'inProgress' ? '进行中' : 
                       task.status === 'blocked' ? '阻塞' : 
                       task.status === 'pendingReview' ? '待验收' : 
                       task.status === 'reviewed' ? '已验收' : '已取消'}
                    </Tag>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>截止日期</div>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>{task.endDate}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>进度</div>
                    <Progress percent={task.progress} strokeColor="#1890ff" size="small" />
                  </div>
                </div>
              </div>
              <div>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
                  任务描述
                </h3>
                <div style={{ fontSize: '16px', lineHeight: '1.6' }}>
                  {task.description}
                </div>
              </div>
              <div style={{ marginTop: '16px' }}>
                <Space>
                  <Button icon={<EditOutlined />} onClick={() => console.log('编辑任务')}>
                    编辑任务
                  </Button>
                  <Button icon={<DeleteOutlined />} danger onClick={() => console.log('删除任务')}>
                    删除任务
                  </Button>
                </Space>
              </div>
            </Card>
          ),
        },
        {
          key: 'deliverables',
          label: '交付物',
          children: (
            <Card>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                  交付物列表
                </h3>
                <Button icon={<PlusOutlined />} type="primary">
                  上传交付物
                </Button>
              </div>
              <List
                dataSource={task.deliverables}
                renderItem={(deliverable) => (
                  <List.Item
                    key={deliverable.id}
                    actions={[
                      <Button type="text" onClick={() => console.log('查看')}>
                        查看
                      </Button>,
                      <Button type="text" onClick={() => console.log('下载')}>
                        下载
                      </Button>,
                      <Button type="text" onClick={() => console.log('删除')}>
                        删除
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar style={{ backgroundColor: '#1890ff' }}>
                          <FileTextOutlined />
                        </Avatar>
                      }
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '16px', fontWeight: '500' }}>{deliverable.name}</span>
                          <Tag color={deliverable.type === 'document' ? 'blue' : 
                                   deliverable.type === 'code' ? 'green' : 
                                   deliverable.type === 'image' ? 'orange' : 'gray'}>
                            {deliverable.type}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <p style={{ margin: '8px 0' }}>{deliverable.comments}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                              上传者: {deliverable.uploadedBy}
                            </div>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                              版本: {deliverable.version}
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
          key: 'comments',
          label: '评论',
          children: (
            <Card>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                  评论列表
                </h3>
                <Button icon={<PlusOutlined />} type="primary">
                  添加评论
                </Button>
              </div>
              <List
                dataSource={task.comments}
                renderItem={(comment) => (
                  <List.Item key={comment.id}>
                    <List.Item.Meta
                      avatar={
                        <Avatar style={{ backgroundColor: comment.authorType === 'agent' ? '#1890ff' : '#faad14' }}>
                          {comment.authorType === 'agent' ? 'AI' : 'U'}
                        </Avatar>
                      }
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '16px', fontWeight: '500' }}>{comment.author}</span>
                          <span style={{ fontSize: '14px', color: '#666' }}>{comment.createdAt}</span>
                        </div>
                      }
                      description={
                        <div>
                          <p style={{ margin: '8px 0' }}>{comment.content}</p>
                          {comment.replies.length > 0 && (
                            <div style={{ marginLeft: '24px', marginTop: '16px' }}>
                              <Divider style={{ margin: '8px 0' }} />
                              <List
                                dataSource={comment.replies}
                                renderItem={(reply) => (
                                  <List.Item key={reply.id}>
                                    <List.Item.Meta
                                      avatar={
                                        <Avatar style={{ backgroundColor: reply.authorType === 'agent' ? '#1890ff' : '#faad14' }}>
                                          {reply.authorType === 'agent' ? 'AI' : 'U'}
                                        </Avatar>
                                      }
                                      title={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span style={{ fontSize: '14px', fontWeight: '500' }}>{reply.author}</span>
                                          <span style={{ fontSize: '12px', color: '#666' }}>{reply.createdAt}</span>
                                        </div>
                                      }
                                      description={
                                        <p style={{ margin: '8px 0' }}>{reply.content}</p>
                                      }
                                    />
                                  </List.Item>
                                )}
                              />
                            </div>
                          )}
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
          key: 'history',
          label: '历史记录',
          children: (
            <Card>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
                  <HistoryOutlined /> 变更历史
                </h3>
                {history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                    暂无历史记录
                  </div>
                ) : (
                  <Timeline
                    items={history.map(item => ({
                      color: getActionColor(item.action),
                      children: (
                        <div key={item.id} style={{ paddingBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <div>
                              <Tag color={getActionColor(item.action)}>
                                {getActionDescription(item.action)}
                              </Tag>
                              <span style={{ marginLeft: '8px', fontSize: '14px', fontWeight: '500' }}>
                                {item.actor}
                              </span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#999' }}>
                              {item.timestamp}
                            </span>
                          </div>
                          {item.comment && (
                            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px', paddingLeft: '8px' }}>
                              {item.comment}
                            </div>
                          )}
                        </div>
                      ),
                    }))}
                  />
                )}
              </div>
            </Card>
          ),
        },
      ]} />
    </div>
  );
};
