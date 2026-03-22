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
  project_id: '1',
  name: '项目A - 电商平台重构',
  total_tasks: 24,
  completed_tasks: 9,
  completion_rate: 37.5,
  in_progress_tasks: 12,
  blocked_tasks: 0,
  overdue_tasks: 3,
  task_trend: [
    { date: '2026-03-01', tasks_created: 2, tasks_completed: 1 },
    { date: '2026-03-02', tasks_created: 3, tasks_completed: 2 },
    { date: '2026-03-03', tasks_created: 1, tasks_completed: 0 },
    { date: '2026-03-04', tasks_created: 4, tasks_completed: 3 },
    { date: '2026-03-05', tasks_created: 2, tasks_completed: 1 },
    { date: '2026-03-06', tasks_created: 3, tasks_completed: 2 },
    { date: '2026-03-07', tasks_created: 2, tasks_completed: 4 },
  ],
  member_workload: [
    { agent_id: 'agent-001', total_tasks: 8, completed_tasks: 4, overdue_tasks: 1 },
    { agent_id: 'agent-002', total_tasks: 6, completed_tasks: 3, overdue_tasks: 0 },
    { agent_id: 'agent-003', total_tasks: 5, completed_tasks: 2, overdue_tasks: 2 },
    { agent_id: 'agent-004', total_tasks: 5, completed_tasks: 0, overdue_tasks: 0 },
  ],
  blocking_issues: [
    { task_id: 'task-123', block_reason: '依赖外部API接口未完成', related_tasks: ['task-456'], blocked_days: 3 },
    { task_id: 'task-456', block_reason: '设计稿未确认', related_tasks: ['task-789'], blocked_days: 5 },
    { task_id: 'task-789', block_reason: '测试环境不可用', related_tasks: [], blocked_days: 2 },
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
  const completionRate = stats ? (stats.completed_tasks / stats.total_tasks * 100).toFixed(1) : '0.0';
  // 计算阻塞率
  const blockingRate = stats ? (stats.blocked_tasks / stats.total_tasks * 100).toFixed(1) : '0.0';

  // 准备任务趋势图表数据
  const taskTrendData = stats?.task_trend.map(item => ({
    date: item.date,
    创建任务: item.tasks_created,
    完成任务: item.tasks_completed,
  })) || [];

  // 准备成员工作量图表数据
  const memberWorkloadData = stats?.member_workload.map(item => ({
    agent: `Agent ${item.agent_id.slice(-3)}`,
    总任务数: item.total_tasks,
    完成任务: item.completed_tasks,
    逾期任务: item.overdue_tasks,
  })) || [];

  // 阻塞问题表格列定义
  const blockingIssuesColumns = [
    {
      title: '任务ID',
      dataIndex: 'task_id',
      key: 'task_id',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '阻塞原因',
      dataIndex: 'block_reason',
      key: 'block_reason',
    },
    {
      title: '关联任务',
      dataIndex: 'related_tasks',
      key: 'related_tasks',
      render: (tasks: string[]) => tasks.join(', ') || '无',
    },
    {
      title: '阻塞天数',
      dataIndex: 'blocked_days',
      key: 'blocked_days',
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
      dataIndex: 'agent_id',
      key: 'agent_id',
      render: (text: string) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: '总任务数',
      dataIndex: 'total_tasks',
      key: 'total_tasks',
      sorter: (a: any, b: any) => a.total_tasks - b.total_tasks,
    },
    {
      title: '完成任务',
      dataIndex: 'completed_tasks',
      key: 'completed_tasks',
      sorter: (a: any, b: any) => a.completed_tasks - b.completed_tasks,
      render: (text: number) => (
        <span style={{ color: '#3f8600' }}>{text}</span>
      ),
    },
    {
      title: '逾期任务',
      dataIndex: 'overdue_tasks',
      key: 'overdue_tasks',
      sorter: (a: any, b: any) => a.overdue_tasks - b.overdue_tasks,
      render: (text: number) => (
        <span style={{ color: text > 0 ? '#cf1322' : '#3f8600' }}>{text}</span>
      ),
    },
    {
      title: '完成率',
      key: 'completion_rate',
      render: (_: any, record: any) => (
        <span>{(record.completed_tasks / record.total_tasks * 100).toFixed(1)}%</span>
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
            value={stats.total_tasks}
            icon={<PieChartOutlined />}
            trend={{ value: 12, isPositive: true, label: '较上周' }}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="完成任务"
            value={stats.completed_tasks}
            suffix={` (${completionRate}%)`}
            icon={<PieChartOutlined />}
            trend={{ value: 8, isPositive: true, label: '较上周' }}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="进行中任务"
            value={stats.in_progress_tasks}
            icon={<LineChartOutlined />}
            trend={{ value: 5, isPositive: false, label: '较上周' }}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="阻塞任务"
            value={stats.blocked_tasks}
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
              dataSource={stats.blocking_issues}
              columns={blockingIssuesColumns}
              rowKey="task_id"
              pagination={{ pageSize: 5 }}
              size="middle"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="成员工作量详情">
            <Table
              dataSource={stats.member_workload}
              columns={memberWorkloadColumns}
              rowKey="agent_id"
              pagination={{ pageSize: 5 }}
              size="middle"
            />
          </Card>
        </Col>
      </Row>

      {/* 底部总结 */}
      <Card title="项目统计总结">
        <div className="space-y-2">
          <p>• 项目共有 <strong>{stats.total_tasks}</strong> 个任务，已完成 <strong>{stats.completed_tasks}</strong> 个，完成率为 <strong>{completionRate}%</strong>。</p>
          <p>• 当前有 <strong>{stats.in_progress_tasks}</strong> 个任务正在进行中，<strong>{stats.blocked_tasks}</strong> 个任务被阻塞，<strong>{stats.overdue_tasks}</strong> 个任务逾期。</p>
          <p>• 项目中有 <strong>{stats.blocking_issues.length}</strong> 个阻塞问题需要关注。</p>
          <p>• 共有 <strong>{stats.member_workload.length}</strong> 个Agent参与本项目。</p>
        </div>
      </Card>
    </div>
  );
};

export default ProjectStatistics;