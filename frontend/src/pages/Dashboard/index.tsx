import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import {
  ProjectOutlined,
  CheckSquareOutlined,
  WarningOutlined,
  RestOutlined,
} from '@ant-design/icons';
import { statisticsApi } from '../../services/api';
import type { Statistics } from '../../types';

export const Dashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await statisticsApi.getStatistics();
        if (response.code === 0) {
          setStatistics(response.data);
        } else {
          console.error('获取统计数据失败:', response.msg);
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
      } finally {
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>首页</h1>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="总项目数"
              value={statistics?.total_projects ?? 0}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="总任务数"
              value={statistics?.total_tasks ?? 0}
              prefix={<CheckSquareOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="阻塞任务"
              value={statistics?.blocked_tasks ?? 0}
              valueStyle={{ color: (statistics?.blocked_tasks ?? 0) > 0 ? '#cf1322' : undefined }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="待处理死信"
              value={statistics?.pending_dead_letters ?? 0}
              valueStyle={{ color: (statistics?.pending_dead_letters ?? 0) > 0 ? '#faad14' : undefined }}
              prefix={<RestOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
