import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Space } from 'antd';
import {
  ProjectOutlined,
  TaskOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  RefreshOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart, Bar, Cell } from 'recharts';
import { statisticsApi } from '../../services/api';
import { Statistics } from '../../types';

// 模拟数据
const mockProjectTrend = [
  { date: '01', value: 5 },
  { date: '02', value: 8 },
  { date: '03', value: 12 },
  { date: '04', value: 15 },
  { date: '05', value: 18 },
  { date: '06', value: 22 },
  { date: '07', value: 25 },
];

const mockAgentWorkload = [
  { name: '开发Agent', type: 'development', tasks: 15 },
  { name: '测试Agent', type: 'testing', tasks: 8 },
  { name: '产品Agent', type: 'product', tasks: 6 },
  { name: '管理Agent', type: 'management', tasks: 3 },
];

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d'];

export const Analytics: React.FC = () => {
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
          // 使用模拟数据
          setStatistics({
            activeProjects: 35,
            pendingReviewTasks: 22,
            blockedTasks: 12,
            averageDeliveryTime: 5.2,
            projectTrend: mockProjectTrend,
            agentWorkload: mockAgentWorkload,
            taskStatusDistribution: [],
            projectEfficiency: [],
          });
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
        // 使用模拟数据
        setStatistics({
          activeProjects: 35,
          pendingReviewTasks: 22,
          blockedTasks: 12,
          averageDeliveryTime: 5.2,
          projectTrend: mockProjectTrend,
          agentWorkload: mockAgentWorkload,
          taskStatusDistribution: [],
          projectEfficiency: [],
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
          统计分析
        </h2>
        <Space>
          <Button icon={<FilterOutlined />}>筛选时间</Button>
          <Button icon={<RefreshOutlined />} onClick={() => window.location.reload()}>
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
              title="项目总数"
              value={statistics?.activeProjects || 0}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="完成项目"
              value={statistics?.pendingReviewTasks || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="平均时间"
              value={statistics?.averageDeliveryTime || 0}
              prefix={<ClockCircleOutlined />}
              suffix="天"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="阻塞率"
              value={statistics?.blockedTasks || 0}
              prefix={<WarningOutlined />}
              suffix="%"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="项目创建趋势">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statistics?.projectTrend || mockProjectTrend}>
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
          <Card title="任务完成趋势">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics?.agentWorkload || mockAgentWorkload}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tasks" fill="#1890ff">
                  {statistics?.agentWorkload?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  )) || []}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Agent效率分析 */}
      <Card title="Agent效率分析">
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          Agent效率分析功能开发中...
        </div>
      </Card>
    </div>
  );
};
