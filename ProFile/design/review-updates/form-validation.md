# OpenClaw AI项目管理系统 - 表单验证设计补充说明

## 表单验证分类

### 1. 必填项验证
**场景**: 字段为必填项时
**设计**: 红色边框，错误提示显示必填信息
**交互**: 提交表单时验证，实时提示

### 2. 格式验证
**场景**: 字段需要特定格式时
**设计**: 红色边框，错误提示显示格式要求
**交互**: 输入时验证，实时提示

### 3. 长度验证
**场景**: 字段有长度限制时
**设计**: 红色边框，错误提示显示长度要求
**交互**: 输入时验证，实时提示

### 4. 数值范围验证
**场景**: 字段有数值范围限制时
**设计**: 红色边框，错误提示显示范围要求
**交互**: 输入时验证，实时提示

### 5. 自定义验证
**场景**: 需要特定业务逻辑验证时
**设计**: 红色边框，错误提示显示业务要求
**交互**: 输入时验证，实时提示

## 各页面表单验证设计

### 1. 项目管理表单验证
**项目创建**:
- **项目名称**: 必填，长度1-100字符
- **项目描述**: 必填，长度1-500字符
- **项目负责人**: 必填
- **项目周期**: 必填，格式YYYY-MM-DD至YYYY-MM-DD
- **项目类型**: 必填

**项目更新**:
- 同项目创建

### 2. 任务管理表单验证
**任务创建**:
- **任务名称**: 必填，长度1-100字符
- **任务描述**: 必填，长度1-500字符
- **任务负责人**: 必填
- **任务周期**: 必填，格式YYYY-MM-DD至YYYY-MM-DD
- **任务类型**: 必填
- **任务优先级**: 必填

**任务更新**:
- 同任务创建

### 3. 任务详情表单验证
**任务信息**:
- **任务状态**: 必填
- **任务描述**: 必填，长度1-500字符
- **任务负责人**: 必填
- **任务周期**: 必填，格式YYYY-MM-DD至YYYY-MM-DD

**任务评论**:
- **评论内容**: 必填，长度1-500字符

**交付物上传**:
- **文件**: 必填，格式PDF/图片/文档

### 4. 统计分析表单验证
**时间范围**:
- **开始时间**: 必填，格式YYYY-MM-DD
- **结束时间**: 必填，格式YYYY-MM-DD
- **结束时间>:开始时间**

**导出格式**:
- **格式**: 必填，PDF/Excel/CSV

### 5. 审计日志表单验证
**时间范围**:
- **开始时间**: 必填，格式YYYY-MM-DD HH:mm:ss
- **结束时间**: 必填，格式YYYY-MM-DD HH:mm:ss
- **结束时间>:开始时间**

**操作类型**:
- **类型**: 必填

**操作人**:
- **用户**: 必填

## 表单验证设计规范

### 1. 错误状态设计
- **边框**: 红色边框 (#ef4444)
- **文字**: 红色文字 (#ef4444)
- **位置**: 字段下方，左对齐
- **图标**: 错误图标 (🚫)

### 2. 成功状态设计
- **边框**: 绿色边框 (#10b981)
- **文字**: 绿色文字 (#10b981)
- **位置**: 字段下方，左对齐
- **图标**: 成功图标 (✅)

### 3. 警告状态设计
- **边框**: 黄色边框 (#f59e0b)
- **文字**: 黄色文字 (#f59e0b)
- **位置**: 字段下方，左对齐
- **图标**: 警告图标 (⚠️)

### 4. 提示状态设计
- **文字**: 灰色文字 (#64748b)
- **位置**: 字段下方，左对齐
- **图标**: 提示图标 (ℹ️)

## 表单验证实现建议

### 1. 使用Ant Design表单验证
```javascript
import { Form, Input, Select, DatePicker, Button } from 'antd';
import { Rule } from 'antd/es/form';

// 项目创建表单
const ProjectCreateForm = () => {
  const [form] = Form.useForm();

  const rules: Record<string, Rule[]> = {
    name: [
      { required: true, message: '请输入项目名称' },
      { max: 100, message: '项目名称长度不能超过100字符' }
    ],
    description: [
      { required: true, message: '请输入项目描述' },
      { max: 500, message: '项目描述长度不能超过500字符' }
    ],
    manager: [
      { required: true, message: '请选择项目负责人' }
    ],
    period: [
      { required: true, message: '请选择项目周期' }
    ],
    type: [
      { required: true, message: '请选择项目类型' }
    ]
  };

  const handleSubmit = (values) => {
    console.log('项目创建:', values);
  };

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Form.Item
        name="name"
        label="项目名称"
        rules={rules.name}
        validateStatus="error"
        help="项目名称必填"
      >
        <Input placeholder="请输入项目名称" />
      </Form.Item>

      <Form.Item
        name="description"
        label="项目描述"
        rules={rules.description}
      >
        <Input.TextArea placeholder="请输入项目描述" rows={3} />
      </Form.Item>

      <Form.Item
        name="manager"
        label="项目负责人"
        rules={rules.manager}
      >
        <Select placeholder="请选择项目负责人">
          {/* 选项 */}
        </Select>
      </Form.Item>

      <Form.Item
        name="period"
        label="项目周期"
        rules={rules.period}
      >
        <DatePicker.RangePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="type"
        label="项目类型"
        rules={rules.type}
      >
        <Select placeholder="请选择项目类型">
          {/* 选项 */}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          创建项目
        </Button>
      </Form.Item>
    </Form>
  );
};
```

### 2. 自定义验证规则
```javascript
// 任务状态验证
const validateTaskStatus = (rule, value) => {
  const validStatuses = ['pending', 'inProgress', 'completed', 'blocked'];
  if (!validStatuses.includes(value)) {
    return Promise.reject('任务状态无效');
  }
  return Promise.resolve();
};

// 任务周期验证
const validateTaskPeriod = (rule, value) => {
  if (value && value[1] <= value[0]) {
    return Promise.reject('结束时间必须大于开始时间');
  }
  return Promise.resolve();
};

// 使用自定义验证规则
const rules = {
  status: [
    { required: true, message: '请选择任务状态' },
    { validator: validateTaskStatus }
  ],
  period: [
    { required: true, message: '请选择任务周期' },
    { validator: validateTaskPeriod }
  ]
};
```

### 3. 实时验证
```javascript
import { useEffect } from 'react';

const TaskForm = () => {
  const [form] = Form.useForm();

  // 实时验证任务状态
  useEffect(() => {
    const statusField = form.getFieldValue('status');
    if (statusField) {
      form.validateFields(['status']);
    }
  }, [form]);

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      {/* 表单字段 */}
    </Form>
  );
};
```

## 表单验证测试场景

### 1. 必填项验证测试
- **测试场景**: 提交时未填必填项
- **验证方法**: 观察错误提示和边框颜色
- **预期结果**: 红色边框，错误提示显示必填信息

### 2. 格式验证测试
- **测试场景**: 输入无效格式
- **验证方法**: 观察错误提示和边框颜色
- **预期结果**: 红色边框，错误提示显示格式要求

### 3. 长度验证测试
- **测试场景**: 输入超过长度限制
- **验证方法**: 观察错误提示和边框颜色
- **预期结果**: 红色边框，错误提示显示长度要求

### 4. 数值范围验证测试
- **测试场景**: 输入不在范围值
- **验证方法**: 观察错误提示和边框颜色
- **预期结果**: 红色边框，错误提示显示范围要求

### 5. 自定义验证测试
- **测试场景**: 输入不符合业务逻辑的值
- **验证方法**: 观察错误提示和边框颜色
- **预期结果**: 红色边框，错误提示显示业务要求

## 表单验证最佳实践

### 1. 实时验证
- 输入时实时验证，提高用户体验
- 避免在提交时才显示所有错误

### 2. 明确提示
- 错误提示明确，告知用户具体问题
- 避免泛泛的错误提示

### 3. 视觉反馈
- 红色边框和文字，提供明确的视觉反馈
- 避免过度使用警告状态

### 4. 输入提示
- 提供输入提示，避免用户犯错
- 显示字段格式要求和长度限制

### 5. 提交前验证
- 提交前验证所有字段，避免无效数据提交
- 显示所有错误信息，告知用户需要修改的字段

## 总结

表单验证是高保真设计图的重要组成部分。设计团队已经提供了详细的表单验证方案，开发团队可以根据方案实现表单验证。建议在开发过程中按照最佳实践实现表单验证，确保用户输入数据的正确性和完整性。

