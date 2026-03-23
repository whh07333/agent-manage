import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Card, Button, Space, Modal, message, Tag, Alert, Row, Col, Form, Input } from 'antd';
import { PlusOutlined, CopyOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import type { ApiKey, ApiKeyCreateResponse, ApiKeyRotateResponse } from '../../types';
import { apiKeyApi } from '../../services/api';

export const AgentApiKeys: React.FC = () => {
  const { id: agentId } = useParams<{ id: string }>();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newKeyData, setNewKeyData] = useState<ApiKeyCreateResponse | ApiKeyRotateResponse | null>(null);
  const [showFullKey, setShowFullKey] = useState<Record<string, boolean>>({});
  const [form] = Form.useForm();

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const response = await apiKeyApi.getApiKeys(agentId!);
      if (response.code === 0) {
        setApiKeys(response.data || []);
      } else {
        message.error(response.msg || '获取API密钥失败');
      }
    } catch (error) {
      console.error('获取API密钥列表失败:', error);
      message.error('获取API密钥失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: { name: string; expiresAt: string | null }) => {
    try {
      const response = await apiKeyApi.createApiKey({
        agentId: agentId!,
        name: values.name,
        expiresAt: values.expiresAt || null,
      });
      if (response.code === 0) {
        setNewKeyData(response.data);
        message.success('API密钥创建成功');
        fetchApiKeys();
        form.resetFields();
      } else {
        message.error(response.msg || '创建API密钥失败');
      }
    } catch (error) {
      console.error('创建API密钥失败:', error);
      message.error('创建API密钥失败');
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const response = await apiKeyApi.revokeApiKey(id);
      if (response.code === 0) {
        message.success('API密钥已撤销');
        fetchApiKeys();
      } else {
        message.error(response.msg || '撤销API密钥失败');
      }
    } catch (error) {
      console.error('撤销API密钥失败:', error);
      message.error('撤销API密钥失败');
    }
  };

  const handleRotate = async (id: string) => {
    try {
      const response = await apiKeyApi.rotateApiKey(id);
      if (response.code === 0) {
        setNewKeyData(response.data);
        message.success('API密钥旋转成功');
        fetchApiKeys();
      } else {
        message.error(response.msg || '旋转API密钥失败');
      }
    } catch (error) {
      console.error('旋转API密钥失败:', error);
      message.error('旋转API密钥失败');
    }
  };

  const toggleShowKey = (id: string) => {
    setShowFullKey(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    message.success('已复制到剪贴板');
  };

  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
    setNewKeyData(null);
    form.resetFields();
  };

  useEffect(() => {
    if (agentId) {
      fetchApiKeys();
    }
  }, [agentId]);

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          active: 'green',
          expired: 'gray',
          revoked: 'red',
        };
        const labelMap: Record<string, string> = {
          active: '活跃',
          expired: '已过期',
          revoked: '已撤销',
        };
        return <Tag color={colorMap[status]}>{labelMap[status]}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: '过期时间',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date: string | null) => date ? new Date(date).toLocaleString() : '永不过期',
    },
    {
      title: '最后使用',
      dataIndex: 'lastUsedAt',
      key: 'lastUsedAt',
      render: (date: string | null) => date ? new Date(date).toLocaleString() : '从未使用',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: ApiKey) => (
        <Space size="middle">
          <Button
            size="small"
            icon={showFullKey[record.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => toggleShowKey(record.id)}
          >
            {showFullKey[record.id] ? '隐藏' : '查看'}
          </Button>
          <Button
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopyKey(showFullKey[record.id] ? record.maskedKey : record.maskedKey)}
          >
            复制
          </Button>
          {record.status === 'active' && (
            <>
              <Button size="small" danger onClick={() => handleRevoke(record.id)}>
                撤销
              </Button>
              <Button size="small" type="primary" onClick={() => handleRotate(record.id)}>
                旋转
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>API密钥管理</span>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
              创建密钥
            </Button>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={apiKeys}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="创建新API密钥"
        open={createModalVisible}
        onCancel={handleCloseCreateModal}
        footer={null}
        width={500}
        destroyOnClose
      >
        {newKeyData && (
          <Alert
            message="API密钥创建成功"
            description="请立即复制并保存您的API密钥。它不会再次完整显示。"
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        {newKeyData && (
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <strong>完整API密钥：</strong>
              <div
                style={{
                  padding: '8px 12px',
                  background: '#f5f5f5',
                  borderRadius: 4,
                  marginTop: 8,
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                }}
              >
                {'apiKey' in newKeyData ? newKeyData.apiKey : ''}
              </div>
            </Col>
            <Col span={24}>
              <Button
                type="primary"
                icon={<CopyOutlined />}
                onClick={() => {
                  if ('apiKey' in newKeyData) {
                    handleCopyKey(newKeyData.apiKey);
                  }
                }}
                style={{ marginTop: 8 }}
              >
                复制完整API密钥
              </Button>
            </Col>
          </Row>
        )}
        {!newKeyData && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreate}
          >
            <Form.Item
              name="name"
              label="密钥名称"
              rules={[{ required: true, message: '请输入密钥名称' }]}
            >
              <Input placeholder="例如：生产环境使用" />
            </Form.Item>
            <Form.Item
              name="expiresAt"
              label="过期时间"
              help="留空表示永不过期"
            >
              <Input type="date" />
            </Form.Item>
            <Form.Item>
              <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
                <Button onClick={handleCloseCreateModal}>取消</Button>
                <Button type="primary" htmlType="submit">创建</Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};
