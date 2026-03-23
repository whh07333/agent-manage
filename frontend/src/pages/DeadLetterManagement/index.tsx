import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Pagination,
  Tag,
  Modal,
  message,
  Tooltip,
  Badge,
  Popconfirm,
  Checkbox,
  Dropdown,
  Input,
  Select,
} from 'antd';
import {
  RetweetOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  SyncOutlined,
  DeleteOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DeadLetterEvent } from '../../types';
import { deadLetterApi } from '../../services/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { confirm } = Modal;
const { Search } = Input;

export const DeadLetterManagement: React.FC = () => {
  const [deadLetters, setDeadLetters] = useState<DeadLetterEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [retryCountFilter, setRetryCountFilter] = useState<string>('all');

  // 获取死信列表
  const fetchDeadLetters = useCallback(async () => {
    try {
      setLoading(true);
      const response = await deadLetterApi.getDeadLetterList({
        page: currentPage,
        pageSize: pageSize,
      });
      if (response.code === 0) {
        setDeadLetters(response.data.items);
        setTotal(response.data.total);
      } else {
        message.error(`获取死信列表失败: ${response.msg}`);
      }
    } catch (error) {
      console.error('获取死信列表失败:', error);
      message.error('获取死信列表失败');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchDeadLetters();
  }, [currentPage, pageSize, fetchDeadLetters]);

  // 处理单条重发
  const handleRetry = async (id: string) => {
    try {
      const response = await deadLetterApi.retryDeadLetter(id);
      if (response.code === 0) {
        message.success('死信事件已重新发送');
        fetchDeadLetters();
      } else {
        message.error(`重发失败: ${response.msg}`);
      }
    } catch (error) {
      console.error('重发失败:', error);
      message.error('重信事件重发失败');
    }
  };

  // 处理批量重发
  const handleBatchRetry = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要重发的死信事件');
      return;
    }

    confirm({
      title: '确认批量重发',
      icon: <ExclamationCircleOutlined />,
      content: `确定要重发选中的 ${selectedRowKeys.length} 条死信事件吗？`,
      onOk: async () => {
        try {
          const response = await deadLetterApi.retryAllDeadLetters();
          if (response.code === 0) {
            message.success(`已成功重试所有死信事件`);

            setSelectedRowKeys([]);
            fetchDeadLetters();
          } else {
            message.error(`批量重发失败: ${response.msg}`);
          }
        } catch (error) {
          console.error('批量重发失败:', error);
          message.error('批量重发失败');
        }
      },
    });
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      const response = await deadLetterApi.deleteDeadLetter(id);
      if (response.code === 0) {
        message.success('死信事件已删除');
        fetchDeadLetters();
      } else {
        message.error(`删除失败: ${response.msg}`);
      }
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的死信事件');
      return;
    }

    confirm({
      title: '确认批量删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除选中的 ${selectedRowKeys.length} 条死信事件吗？此操作不可恢复。`,
      onOk: async () => {
        try {
          // TODO: 实现批量删除API，目前先循环删除
          for (const id of selectedRowKeys) {
            await deadLetterApi.deleteDeadLetter(id.toString());
          }
          message.success(`已成功删除 ${selectedRowKeys.length} 条死信事件`);
          setSelectedRowKeys([]);
          fetchDeadLetters();
        } catch (error) {
          console.error('批量删除失败:', error);
          message.error('批量删除失败');
        }
      },
    });
  };

  // 表格列定义
  const columns: ColumnsType<DeadLetterEvent> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="tw-truncate tw-max-w-[100px]">{text.substring(0, 8)}...</span>
        </Tooltip>
      ),
    },
    {
      title: '订阅ID',
      dataIndex: 'subscriptionId',
      key: 'subscriptionId',
      width: 100,
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="tw-truncate tw-max-w-[100px]">{text.substring(0, 8)}...</span>
        </Tooltip>
      ),
    },
    {
      title: '事件类型',
      dataIndex: 'eventType',
      key: 'eventType',
      width: 120,
      render: (text: string) => (
        <Tag color="blue" className="tw-truncate">
          {text}
        </Tag>
      ),
    },
    {
      title: '重试次数',
      dataIndex: 'retryCount',
      key: 'retryCount',
      width: 100,
      render: (count: number) => (
        <Badge
          count={count}
          showZero
          style={{
            backgroundColor: count >= 5 ? '#f5222d' : count >= 3 ? '#faad14' : '#52c41a',
          }}
        />
      ),
    },
    {
      title: '最后错误',
      dataIndex: 'lastError',
      key: 'lastError',
      ellipsis: true,
      render: (error: string | null) => (
        <Tooltip title={error}>
          <span className="tw-text-red-600 tw-truncate tw-max-w-[200px]">
            {error || '无错误信息'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => (
        <div className="tw-flex tw-flex-col">
          <span>{dayjs(date).format('YYYY-MM-DD')}</span>
          <span className="tw-text-xs tw-text-gray-500">
            {dayjs(date).fromNow()}
          </span>
        </div>
      ),
    },
    {
      title: '过期时间',
      dataIndex: 'expireAt',
      key: 'expireAt',
      width: 150,
      render: (date: string) => {
        const daysLeft = dayjs(date).diff(dayjs(), 'day');
        let color = 'green';
        if (daysLeft <= 1) color = 'red';
        else if (daysLeft <= 3) color = 'orange';

        return (
          <Tag color={color}>
            {dayjs(date).format('MM-DD HH:mm')}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_: unknown, record: DeadLetterEvent) => (
        <Space size="small">
          <Tooltip title="重发">
            <Button
              type="text"
              size="small"
              icon={<RetweetOutlined />}
              onClick={() => handleRetry(record.id)}
              className="tw-text-blue-600 hover:tw-text-blue-800"
            />
          </Tooltip>
          <Popconfirm
            title="确认删除"
            description="确定要删除这条死信事件吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                className="hover:tw-text-red-800"
              />
            </Tooltip>
          </Popconfirm>
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<ExclamationCircleOutlined />}
              onClick={() => {
                Modal.info({
                  title: '死信事件详情',
                  width: 800,
                  content: (
                    <div className="tw-space-y-4">
                      <div>
                        <h4 className="tw-font-bold">基本信息</h4>
                        <pre className="tw-bg-gray-100 tw-p-4 tw-rounded tw-overflow-auto">
                          {JSON.stringify(record, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <h4 className="tw-font-bold">事件载荷</h4>
                        <pre className="tw-bg-gray-100 tw-p-4 tw-rounded tw-overflow-auto">
                          {JSON.stringify(record.eventPayload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ),
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 手机端卡片渲染
  const renderMobileCard = (item: DeadLetterEvent) => (
    <Card
      key={item.id}
      className="tw-mb-4"
      size="small"
      title={
        <div className="tw-flex tw-justify-between tw-items-center">
          <span className="tw-font-medium">{item.eventType}</span>
          <Tag color="blue">{item.retryCount}次重试</Tag>
        </div>
      }
      extra={
        <Dropdown
          menu={{
            items: [
              {
                key: 'retry',
                label: '重发',
                icon: <RetweetOutlined />,
                onClick: () => handleRetry(item.id),
              },
              {
                key: 'detail',
                label: '详情',
                icon: <ExclamationCircleOutlined />,
                onClick: () => {
                  Modal.info({
                    title: '死信事件详情',
                    content: (
                      <div className="tw-space-y-2">
                        <p>
                          <strong>ID:</strong> {item.id}
                        </p>
                        <p>
                          <strong>订阅ID:</strong> {item.subscriptionId}
                        </p>
                        <p>
                          <strong>最后错误:</strong> {item.lastError || '无'}
                        </p>
                        <p>
                          <strong>创建时间:</strong>{' '}
                          {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                        </p>
                      </div>
                    ),
                  });
                },
              },
              {
                key: 'delete',
                label: '删除',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleDelete(item.id),
              },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      }
    >
      <div className="tw-space-y-2">
        <div className="tw-flex tw-justify-between">
          <span className="tw-text-gray-600">订阅ID:</span>
          <span className="tw-font-mono">{item.subscriptionId.substring(0, 8)}...</span>
        </div>
        <div className="tw-flex tw-justify-between">
          <span className="tw-text-gray-600">最后错误:</span>
          <span className="tw-text-red-600 tw-truncate tw-max-w-[150px]">
            {item.lastError || '无'}
          </span>
        </div>
        <div className="tw-flex tw-justify-between">
          <span className="tw-text-gray-600">创建时间:</span>
          <span>{dayjs(item.createdAt).fromNow()}</span>
        </div>
        <div className="tw-flex tw-justify-between">
          <span className="tw-text-gray-600">过期时间:</span>
          <span>{dayjs(item.expireAt).format('MM-DD HH:mm')}</span>
        </div>
      </div>
    </Card>
  );

  // 筛选事件类型选项
  const eventTypes = Array.from(new Set(deadLetters.map((item) => item.eventType)));

  return (
    <div className="tw-p-4">
      <div className="tw-mb-6">
        <h2 className="tw-text-xl sm:tw-text-2xl tw-font-bold tw-mb-4">
          死信队列管理
        </h2>
        <p className="tw-text-gray-600">
          处理失败的事件消息，支持重发和删除操作。
        </p>
      </div>

      {/* 工具栏 */}
      <Card className="tw-mb-6">
        <div className="tw-flex tw-flex-col lg:tw-flex-row lg:tw-justify-between lg:tw-items-center tw-gap-4">
          <div className="tw-flex-1 tw-flex tw-flex-col sm:tw-flex-row sm:tw-items-center tw-gap-4">
            <Search
              placeholder="搜索订阅ID、事件类型或错误信息"
              allowClear
              enterButton={<SearchOutlined />}
              className="tw-w-full sm:tw-w-64"
            />
            <Select
              placeholder="事件类型"
              allowClear
              value={eventTypeFilter === 'all' ? undefined : eventTypeFilter}
              onChange={(value: string | undefined) => setEventTypeFilter(value || 'all')}
              className="tw-w-full sm:tw-w-40"
              options={[
                { value: 'all', label: '全部类型' },
                ...eventTypes.map((type) => ({ value: type, label: type })),
              ]}
            />
            <Select
              placeholder="重试次数"
              allowClear
              value={retryCountFilter === 'all' ? undefined : retryCountFilter}
              onChange={(value: string | undefined) => setRetryCountFilter(value || 'all')}
              className="tw-w-full sm:tw-w-40"
              options={[
                { value: 'all', label: '全部' },
                { value: '0', label: '未重试' },
                { value: '1-3', label: '1-3次' },
                { value: '4-5', label: '4-5次' },
                { value: '5+', label: '5次以上' },
              ]}
            />
            <Button icon={<FilterOutlined />} className="tw-w-full sm:tw-w-auto">
              更多筛选
            </Button>
          </div>
          <div className="tw-flex tw-flex-wrap tw-gap-2">
            <Button
              icon={<SyncOutlined />}
              onClick={fetchDeadLetters}
              loading={loading}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<RetweetOutlined />}
              onClick={handleBatchRetry}
              disabled={selectedRowKeys.length === 0}
            >
              批量重发 ({selectedRowKeys.length})
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
              disabled={selectedRowKeys.length === 0}
            >
              批量删除 ({selectedRowKeys.length})
            </Button>
          </div>
        </div>
      </Card>

      {/* 选择统计 */}
      {selectedRowKeys.length > 0 && (
        <div className="tw-mb-4 tw-p-3 tw-bg-blue-50 tw-rounded tw-border tw-border-blue-200">
          <div className="tw-flex tw-items-center tw-justify-between">
            <span className="tw-text-blue-700">
              已选择 {selectedRowKeys.length} 条死信事件
            </span>
            <Button type="link" onClick={() => setSelectedRowKeys([])}>
              取消选择
            </Button>
          </div>
        </div>
      )}

      {/* 桌面端表格 / 手机端卡片 */}
      <div className="tw-hidden lg:tw-block">
        <Table<DeadLetterEvent>
          columns={columns}
          dataSource={deadLetters}
          rowKey="id"
          loading={loading}
          pagination={false}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          scroll={{ x: 1200 }}
        />
      </div>
      <div className="tw-block lg:tw-hidden">
        <Checkbox.Group
          value={selectedRowKeys}
          onChange={(values: React.Key[]) => setSelectedRowKeys(values)}
          className="tw-w-full"
        >
          {deadLetters.map(renderMobileCard)}
        </Checkbox.Group>
      </div>

      {/* 分页 */}
      <div className="tw-mt-6 tw-flex tw-justify-center">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={(page: number, size: number) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
          showSizeChanger
          showQuickJumper
          showTotal={(total: number) => `共 ${total} 条记录`}
          pageSizeOptions={['10', '20', '50', '100']}
        />
      </div>
    </div>
  );
};