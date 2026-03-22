import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Card, Button, Space, Modal, message, Tag, Alert, Row, Col } from 'antd';
import { PlusOutlined, CopyOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import type { ApiKey, ApiKeyCreateResponse } from '../../types';
import { apiKeyApi } from '../../services/api';

export const AgentApiKeys: React.FC = () => {
  const { id: agentId } = useParams<{ id: string }>();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newKeyData, setNewKeyData] = useState<ApiKeyCreateResponse | null>(null);
  const [showFullKey, setShowFullKey] = useState<Record<string, boolean>>({});

  if (!agentId) {
    return (
      <div className="tw-p-4 container mx-auto">
        <Alert message="错误" description="未找到Agent ID，请从正确页面访问。" type="error" showIcon />
      </div>
    );
  }

  // Fetch API keys on mount
  useEffect(() => {
    const fetchApiKeys = async () => {
      setLoading(true);
      try {
        const response = await apiKeyApi.listApiKeys(agentId!);
        if (response.code === 0) {
          setApiKeys(response.data || []);
        } else {
          message.error(response.msg || '获取API密钥失败');
        }
      } catch (err: any) {
        message.error(err.message || '网络请求失败');
      } finally {
        setLoading(false);
      }
    };
    fetchApiKeys();
  }, [agentId]);

  const handleCreateKey = async (expiresInDays?: number) => {
    if (!agentId) return;
    setCreateLoading(true);
    try {
      const response = await apiKeyApi.createApiKey(agentId, expiresInDays);
      if (response.code === 0 && response.data) {
        setNewKeyData(response.data);
        fetchApiKeys();
      } else {
        message.error(response.msg || '创建API密钥失败');
      }
    } catch (err) {
      message.error('创建API密钥异常');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    Modal.confirm({
      title: '确认撤销API密钥',
      content: '撤销后此密钥将立即失效，无法恢复。确认继续吗？',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await apiKeyApi.revokeApiKey(id);
          if (response.code === 0) {
            message.success('API密钥已撤销');
            fetchApiKeys();
          } else {
            message.error(response.msg || '撤销失败');
          }
        } catch (err) {
          message.error('撤销异常');
        }
      },
    });
  };

  const handleCopyKey = (api_key: string) => {
    navigator.clipboard.writeText(api_key);
    message.success('已复制到剪贴板');
  };

  const toggleShowKey = (id: string) => {
    setShowFullKey(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getStatusText = (status: ApiKey['status']) => {
    const texts: Record<ApiKey['status'], { text: string; color: string }> = {
      active: { text: '激活', color: 'green' },
      expired: { text: '已过期', color: 'orange' },
      revoked: { text: '已撤销', color: 'red' },
    };
    return texts[status];
  };

  const fetchApiKeys = async () => {
    if (!agentId) return;
    setLoading(true);
    try {
      const response = await apiKeyApi.listApiKeys(agentId);
      if (response.code === 0) {
        setApiKeys(response.data || []);
      } else {
        message.error(response.msg || '获取API密钥失败');
      }
    } catch (err: any) {
      message.error(err.message || '网络请求失败');
    } finally {
      setLoading(false);
    }
  };

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
      render: (status: ApiKey['status']) => {
        const { text, color } = getStatusText(status);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at: string) => created_at,
    },
    {
      title: '过期时间',
      dataIndex: 'expires_at',
      key: 'expires_at',
      render: (expires_at: string | null) =>
        expires_at ? (
          <span>{dayjs(expires_at).format('YYYY-MM-DD HH:mm')}</span>
        ) : (
          <span className="text-gray-400">永不过期</span>
        ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ApiKey) => (
        <Space size="middle">
          {record.is_active && (
            <Button danger size="small" onClick={() => handleRevokeKey(record.id)}>
              撤销
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="container mx-auto tw-p-4 max-w-screen-2xl">
      {/* 页面标题 */}
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
        <h2 className="tw-text-2xl tw-font-bold">API密钥管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
          创建新密钥
        </Button>
      </div>

      <Alert
        message="API密钥安全说明"
        description="API密钥拥有对应Agent的访问权限，请妥善保管。不要在代码中明文存储，不要分享给他人。密钥支持创建多个，可随时撤销。"
        type="info"
        showIcon
        className="tw-mb-6"
      />

      <Card>
        <Table
          dataSource={apiKeys}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 创建新密钥模态框 */}
      <Modal
        title="创建新的API密钥"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        width={600}
      >
        <div className="tw-space-y-4">
          <p>选择密钥有效期：</p>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Button block onClick={() => handleCreateKey(30)} loading={createLoading}>
                30 天
              </Button>
            </Col>
            <Col span={8}>
              <Button block onClick={() => handleCreateKey(90)} loading={createLoading}>
                90 天
              </Button>
            </Col>
            <Col span={8}>
              <Button block onClick={() => handleCreateKey(365)} loading={createLoading}>
                1 年
              </Button>
            </Col>
          </Row>
          <Button block onClick={() => handleCreateKey()} loading={createLoading}>
            永不过期
          </Button>

          {/* 新创建的密钥显示 */}
          {newKeyData && (
            <div className="tw-mt-4">
              <Alert
                message="API密钥已创建"
                description="这是您唯一一次看到完整密钥，请立即复制并安全保存。关闭后无法再次查看。"
                type="warning"
                showIcon
                className="tw-mb-4"
              />
              <Card className="tw-mb-4">
                <div className="tw-flex tw-items-center tw-justify-between">
                  <code className="tw-bg-gray-100 tw-px-2 tw-py-1 tw-rounded">
                    {showFullKey[newKeyData.id] ? newKeyData.api_key : '•'.repeat(32)}
                  </code>
                  <Space>
                    <Button
                      icon={showFullKey[newKeyData.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      size="small"
                      onClick={() => toggleShowKey(newKeyData.id)}
                    />
                    <Button icon={<CopyOutlined />} size="small" onClick={() => handleCopyKey(newKeyData.api_key)}>
                      复制
                    </Button>
                  </Space>
                </div>
              </Card>
              <div className="tw-text-right">
                <Button type="primary" onClick={() => {
                  setNewKeyData(null);
                  setCreateModalVisible(false);
                }}>
                  我已复制，关闭
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AgentApiKeys;
