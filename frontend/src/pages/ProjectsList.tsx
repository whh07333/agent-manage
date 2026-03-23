import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Popconfirm, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getProjects, deleteProject } from '../services/projects';
import type { Project } from '../types/projects';

const { Title } = Typography;

const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const colorMap: Record<string, string> = {
          low: 'gray',
          medium: 'blue',
          high: 'red',
        };
        return <Tag color={colorMap[priority]}>{priority}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          active: { text: '活跃', color: 'green' },
          archived: { text: '已归档', color: 'gray' },
        };
        return <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>;
      },
    },
    {
      title: '负责人',
      dataIndex: 'managerName',
      key: 'managerName',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Project) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/projects/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/projects/${record.id}/edit`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个项目吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await getProjects({ page: 1, page_size: 100 });
      setProjects(response.data.list);
    } catch (error) {
      message.error('获取项目列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      message.success('删除成功');
      fetchProjects();
    } catch (error) {
      message.error('删除失败');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={4} style={{ margin: 0 }}>项目列表</Title>
            <Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/projects/create')}>
                新建项目
              </Button>
            </Space>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={projects}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default ProjectsList;
