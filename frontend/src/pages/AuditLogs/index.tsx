import { useState, useEffect } from 'react';
import { Card, Button, Space, Input, Table, Tag, Badge, Avatar } from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  RefreshOutlined,
  ExportOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { auditLogApi } from '../../services/api';
import { AuditLog } from '../../types';

// 模拟数据
const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    action: 'create',
    resourceType: 'project',
    resourceId: '1',
    actor: '管理Agent',
    actorType: 'agent',
    ip: '192.168.1.100',
    timestamp: '2026-03-13 10:30:15',
    status: 'success',
    details: {
      request: { name: '项目A - 电商平台重构', description: '基于微服务架构的电商平台重构项目' },
      response: { id: '1', name: '项目A - 电商平台重构' },
    },
  },
  {
    id: '2',
    action: 'assign',
    resourceType: 'task',
    resourceId: '1',
    actor: '产品Agent',
    actorType: 'agent',
    ip: '192.168.1.101',
    timestamp: '2026-03-13 10:25:30',
    status: 'success',
    details: {
      request: { taskId: '1', assignee: '开发Agent' },
      response: { id: '1', assignee: '开发Agent' },
    },
  },
  {
    id: '3',
    action: 'update',
    resourceType: 'task',
    resourceId: '1',
    actor: '开发Agent',
    actorType: 'agent',
    ip: '192.168.1.102',
    timestamp: '2026-03-13 10:20:45',
    status: 'warning',
    details: {
      request: { status: 'inProgress' },
      response: { id: '1', status: 'inProgress' },
    },
  },
  {
    id: '4',
    action: 'query',
    resourceType: 'project',
    resourceId: '2',
    actor: '测试Agent',
    actorType: 'agent',
    ip: '192.168.1.103',
    timestamp: '2026-03-13 10:15:20',
    status: 'success',
    details: {
      request: { projectId: '2' },
      response: { id: '2', name: '项目B - AI分析工具' },
    },
  },
];

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await auditLogApi.getAuditLogs();
        if (response.code === 0) {
          setLogs(response.data);
        } else {
          console.error('获取审计日志失败:', response.msg);
          // 使用模拟数据
          setLogs(mockAuditLogs);
        }
      } catch (error) {
        console.error('获取审计日志失败:', error);
        // 使用模拟数据
        setLogs(mockAuditLogs);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 获取操作类型标签颜色
  const getActionTypeColor = (action: AuditLog['action']) => {
    switch (action) {
      case 'create':
        return 'green';
      case 'update':
        return 'blue';
      case 'delete':
        return 'red';
      case 'query':
        return 'orange';
      case 'assign':
        return 'purple';
      case 'review':
        return 'cyan';
      default:
        return 'gray';
    }
  };

  // 获取状态标签颜色
  const getStatusColor = (status: AuditLog['status']) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'failed':
        return 'red';
      case 'warning':
        return 'orange';
      default:
        return 'gray';
    }
  };

  // 获取操作类型图标
  const getActionTypeIcon = (action: AuditLog['action']) => {
    switch (action) {
      case 'create':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'update':
        return <WarningOutlined style={{ color: '#1890ff' }} />;
      case 'delete':
        return <WarningOutlined style={{ color: '#f5222d' }} />;
      case 'query':
        return <SearchOutlined style={{ color: '#faad14' }} />;
      case 'assign':
        return <UserOutlined style={{ color: '#722ed1' }} />;
      case 'review':
        return <UserOutlined style={{ color: '#13c2c2' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  // 表格列配置
  const columns = [
    {
      title: '操作时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text: string) => <span style={{ fontSize: '14px', color: '#666' }}>{text}</span>,
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      render: (action: AuditLog['action']) => (
        <Tag color={getActionTypeColor(action)}>
          {action === 'create' ? '创建' : 
           action === 'update' ? '更新' : 
           action === 'delete' ? '删除' : 
           action === 'query' ? '查询' : 
           action === 'assign' ? '分配' : 
           action === 'review' ? '评审' : '未知'}
        </Tag>
      ),
    },
    {
      title: '操作人',
      dataIndex: 'actor',
      key: 'actor',
      render: (actor: string, record: AuditLog) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar style={{ backgroundColor: record.actorType === 'agent' ? '#1890ff' : '#faad14' }}>
            {record.actorType === 'agent' ? 'AI' : 'U'}
          </Avatar>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>{actor}</span>
        </div>
      ),
    },
    {
      title: '操作对象',
      dataIndex: 'resourceId',
      key: 'resourceId',
      render: (id: string, record: AuditLog) => (
        <div style={{ fontSize: '14px', color: '#666' }}>
          {record.resourceType === 'project' ? '项目' : 
           record.resourceType === 'task' ? '任务' : 
           record.resourceType === 'user' ? '用户' : '系统'} {id}
        </div>
      ),
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      render: (ip: string) => <span style={{ fontSize: '14px', color: '#666' }}>{ip}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: AuditLog['status']) => (
        <Tag color={getStatusColor(status)}>
          {status === 'success' ? '成功' : 
           status === 'failed' ? '失败' : 
           status === 'warning' ? '警告' : '未知'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: AuditLog) => (
        <Space>
          <Button type="text" onClick={() => console.log('查看详情')}>
            详情
          </Button>
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
          审计日志
        </h2>
        <Space>
          <Input.Search
            placeholder="搜索操作人或操作对象"
            allowClear
            style={{ width: 200 }}
          />
          <Button icon={<FilterOutlined />}>筛选</Button>
          <Button icon={<RefreshOutlined />} onClick={() => window.location.reload()}>
            刷新
          </Button>
          <Button icon={<ExportOutlined />} type="primary">
            导出
          </Button>
        </Space>
      </div>

      {/* 操作日志表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={logs}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 操作详情面板 */}
      <Card style={{ marginTop: '24px', display: 'none' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
          操作详情
        </h3>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>操作类型</div>
          <div style={{ fontSize: '16px', fontWeight: '500' }}>创建项目</div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>操作人</div>
          <div style={{ fontSize: '16px', fontWeight: '500' }}>管理Agent</div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>操作对象</div>
          <div style={{ fontSize: '16px', fontWeight: '500' }}>项目 1</div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>IP地址</div>
          <div style={{ fontSize: '16px', fontWeight: '500' }}>192.168.1.100</div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>请求参数</div>
          <pre style={{ backgroundColor: '#f0f2f5', padding: '16px', borderRadius: '4px', margin: 0 }}>
            {JSON.stringify({ name: '项目A - 电商平台重构', description: '基于微服务架构的电商平台重构项目' }, null, 2)}
          </pre>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>响应信息</div>
          <pre style={{ backgroundColor: '#f0f2f5', padding: '16px', borderRadius: '4px', margin: 0 }}>
            {JSON.stringify({ id: '1', name: '项目A - 电商平台重构' }, null, 2)}
          </pre>
        </div>
      </Card>
    </div>
  );
};
