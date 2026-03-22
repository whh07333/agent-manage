import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Pagination,
  Tag,
  Select,
  Progress,
  Tooltip
} from 'antd';
import {
  FilterOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { taskApi } from '../../services/api';
import type { Task } from '../../types';

const { Option } = Select;
const { Search } = Input;

// 模拟任务数据
const mockTasks: Task[] = [
  {
    id: '1',
    name: '需求分析',
    description: '电商平台重构需求分析',
    status: 'unassigned',
    priority: 'P0',
    assignee: '产品Agent',
    project_id: '1',
    start_date: '2026-03-12',
    end_date: '2026-03-15',
    progress: 0,
    dependencies: [],
    deliverables: [],
    comments: [],
    created_at: '2026-03-12',
    updated_at: '2026-03-13',
  },
  {
    id: '2',
    name: '技术方案设计',
    description: '微服务架构技术方案设计',
    status: 'inProgress',
    priority: 'P1',
    assignee: '架构Agent',
    project_id: '1',
    start_date: '2026-03-15',
    end_date: '2026-03-18',
    progress: 60,
    dependencies: ['1'],
    deliverables: [],
    comments: [],
    created_at: '2026-03-14',
    updated_at: '2026-03-16',
  },
  {
    id: '3',
    name: '数据库设计',
    description: '数据库表结构设计',
    status: 'inProgress',
    priority: 'P2',
    assignee: '数据Agent',
    project_id: '1',
    start_date: '2026-03-16',
    end_date: '2026-03-19',
    progress: 40,
    dependencies: ['2'],
    deliverables: [],
    comments: [],
    created_at: '2026-03-15',
    updated_at: '2026-03-16',
  },
  {
    id: '4',
    name: 'API接口开发',
    description: '用户管理模块API开发',
    status: 'pendingReview',
    priority: 'P0',
    assignee: '开发Agent',
    project_id: '2',
    start_date: '2026-03-10',
    end_date: '2026-03-13',
    progress: 100,
    dependencies: [],
    deliverables: [],
    comments: [],
    created_at: '2026-03-09',
    updated_at: '2026-03-13',
  },
  {
    id: '5',
    name: '前端页面开发',
    description: '用户管理页面开发',
    status: 'reviewed',
    priority: 'P1',
    assignee: '前端Agent',
    project_id: '2',
    start_date: '2026-03-13',
    end_date: '2026-03-16',
    progress: 100,
    dependencies: ['4'],
    deliverables: [],
    comments: [],
    created_at: '2026-03-12',
    updated_at: '2026-03-16',
  },
  {
    id: '6',
    name: '性能测试',
    description: '系统性能测试',
    status: 'blocked',
    priority: 'P2',
    assignee: '测试Agent',
    project_id: '3',
    start_date: '2026-03-14',
    end_date: '2026-03-17',
    progress: 30,
    dependencies: ['5'],
    deliverables: [],
    comments: [],
    created_at: '2026-03-13',
    updated_at: '2026-03-16',
  },
  {
    id: '7',
    name: '安全测试',
    description: '系统安全测试',
    status: 'cancelled',
    priority: 'P3',
    assignee: '安全Agent',
    project_id: '3',
    start_date: '2026-03-17',
    end_date: '2026-03-20',
    progress: 0,
    dependencies: [],
    deliverables: [],
    comments: [],
    created_at: '2026-03-16',
    updated_at: '2026-03-16',
  },
  {
    id: '8',
    name: '用户验收测试',
    description: '用户验收测试准备',
    status: 'unassigned',
    priority: 'P1',
    assignee: '测试Agent',
    project_id: '4',
    start_date: '2026-03-18',
    end_date: '2026-03-21',
    progress: 0,
    dependencies: [],
    deliverables: [],
    comments: [],
    created_at: '2026-03-17',
    updated_at: '2026-03-17',
  },
];

export const TaskList: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await taskApi.getTasks();
        if (response.code === 0) {
          setTasks(response.data);
        } else {
          console.error('获取任务列表失败:', response.msg);
          // 使用模拟数据
          setTasks(mockTasks);
        }
      } catch (error) {
        console.error('获取任务列表失败:', error);
        // 使用模拟数据
        setTasks(mockTasks);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 获取状态标签颜色
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'unassigned':
        return 'blue';
      case 'inProgress':
        return 'orange';
      case 'blocked':
        return 'red';
      case 'pendingReview':
        return 'gold';
      case 'reviewed':
        return 'green';
      case 'cancelled':
        return 'gray';
      default:
        return 'blue';
    }
  };

  // 获取状态显示文本
  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'unassigned':
        return '待分配';
      case 'inProgress':
        return '进行中';
      case 'blocked':
        return '阻塞';
      case 'pendingReview':
        return '待验收';
      case 'reviewed':
        return '已验收';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

  // 获取优先级标签颜色
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'P0':
        return 'red';
      case 'P1':
        return 'orange';
      case 'P2':
        return 'blue';
      case 'P3':
        return 'green';
      default:
        return 'blue';
    }
  };

  // 搜索和筛选任务
  const filteredTasks = tasks.filter(task => {
    // 搜索过滤
    const matchesSearch = !searchText ||
      task.name.toLowerCase().includes(searchText.toLowerCase()) ||
      task.description.toLowerCase().includes(searchText.toLowerCase()) ||
      task.assignee.toLowerCase().includes(searchText.toLowerCase());

    // 状态过滤
    const matchesStatus = !statusFilter || task.status === statusFilter;

    // 优先级过滤
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // 分页
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  // 表格列定义
  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: Task) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
            {text}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.description.length > 50
              ? `${record.description.substring(0, 50)}...`
              : record.description}
          </div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: Task['status']) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: Task['priority']) => (
        <Tag color={getPriorityColor(priority)}>
          {priority}
        </Tag>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 120,
    },
    {
      title: '项目',
      key: 'project',
      width: 120,
      render: (_: any, record: Task) => (
        <span>项目 {record.project_id}</span>
      ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Progress percent={progress} size="small" strokeWidth={5} style={{ margin: 0, flex: 1 }} />
          <span style={{ fontSize: '12px', color: '#666', minWidth: '30px' }}>{progress}%</span>
        </div>
      ),
    },
    {
      title: '截止日期',
      dataIndex: 'end_date',
      key: 'end_date',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: Task) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/tasks/${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          任务管理
        </h2>
        <Space>
          <Button icon={<PlusOutlined />} type="primary">
            创建任务
          </Button>
        </Space>
      </div>

      {/* 筛选和搜索区域 */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Search
            placeholder="搜索任务名称、描述或负责人"
            allowClear
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>状态:</span>
            <Select
              placeholder="全部状态"
              allowClear
              style={{ width: 120 }}
              onChange={setStatusFilter}
            >
              <Option value="unassigned">待分配</Option>
              <Option value="inProgress">进行中</Option>
              <Option value="blocked">阻塞</Option>
              <Option value="pendingReview">待验收</Option>
              <Option value="reviewed">已验收</Option>
              <Option value="cancelled">已取消</Option>
            </Select>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>优先级:</span>
            <Select
              placeholder="全部优先级"
              allowClear
              style={{ width: 120 }}
              onChange={setPriorityFilter}
            >
              <Option value="P0">P0</Option>
              <Option value="P1">P1</Option>
              <Option value="P2">P2</Option>
              <Option value="P3">P3</Option>
            </Select>
          </div>

          <Button icon={<FilterOutlined />}>
            更多筛选
          </Button>
        </div>
      </Card>

      {/* 任务表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={paginatedTasks}
          loading={loading}
          rowKey="id"
          pagination={false}
          onRow={(record) => ({
            onClick: () => navigate(`/tasks/${record.id}`),
            style: { cursor: 'pointer' }
          })}
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
            total={filteredTasks.length}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            showSizeChanger
            showTotal={(total) => `共 ${total} 个任务`}
          />
        </div>
      </Card>
    </div>
  );
};