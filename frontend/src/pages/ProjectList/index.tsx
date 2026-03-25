import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, List, Button, Input, Space, Pagination, Tag, Progress, Modal, Form, Input as AntInput, DatePicker, message } from 'antd';
import { FilterOutlined, PlusOutlined } from '@ant-design/icons';
import { projectApi } from '../../services/api';
import type { Project } from '../../types';
import dayjs from 'dayjs';


export const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await projectApi.getProjects();
      console.log("fetchData API响应:", response);
      console.log("response.code:", response?.code);
      console.log("response.data:", response?.data);

      if (response.code === 0) {
        setProjects(response.data);
      } else {
        console.error('获取项目列表失败:', response.msg);
        // 使用模拟数据
        setProjects([]);
      }
    } catch (error) {
      console.error('获取项目列表失败:', error);
      // 使用模拟数据
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 搜索项目
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchText.toLowerCase()) ||
    project.description.toLowerCase().includes(searchText.toLowerCase())
  );

  // 分页
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

  // 获取进度条颜色
  const getProgressColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return '#1890ff';
      case 'overdue':
        return '#f5222d';
      case 'completed':
        return '#52c41a';
      case 'archived':
        return '#d9d9d9';
      default:
        return '#1890ff';
    }
  };

  // 获取状态标签颜色
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'blue';
      case 'overdue':
        return 'red';
      case 'completed':
        return 'green';
      case 'archived':
        return 'gray';
      default:
        return 'blue';
    }
  };

  // 打开创建项目模态框
  const handleOpenCreateModal = () => {
    setCreateModalVisible(true);
    form.resetFields();
    // 设置默认负责人ID
    form.setFieldsValue({
      managerId: '00000000-0000-0000-0000-000000000001'
    });
  };

  // 关闭创建项目模态框
  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
    form.resetFields();
  };

  // 打开编辑项目模态框
  const handleOpenEditModal = (project: Project) => {
    console.log('编辑按钮点击，项目ID:', project.id, '项目名称:', project.name);
    setEditingProject(project);
    setEditModalVisible(true);
    // 预填表单数据，注意日期格式转换
    form.setFieldsValue({
      name: project.name,
      description: project.description,
      managerId: project.managerId,
      startDate: dayjs(project.startDate),
      endDate: dayjs(project.endDate),
      priority: project.priority,
    });
  };

  // 关闭编辑项目模态框
  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setEditingProject(null);
    form.resetFields();
  };

  // 提交创建项目
  const handleCreateProject = async () => {
    try {
      const values = await form.validateFields();
      
      // 格式转换
      const projectData = {
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        // 优先级转换：P0->low, P1->medium, P2->high, P3->low（默认）
        priority: values.priority === 'P0' ? 'low' :
                 values.priority === 'P1' ? 'medium' :
                 values.priority === 'P2' ? 'high' : 'low',
      };

      // 验证开始日期必须早于结束日期（前端也做一次校验）
      const start = new Date(projectData.startDate);
      const end = new Date(projectData.endDate);
      if (start.getTime() > end.getTime()) {
        message.error('开始日期必须早于结束日期');
        return;
      }

      // 这里调用API创建项目
      const createdProject = await projectApi.createProject(projectData);
      if (createdProject) {
        message.success('项目创建成功');
        handleCloseCreateModal();
        // 重新获取项目列表
        fetchData();
      } else {
        message.error('创建项目失败');
      }
    } catch (error) {
      console.error('创建项目失败:', error);
      message.error('创建项目失败，请检查表单');
    }
  };

  // 提交编辑项目
  const handleUpdateProject = async () => {
    if (!editingProject) return;

    try {
      const values = await form.validateFields();

      // 格式转换
      const projectData = {
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        // 优先级转换：P0->low, P1->medium, P2->high, P3->low（默认）
        priority: values.priority === 'P0' ? 'low' :
                 values.priority === 'P1' ? 'medium' :
                 values.priority === 'P2' ? 'high' : 'low',
      };

      // 验证开始日期必须早于结束日期（前端也做一次校验）
      const start = new Date(projectData.startDate);
      const end = new Date(projectData.endDate);
      if (start.getTime() > end.getTime()) {
        message.error('开始日期必须早于结束日期');
        return;
      }

      // 调用API更新项目
      const updatedProject = await projectApi.updateProject(editingProject.id, projectData);
      if (updatedProject) {
        message.success('项目更新成功');
        handleCloseEditModal();
        // 重新获取项目列表
        fetchData();
      } else {
        message.error('更新项目失败');
      }
    } catch (error) {
      console.error('更新项目失败:', error);
      message.error('更新项目失败，请检查表单');
    }
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          项目管理
        </h2>
        <Space>
          <Input.Search
            placeholder="搜索项目"
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Button icon={<FilterOutlined />}>筛选</Button>
          <Button 
            icon={<PlusOutlined />} 
            type="primary"
            onClick={handleOpenCreateModal}
          >
            创建项目
          </Button>
        </Space>
      </div>

      {/* 项目列表 */}
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 2,
          lg: 2,
          xl: 3,
          xxl: 3,
        }}
        dataSource={paginatedProjects}
        loading={loading}
        renderItem={(project) => (
          <List.Item>
            <Card
              hoverable
              style={{ height: '100%' }}
              actions={[
                <Button type="text" onClick={() => navigate(`/projects/${project.id}`)}>
                  详情
                </Button>,
                <Button type="text" onClick={() => handleOpenEditModal(project)}>
                  编辑
                </Button>,
                <Button type="text" onClick={() => console.log('归档')}>
                  归档
                </Button>,
                <Button type="text" danger onClick={() => console.log('删除')}>
                  删除
                </Button>,
              ]}
            >
              <Card.Meta
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{project.name}</span>
                    <Tag color={getStatusColor(project.status)}>
                      {project.status === 'active' ? '进行中' : 
                       project.status === 'overdue' ? '逾期' : 
                       project.status === 'completed' ? '已完成' : '已归档'}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <p>{project.description}</p>
                    <div style={{ margin: '16px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#666' }}>负责人</span>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{project.managerId}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#666' }}>优先级</span>
                        <Tag color={project.priority === 'P0' ? 'red' : 
                                     project.priority === 'P1' ? 'orange' : 
                                     project.priority === 'P2' ? 'blue' : 'green'}>
                          {project.priority}
                        </Tag>
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <Progress
                          percent={project.progress}
                          strokeColor={getProgressColor(project.status)}
                          size="small"
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                            {project.tasks?.unassigned ?? 0}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>待分配</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                            {project.tasks?.inProgress ?? 0}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>进行中</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                            {project.tasks?.completed ?? 0}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666' }}>已完成</div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              />
            </Card>
          </List.Item>
        )}
      />

      {/* 分页 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: '24px'
      }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredProjects.length}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
          showSizeChanger
          showTotal={(total) => `共 ${total} 个项目`}
        />
      </div>

      {/* 创建项目模态框 */}
      <Modal
        title="创建新项目"
        open={createModalVisible}
        onCancel={handleCloseCreateModal}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateProject}
          initialValues={{
            priority: 'P1',
          }}
        >
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <AntInput placeholder="请输入项目名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="项目描述"
            rules={[{ required: true, message: '请输入项目描述' }]}
          >
            <AntInput.TextArea 
              rows={4} 
              placeholder="请输入项目描述"
            />
          </Form.Item>

          <Form.Item
            name="managerId"
            label="项目负责人"
            rules={[{ required: true, message: '请输入项目负责人' }]}
          >
            <AntInput placeholder="请输入项目负责人" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="startDate"
              label="开始日期"
              rules={[{ required: true, message: '请选择开始日期' }]}
              style={{ flex: 1 }}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="选择开始日期"
              />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="结束日期"
              rules={[{ required: true, message: '请选择结束日期' }]}
              style={{ flex: 1 }}
            >
              <DatePicker 
                style={{ width: '100%' }} 
                placeholder="选择结束日期"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Input.Group compact>
              <Button
                type={form.getFieldValue('priority') === 'P0' ? 'primary' : 'default'}
                danger
                onClick={() => form.setFieldValue('priority', 'P0')}
              >
                P0 - 最高
              </Button>
              <Button
                type={form.getFieldValue('priority') === 'P1' ? 'primary' : 'default'}
                onClick={() => form.setFieldValue('priority', 'P1')}
              >
                P1 - 高
              </Button>
              <Button
                type={form.getFieldValue('priority') === 'P2' ? 'primary' : 'default'}
                onClick={() => form.setFieldValue('priority', 'P2')}
              >
                P2 - 中
              </Button>
              <Button
                type={form.getFieldValue('priority') === 'P3' ? 'primary' : 'default'}
                onClick={() => form.setFieldValue('priority', 'P3')}
              >
                P3 - 低
              </Button>
            </Input.Group>
          </Form.Item>

          <Form.Item>
            <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
              <Button onClick={handleCloseCreateModal}>取消</Button>
              <Button type="primary" htmlType="submit">创建项目</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑项目模态框 */}
      <Modal
        title="编辑项目"
        open={editModalVisible}
        onCancel={handleCloseEditModal}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProject}
        >
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <AntInput placeholder="请输入项目名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="项目描述"
            rules={[{ required: true, message: '请输入项目描述' }]}
          >
            <AntInput.TextArea
              rows={4}
              placeholder="请输入项目描述"
            />
          </Form.Item>

          <Form.Item
            name="managerId"
            label="项目负责人"
            rules={[{ required: true, message: '请输入项目负责人' }]}
          >
            <AntInput placeholder="请输入项目负责人" />
          </Form.Item>

          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="startDate"
              label="开始日期"
              rules={[{ required: true, message: '请选择开始日期' }]}
              style={{ flex: 1 }}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="选择开始日期"
              />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="结束日期"
              rules={[{ required: true, message: '请选择结束日期' }]}
              style={{ flex: 1 }}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="选择结束日期"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Input.Group compact>
              <Button
                type={form.getFieldValue('priority') === 'P0' ? 'primary' : 'default'}
                danger
                onClick={() => form.setFieldValue('priority', 'P0')}
              >
                P0 - 最高
              </Button>
              <Button
                type={form.getFieldValue('priority') === 'P1' ? 'primary' : 'default'}
                onClick={() => form.setFieldValue('priority', 'P1')}
              >
                P1 - 高
              </Button>
              <Button
                type={form.getFieldValue('priority') === 'P2' ? 'primary' : 'default'}
                onClick={() => form.setFieldValue('priority', 'P2')}
              >
                P2 - 中
              </Button>
              <Button
                type={form.getFieldValue('priority') === 'P3' ? 'primary' : 'default'}
                onClick={() => form.setFieldValue('priority', 'P3')}
              >
                P3 - 低
              </Button>
            </Input.Group>
          </Form.Item>

          <Form.Item>
            <Space style={{ justifyContent: 'flex-end', width: '100%' }}>
              <Button onClick={handleCloseEditModal}>取消</Button>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
