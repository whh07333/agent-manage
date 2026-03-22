import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Space } from 'antd';
import {
  ProjectOutlined,
  CheckSquareOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  RestOutlined,
  ExportOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, Cell } from 'recharts';
import { statisticsApi } from '../../services/api';
import type { Statistics } from '../../types';

// 模拟数据
const mockProjectTrend = [
  { date: '03-01', value: 5 },
  { date: '03-02', value: 8 },
  { date: '03-03', value: 12 },
  { date: '03-04', value: 15 },
  { date: '03-05', value: 18 },
  { date: '03-06', value: 22 },
  { date: '03-07', value: 25 },
];

const mockAgentWorkload = [
  { name: '开发Agent', type: 'development', tasks: 15 },
  { name: '测试Agent', type: 'testing', tasks: 8 },
  { name: '产品Agent', type: 'product', tasks: 6 },
  { name: '管理Agent', type: 'management', tasks: 3 },
];



const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d'];

export const Dashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await statisticsApi.getStatistics();
        if (response.code === 0) {
          setStatistics(response.data);
        } else {
          console.error('获取统计数据失败:', response.msg);
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
        // 使用模拟数据
        setStatistics({
          active_projects: 24,
          pending_review_tasks: 8,
          blocked_tasks: 3,
          average_delivery_time: 5.2,
          project_trend: mockProjectTrend,
          agent_workload: mockAgentWorkload,
          task_status_distribution: [],
          project_efficiency: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        加载中...
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          仪表盘
        </h2>
        <Space>
          <Button icon={<FilterOutlined />}>筛选时间</Button>
          <Button icon={<RestOutlined />} onClick={() => window.location.reload()}>
            刷新
          </Button>
          <Button icon={<ExportOutlined />} type="primary">
            导出
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="活跃项目数"
              value={statistics?.active_projects || 0}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="待验收任务"
              value={statistics?.pending_review_tasks || 0}
              prefix={<CheckSquareOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="阻塞任务数"
              value={statistics?.blocked_tasks || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="平均交付周期"
              value={statistics?.average_delivery_time || 0}
              prefix={<ClockCircleOutlined />}
              suffix="天"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="项目进度趋势" style={{ height: '100%' }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statistics?.project_trend || mockProjectTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#1890ff" strokeWidth={2} fill="#e6f7ff" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Agent工作负载" style={{ height: '100%' }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics?.agent_workload || mockAgentWorkload}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tasks" fill="#1890ff">
                  {(statistics?.agent_workload || mockAgentWorkload).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 任务列表 */}
      <Card title="待处理任务">
        <div style={{ fontSize: '16px', color: '#666' }}>
          暂无待处理任务
        </div>
      </Card>
    </div>
  );
};

