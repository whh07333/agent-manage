import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Space,
  Card,
  Typography,
  message,
  Input as AntdInput,
  Alert
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { projectApi } from '../../services/api';
import type { Project } from '../../types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = AntdInput;
const { Option } = Select;

// 模拟Agent列表（实际应从API获取）
const mockAgents = [
  { id: '1', name: '产品Agent' },
  { id: '2', name: '开发Agent' },
  { id: '3', name: '前端Agent' },
  { id: '4', name: '测试Agent' },
  { id: '5', name: '部署Agent' },
];

export const ProjectConfig: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [initialValues, setInitialValues] = useState<Record<string, any> | null>(null);

  // 加载项目数据
  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await projectApi.getProject(id);
        if (response.code === 0 && response.data) {
          const projectData = response.data;
          setProject(projectData);

          // 设置表单初始值
          const values = {
            name: projectData.name,
            description: projectData.description,
            startDate: projectData.startDate ? dayjs(projectData.startDate) : null,
            endDate: projectData.endDate ? dayjs(projectData.endDate) : null,
            priority: projectData.priority,
            // 关联Agent（模拟数据）
            agents: ['1', '2'],
            // 自定义字段（模拟数据）
            customFields: JSON.stringify({ category: 'development', tags: ['web', 'mobile'] }, null, 2),
          };
          setInitialValues(values);
          form.setFieldsValue(values);
        } else {
          message.error(`加载项目配置失败: ${response.msg}`);
          navigate(`/projects/${id}`);
        }
      } catch (error) {
        console.error('加载项目配置失败:', error);
        message.error('加载项目配置失败，请稍后重试');
        navigate(`/projects/${id}`);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id, form, navigate]);

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    if (!id || !project) return;

    // 验证结束日期晚于开始日期
    if (values.startDate && values.endDate && values.endDate.isBefore(values.startDate)) {
      message.error('结束日期必须晚于开始日期');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name: values.name,
        description: values.description || '',
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : project.startDate,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : project.endDate,
        priority: values.priority,
        // 注意：实际API可能需要不同的字段格式
      };

      const response = await projectApi.updateProject(id, updateData);
      if (response.code === 0) {
        message.success('项目配置已保存');
        navigate(`/projects/${id}`);
      } else {
        message.error(`保存失败: ${response.msg}`);
      }
    } catch (error: any) {
      console.error('保存项目配置失败:', error);
      if (error.response?.status === 409) {
        message.warning('配置已被他人修改，请刷新后再编辑');
      } else {
        message.error('保存项目配置失败，请稍后重试');
      }
    } finally {
      setSaving(false);
    }
  };

  // 重置表单
  const handleReset = () => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  };

  // 如果项目已归档，禁用表单
  const isArchived = project?.status === 'archived';

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        加载项目配置中...
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/projects/${id}`)}>
          返回项目详情
        </Button>
      </div>

      <Card>
        <Title level={3} style={{ marginBottom: '24px' }}>
          修改项目配置
        </Title>

        {isArchived && (
          <Alert
            message="项目已归档"
            description="归档项目的配置不可编辑，如需修改请先取消归档。"
            type="warning"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={isArchived}
        >
          <Form.Item
            label="项目名称"
            name="name"
            rules={[
              { required: true, message: '请输入项目名称' },
              { max: 100, message: '项目名称不能超过100个字符' },
            ]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>

          <Form.Item
            label="项目描述"
            name="description"
            rules={[{ max: 1000, message: '项目描述不能超过1000个字符' }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入项目描述"
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              label="目标开始日期"
              name="startDate"
              rules={[{ required: true, message: '请选择开始日期' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="选择开始日期"
                disabled={isArchived}
              />
            </Form.Item>

            <Form.Item
              label="目标结束日期"
              name="endDate"
              rules={[{ required: true, message: '请选择结束日期' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                placeholder="选择结束日期"
                disabled={isArchived}
              />
            </Form.Item>
          </div>

          <Form.Item
            label="优先级"
            name="priority"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select placeholder="选择优先级" disabled={isArchived}>
              <Option value="P0">P0 - 最高优先级</Option>
              <Option value="P1">P1 - 高优先级</Option>
              <Option value="P2">P2 - 中优先级</Option>
              <Option value="P3">P3 - 低优先级</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="关联Agent"
            name="agents"
          >
            <Select
              mode="multiple"
              placeholder="选择关联的Agent"
              disabled={isArchived}
            >
              {mockAgents.map(agent => (
                <Option key={agent.id} value={agent.id}>
                  {agent.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="自定义字段 (JSON格式)"
            name="customFields"
            extra="请输入JSON格式的自定义配置"
          >
            <TextArea
              rows={6}
              placeholder='{"key": "value"}'
              disabled={isArchived}
            />
          </Form.Item>

          <Form.Item>
            <Space size="large">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
                size="large"
                style={{ minWidth: '120px', minHeight: '48px' }}
              >
                保存配置
              </Button>
              <Button
                htmlType="button"
                onClick={handleReset}
                icon={<CloseOutlined />}
                size="large"
                style={{ minWidth: '120px', minHeight: '48px' }}
                disabled={isArchived}
              >
                重置
              </Button>
              <Button
                htmlType="button"
                onClick={() => navigate(`/projects/${id}`)}
                size="large"
                style={{ minWidth: '120px', minHeight: '48px' }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
          <Title level={5}>安全提示</Title>
          <ul style={{ color: '#666', lineHeight: '1.6' }}>
            <li>仅项目负责人或系统管理员可编辑项目配置</li>
            <li>前端禁用仅为UX体验，后端会进行严格的权限校验</li>
            <li>归档项目自动禁用表单编辑功能</li>
            <li>所有操作均记录审计日志</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};