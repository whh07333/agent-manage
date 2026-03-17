import { useState, useEffect } from 'react';
import { Card, List, Button, Input, Space, Pagination, Tag, Progress } from 'antd';
import { FilterOutlined, PlusOutlined } from '@ant-design/icons';
import { projectApi } from '../../services/api';
import type { Project } from '../../types';

// 模拟数据
const mockProjects: Project[] = [
  {
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
  },
  {
    id: '2',
    name: '项目B - AI分析工具',
    description: 'AI分析工具开发项目',
    status: 'active',
    priority: 'P1',
    manager: '开发Agent',
    startDate: '2026-03-10',
    endDate: '2026-04-10',
    progress: 42,
    taskCount: 18,
    tasks: {
      total: 18,
      unassigned: 5,
      inProgress: 8,
      completed: 5,
      blocked: 0,
    },
    createdAt: '2026-03-10',
    updatedAt: '2026-03-13',
  },
  {
    id: '3',
    name: '项目C - 用户画像系统',
    description: '用户画像系统开发项目',
    status: 'active',
    priority: 'P2',
    manager: '测试Agent',
    startDate: '2026-03-15',
    endDate: '2026-04-15',
    progress: 25,
    taskCount: 12,
    tasks: {
      total: 12,
      unassigned: 8,
      inProgress: 4,
      completed: 0,
      blocked: 0,
    },
    createdAt: '2026-03-15',
    updatedAt: '2026-03-13',
  },
  {
    id: '4',
    name: '项目D - 数据可视化',
    description: '数据可视化工具开发项目',
    status: 'overdue',
    priority: 'P0',
    manager: '管理Agent',
    startDate: '2026-03-05',
    endDate: '2026-03-12',
    progress: 0,
    taskCount: 20,
    tasks: {
      total: 20,
      unassigned: 15,
      inProgress: 5,
      completed: 0,
      blocked: 3,
    },
    createdAt: '2026-03-05',
    updatedAt: '2026-03-13',
  },
];

export const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await projectApi.getProjects();
        if (response.code === 0) {
          setProjects(response.data);
        } else {
          console.error('获取项目列表失败:', response.msg);
          // 使用模拟数据
          setProjects(mockProjects);
        }
      } catch (error) {
        console.error('获取项目列表失败:', error);
        // 使用模拟数据
        setProjects(mockProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 搜索项目
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchText.toLowerCase()) ||
    project.description.toLowerCase().includes(searchText.toLowerCase())
  );

  // 分页
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  // 获取进度条颜色
  const getProgressColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return '#1890ff';
      case 'overdue':
        return '#f5222d';
      case 'completed':
        return '#52c41a';
      case 'archived':
        return '#d9d9d9';
      default:
        return '#1890ff';
    }
  };

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

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          项目管理
        </h2>
        <Space>
          <Input.Search
            placeholder="搜索项目"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Button icon={<FilterOutlined />}>筛选</Button>
          <Button icon={<PlusOutlined />} type="primary">
            创建项目
          </Button>
        </Space>
      </div>

      {/* 项目列表 */}
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 2,
          lg: 2,
          xl: 3,
          xxl: 3,
        }}
        dataSource={paginatedProjects}
        loading={loading}
        renderItem={(project) => (
          <List.Item>
            <Card
              hoverable
              style={{ height: '100%' }}
              actions={[
                <Button type="text" onClick={() => console.log('查看详情')}>
                  详情
                </Button>,
                <Button type="text" onClick={() => console.log('编辑')}>
                  编辑
                </Button>,
                <Button type="text" onClick={() => console.log('归档')}>
                  归档
                </Button>,
                <Button type="text" danger onClick={() => console.log('删除')}>
                  删除
                </Button>,
              ]}
            >
              <Card.Meta
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{project.name}</span>
                    <Tag color={getStatusColor(project.status)}>
                      {project.status === 'active' ? '进行中' : 
                       project.status === 'overdue' ? '逾期' : 
                       project.status === 'completed' ? '已完成' : '已归档'}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <p>{project.description}</p>
                    <div style={{ margin: '16px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#666' }}>负责人</span>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{project.manager}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#666' }}>优先级</span>
                        <Tag color={project.priority === 'P0' ? 'red' : 
                                     project.priority === 'P1' ? 'orange' : 
                                     project.priority === 'P2' ? 'blue' : 'green'}>
                          {project.priority}
                        </Tag>
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <Progress
                          percent={project.progress}
                          strokeColor={getProgressColor(project.status)}
                          size="small"
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                            {project.tasks.unassigned}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>待分配</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                            {project.tasks.inProgress}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>进行中</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                            {project.tasks.completed}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>已完成</div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              />
            </Card>
          </List.Item>
        )}
      />

      {/* 分页 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: '24px'
      }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredProjects.length}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
          showSizeChanger
          showTotal={(total) => `共 ${total} 个项目`}
        />
      </div>
    </div>
  );
};

