import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Progress, Table } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, DashboardOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// 定义实时监控统计数据类型
interface RealtimeStats {
  apiCalls: {
    total: number;
    success: number;
    error: number;
    errorRate: number;
    avgResponseTime: number;
  };
  eventPushes: {
    total: number;
    success: number;
    failure: number;
    successRate: number;
    pending: number;
  };
  systemHealth: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    uptime: string;
  };
  recentErrors: {
    id: string;
    time: string;
    endpoint: string;
    error: string;
    statusCode: number;
  }[];
}

export const RealtimeMonitoring: React.FC = () => {
  const [stats, setStats] = useState<RealtimeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 模拟数据 - 后续对接真实API
        const mockStats: RealtimeStats = {
          apiCalls: {
            total: 12480,
            success: 12020,
            error: 460,
            errorRate: 3.7,
            avgResponseTime: 245,
          },
          eventPushes: {
            total: 8920,
            success: 8760,
            failure: 160,
            successRate: 98.2,
            pending: 42,
          },
          systemHealth: {
            cpuUsage: 65.5,
            memoryUsage: 78.2,
            diskUsage: 45.8,
            uptime: '15天 8小时 32分',
          },
          recentErrors: [
            {
              id: '1',
              time: '2026-03-25 14:23:12',
              endpoint: '/api/projects/create',
              error: '数据库连接超时',
              statusCode: 500,
            },
            {
              id: '2',
              time: '2026-03-25 14:15:45',
              endpoint: '/api/tasks/update',
              error: '权限验证失败',
              statusCode: 403,
            },
            {
              id: '3',
              time: '2026-03-25 13:58:33',
              endpoint: '/api/events/push',
              error: '消息队列已满',
              statusCode: 503,
            },
            {
              id: '4',
              time: '2026-03-25 13:42:19',
              endpoint: '/api/agents/status',
              error: '服务不可用',
              statusCode: 502,
            },
            {
              id: '5',
              time: '2026-03-25 13:25:07',
              endpoint: '/api/audit/logs',
              error: '查询超时',
              statusCode: 504,
            },
          ],
        };
        setStats(mockStats);
      } catch (error) {
        console.error('获取实时监控数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // 模拟实时更新，每30秒刷新一次
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const errorColumns = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 150,
    },
    {
      title: '接口',
      dataIndex: 'endpoint',
      key: 'endpoint',
      width: 200,
    },
    {
      title: '错误信息',
      dataIndex: 'error',
      key: 'error',
      ellipsis: true,
    },
    {
      title: '状态码',
      dataIndex: 'statusCode',
      key: 'statusCode',
      width: 100,
      render: (code: number) => (
        <Text type={code >= 500 ? 'danger' : code >= 400 ? 'warning' : 'secondary'}>
          {code}
        </Text>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space align="center">
          <DashboardOutlined style={{ fontSize: 24, color: '#1890ff' }} />
          <Title level={2} style={{ margin: 0 }}>
            实时监控
          </Title>
        </Space>
        <Text type="secondary">最后更新: {new Date().toLocaleTimeString('zh-CN')}</Text>
      </div>

      {/* API调用统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12} lg={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title="API调用总量"
              value={stats?.apiCalls.total || 0}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ArrowUpOutlined />}
              suffix="次"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">今日累计</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title="API错误率"
              value={stats?.apiCalls.errorRate || 0}
              valueStyle={{ color: stats?.apiCalls.errorRate && stats.apiCalls.errorRate > 5 ? '#cf1322' : '#3f8600' }}
              prefix={stats?.apiCalls.errorRate && stats.apiCalls.errorRate > 5 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="%"
            />
            <Progress
              percent={stats?.apiCalls.errorRate || 0}
              size="small"
              status={stats?.apiCalls.errorRate && stats.apiCalls.errorRate > 5 ? 'exception' : 'normal'}
              showInfo={false}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">错误: {stats?.apiCalls.error || 0} 次</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title="平均响应时间"
              value={stats?.apiCalls.avgResponseTime || 0}
              valueStyle={{ color: stats?.apiCalls.avgResponseTime && stats.apiCalls.avgResponseTime > 500 ? '#faad14' : '#3f8600' }}
              suffix="ms"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                {stats?.apiCalls.avgResponseTime && stats.apiCalls.avgResponseTime > 500 ? '较慢' : '正常'}
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card bordered={false} loading={loading}>
            <Statistic
              title="API成功率"
              value={stats?.apiCalls.success ? ((stats.apiCalls.success / stats.apiCalls.total) * 100).toFixed(1) : 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
              suffix="%"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">成功: {stats?.apiCalls.success || 0} 次</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 事件推送统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12} lg={6}>
          <Card title="事件推送总量" bordered={false} loading={loading}>
            <Statistic
              value={stats?.eventPushes.total || 0}
              valueStyle={{ fontSize: 32, color: '#722ed1' }}
              suffix="个"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">今日推送事件</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card title="推送成功率" bordered={false} loading={loading}>
            <Statistic
              value={stats?.eventPushes.successRate || 0}
              valueStyle={{ fontSize: 32, color: '#52c41a' }}
              suffix="%"
            />
            <Progress
              percent={stats?.eventPushes.successRate || 0}
              size="small"
              status="active"
              strokeColor="#52c41a"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">失败: {stats?.eventPushes.failure || 0} 个</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card title="待处理事件" bordered={false} loading={loading}>
            <Statistic
              value={stats?.eventPushes.pending || 0}
              valueStyle={{ fontSize: 32, color: '#faad14' }}
              suffix="个"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">等待推送</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card title="推送失败率" bordered={false} loading={loading}>
            <Statistic
              value={stats?.eventPushes.failure ? ((stats.eventPushes.failure / stats.eventPushes.total) * 100).toFixed(1) : 0}
              valueStyle={{ fontSize: 32, color: '#f5222d' }}
              suffix="%"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">需人工干预</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 系统健康度卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card title="CPU使用率" bordered={false} loading={loading}>
            <Progress
              type="dashboard"
              percent={stats?.systemHealth.cpuUsage || 0}
              width={150}
              strokeColor={stats?.systemHealth.cpuUsage && stats.systemHealth.cpuUsage > 80 ? '#f5222d' : stats.systemHealth.cpuUsage > 60 ? '#faad14' : '#52c41a'}
            />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Text type="secondary">
                {stats?.systemHealth.cpuUsage && stats.systemHealth.cpuUsage > 80
                  ? '负载过高'
                  : stats.systemHealth.cpuUsage > 60
                  ? '负载正常'
                  : '负载较低'}
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="内存使用率" bordered={false} loading={loading}>
            <Progress
              type="dashboard"
              percent={stats?.systemHealth.memoryUsage || 0}
              width={150}
              strokeColor={stats?.systemHealth.memoryUsage && stats.systemHealth.memoryUsage > 85 ? '#f5222d' : stats.systemHealth.memoryUsage > 70 ? '#faad14' : '#52c41a'}
            />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Text type="secondary">
                {stats?.systemHealth.memoryUsage && stats.systemHealth.memoryUsage > 85
                  ? '内存紧张'
                  : stats.systemHealth.memoryUsage > 70
                  ? '使用正常'
                  : '使用充足'}
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="系统运行时间" bordered={false} loading={loading}>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Title level={1} style={{ color: '#1890ff' }}>
                {stats?.systemHealth.uptime || '0天'}
              </Title>
              <Text type="secondary">持续运行时间</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最近错误记录 */}
      <Card
        title={
          <Space>
            <WarningOutlined style={{ color: '#f5222d' }} />
            <span>最近错误记录</span>
          </Space>
        }
        bordered={false}
        loading={loading}
      >
        <Table
          dataSource={stats?.recentErrors || []}
          columns={errorColumns}
          pagination={{ pageSize: 5 }}
          rowKey="id"
          size="small"
        />
      </Card>
    </div>
  );
};