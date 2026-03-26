import { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Space, DatePicker } from 'antd';
import { DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { statisticsApi } from '../../services/api';

import type { FullStatistics } from '../../types';

const { RangePicker } = DatePicker;

export const Analytics: React.FC = () => {
  const [stats, setStats] = useState<FullStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await statisticsApi.getRealTimeStatistics();
        setStats(response.data);
      } catch (error) {
        console.error('获取统计数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 柱状图颜色


  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '负责人',
      dataIndex: 'agent',
      key: 'agent',
    },
    {
      title: '任务数',
      dataIndex: 'tasks',
      key: 'tasks',
    },
    {
      title: '完成率',
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (value: number) => `${(value * 100).toFixed(1)}%`,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 'bold' }}>
          数据分析
        </h2>
        <Space>
          <RangePicker />
          <Button icon={<FilterOutlined />}>筛选</Button>
          <Button type="primary" icon={<DownloadOutlined />}>导出</Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="项目趋势" bordered={false} loading={loading}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.projectTrend || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Agent 负载" bordered={false} loading={loading}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={stats?.agentWorkload || []}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasks" fill="#52c41a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="项目效率排行" style={{ marginTop: 16 }} bordered={false} loading={loading}>
        <Table
          dataSource={stats?.projectEfficiency || []}
          columns={columns}
          pagination={false}
          rowKey="projectId"
        />
      </Card>
    </div>
  );
};
