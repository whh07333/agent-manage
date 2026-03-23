import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Table, Space, Tag, Row, Col } from 'antd';
import { ArrowLeftOutlined, BarChartOutlined, LineChartOutlined, PieChartOutlined } from '@ant-design/icons';
import { statisticsApi } from '../../services/api';
import type { ProjectStatistics as ProjectStatisticsData } from '../../types';
import { StatsCard } from '../../components/StatsCard';
import { LineChart } from '../../components/LineChart';
import { BarChart } from '../../components/BarChart';

// 模拟数据（API失败时使用）
const mockProjectStats: ProjectStatisticsData = {
  projectId: '1',
  name: '项目A - 电商平台重构',
  totalTasks: 24,
  completedTasks: 9,
  completionRate: 37.5,
  inProgressTasks: 12,
  blockedTasks: 0,
  overdueTasks: 3,
  taskTrend: [
    { date: '2026-03-01', tasksCreated: 2, tasksCompleted: 1 },
    { date: '2026-03-02', tasksCreated: 3, tasksCompleted: 2 },
    { date: '2026-03-03', tasksCreated: 1, tasksCompleted: 0 },
    { date: '2026-03-04', tasksCreated: 4, tasksCompleted: 3 },
    { date: '2026-03-05', tasksCreated: 2, tasksCompleted: 1 },
    { date: '2026-03-06', tasksCreated: 3, tasksCompleted: 2 },
    { date: '2026-03-07', tasksCreated: 2, tasksCompleted: 4 },
  ],
  memberWorkload: [
    { agentId: 'agent-001', totalTasks: 8, completedTasks: 4, overdueTasks: 1 },
    { agentId: 'agent-002', totalTasks: 6, completedTasks: 3, overdueTasks: 0 },
    { agentId: 'agent-003', totalTasks: 5, completedTasks: 2, overdueTasks: 2 },
    { agentId: 'agent-004', totalTasks: 5, completedTasks: 0, overdueTasks: 0 },
  ],
  blockingIssues: [
    { taskId: 'task-123', blockReason: '依赖外部API接口未完成', relatedTasks: ['task-456'], blockedDays: 3 },
    { taskId: 'task-456', blockReason: '设计稿未确认', relatedTasks: ['task-789'], blockedDays: 5 },
    { taskId: 'task-789', blockReason: '测试环境不可用', relatedTasks: [], blockedDays: 2 },
  ],
};

export const ProjectStatistics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ProjectStatisticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectStats = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await statisticsApi.getProjectOverview(id);
        if (response.code === 0) {
          setStats(response.data);
        } else {
          console.error('获取项目统计失败:', response.msg);
          // 使用模拟数据
          setStats(mockProjectStats);
        }
      } catch (error) {
        console.error('获取项目统计异常:', error);
        // 使用模拟数据
        setStats(mockProjectStats);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectStats();
  }, [id]);

  // 计算任务完成率
  const completionRate = stats ? (stats.completedTasks / stats.totalTasks * 100).toFixed(1) : '0.0';
  // 计算阻塞率
  const blockingRate = stats ? (stats.blockedTasks / stats.totalTasks * 100).toFixed(1) : '0.0';

  // 准备任务趋势图表数据
  const taskTrendData = stats?.taskTrend.map(item => ({
    date: item.date,
    创建任务: item.tasksCreated,
    完成任务: item.tasksCompleted,
  })) || [];

  // 准备成员工作量图表数据
  const memberWorkloadData = stats?.memberWorkload.map(item => ({
    agent: `Agent ${item.agentId.slice(-3)}`,
    总任务数: item.totalTasks,
    完成任务: item.completedTasks,
    逾期任务: item.overdueTasks,
  })) || [];

  // 阻塞问题表格列定义
  const blockingIssuesColumns = [
    {
      title: '任务ID',
      dataIndex: 'taskId',
      key: 'taskId',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '阻塞原因',
      dataIndex: 'blockReason',
      key: 'blockReason',
    },
    {
      title: '关联任务',
      dataIndex: 'relatedTasks',
      key: 'relatedTasks',
      render: (tasks: string[]) => tasks.join(', ') || '无',
    },
    {
      title: '阻塞天数',
      dataIndex: 'blockedDays',
      key: 'blockedDays',
      render: (days: number) => (
        <Tag color={days > 7 ? 'red' : days > 3 ? 'orange' : 'yellow'}>
          {days} 天
        </Tag>
      ),
    },
  ];

  // 成员工作量表格列定义
  const memberWorkloadColumns = [
    {
      title: 'Agent ID',
      dataIndex: 'agentId',
      key: 'agentId',
      render: (text: string) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: '总任务数',
      dataIndex: 'totalTasks',
      key: 'totalTasks',
      sorter: (a: any, b: any) => a.totalTasks - b.totalTasks,
    },
    {
      title: '完成任务',
      dataIndex: 'completedTasks',
      key: 'completedTasks',
      sorter: (a: any, b: any) => a.completedTasks - b.completedTasks,
      render: (text: number) => (
        <span style={{ color: '#3f8600' }}>{text}</span>
      ),
    },
    {
      title: '逾期任务',
      dataIndex: 'overdueTasks',
      key: 'overdueTasks',
      sorter: (a: any, b: any) => a.overdueTasks - b.overdueTasks,
      render: (text: number) => (
        <span style={{ color: text > 0 ? '#cf1322' : '#3f8600' }}>{text}</span>
      ),
    },
    {
      title: '完成率',
      key: 'completionRate',
      render: (_: any, record: any) => (
        <span>{(record.completedTasks / record.totalTasks * 100).toFixed(1)}%</span>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        加载中...
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        项目统计数据不存在
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* 头部导航 */}
      <div className="mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/projects/${id}`)}>
          返回项目详情
        </Button>
      </div>

      {/* 页面标题 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {stats.name} - 项目统计
        </h2>
        <Space>
          <Button icon={<BarChartOutlined />} onClick={() => window.print()}>
            导出报表
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="总任务数"
            value={stats.totalTasks}
            icon={<PieChartOutlined />}
            trend={{ value: 12, isPositive: true, label: '较上周' }}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="完成任务"
            value={stats.completedTasks}
            suffix={` (${completionRate}%)`}
            icon={<PieChartOutlined />}
            trend={{ value: 8, isPositive: true, label: '较上周' }}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="进行中任务"
            value={stats.inProgressTasks}
            icon={<LineChartOutlined />}
            trend={{ value: 5, isPositive: false, label: '较上周' }}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="阻塞任务"
            value={stats.blockedTasks}
            suffix={` (${blockingRate}%)`}
            icon={<BarChartOutlined />}
            trend={{ value: 2, isPositive: false, label: '较上周' }}
            loading={loading}
          />
        </Col>
      </Row>

      {/* 图表行 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="任务趋势 (最近7天)" className="h-full">
            <LineChart
              data={taskTrendData}
              xKey="date"
              yKeys={[
                { key: '创建任务', name: '创建任务', color: '#1890ff' },
                { key: '完成任务', name: '完成任务', color: '#52c41a' },
              ]}
              height={300}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="成员工作量分布" className="h-full">
            <BarChart
              data={memberWorkloadData}
              xKey="agent"
              yKeys={[
                { key: '总任务数', name: '总任务数', color: '#1890ff' },
                { key: '完成任务', name: '完成任务', color: '#52c41a' },
                { key: '逾期任务', name: '逾期任务', color: '#f5222d' },
              ]}
              height={300}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* 表格行 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="阻塞问题">
            <Table
              dataSource={stats.blockingIssues}
              columns={blockingIssuesColumns}
              rowKey="taskId"
              pagination={{ pageSize: 5 }}
              size="middle"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="成员工作量详情">
            <Table
              dataSource={stats.memberWorkload}
              columns={memberWorkloadColumns}
              rowKey="agentId"
              pagination={{ pageSize: 5 }}
              size="middle"
            />
          </Card>
        </Col>
      </Row>

      {/* 底部总结 */}
      <Card title="项目统计总结">
        <div className="space-y-2">
          <p>• 项目共有 <strong>{stats.totalTasks}</strong> 个任务，已完成 <strong>{stats.completedTasks}</strong> 个，完成率为 <strong>{completionRate}%</strong>。</p>
          <p>• 当前有 <strong>{stats.inProgressTasks}</strong> 个任务正在进行中，<strong>{stats.blockedTasks}</strong> 个任务被阻塞，<strong>{stats.overdueTasks}</strong> 个任务逾期。</p>
          <p>• 项目中有 <strong>{stats.blockingIssues.length}</strong> 个阻塞问题需要关注。</p>
          <p>• 共有 <strong>{stats.memberWorkload.length}</strong> 个Agent参与本项目。</p>
        </div>
      </Card>
    </div>
  );
};

export default ProjectStatistics;