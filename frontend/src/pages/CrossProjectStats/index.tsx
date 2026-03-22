import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Row,
  Col,
  Select,
  DatePicker,
  Form,
  Alert,
  Tooltip,
} from "antd";
import {
  FilterOutlined,
  ExportOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { statisticsApi } from "../../services/api";
import type {
  CrossProjectStats as CrossProjectStatsType,
  AgentStat,
  ProjectStat,
} from "../../types";
import { StatsCard } from "../../components/StatsCard";
import { BarChart } from "../../components/BarChart";
import { LineChart } from "../../components/LineChart";

const { RangePicker } = DatePicker;
const { Option } = Select;

// 模拟数据（API失败时使用）
const mockCrossProjectStats: CrossProjectStatsType = {
  summary: {
    total_projects: 12,
    total_tasks: 156,
    completed_tasks: 89,
    completion_rate: 57.1,
    in_progress_tasks: 45,
    blocked_tasks: 8,
    overdue_tasks: 14,
  },
  agent_stats: [
    {
      agent_id: "agent-001",
      agent_type: "developer",
      agent_name: "开发Agent A",
      total_tasks: 24,
      completed_tasks: 18,
      completion_rate: 75.0,
      avg_completion_time: 12.5,
      overdue_tasks: 1,
    },
    {
      agent_id: "agent-002",
      agent_type: "tester",
      agent_name: "测试Agent B",
      total_tasks: 18,
      completed_tasks: 12,
      completion_rate: 66.7,
      avg_completion_time: 8.2,
      overdue_tasks: 0,
    },
    {
      agent_id: "agent-003",
      agent_type: "product",
      agent_name: "产品Agent C",
      total_tasks: 15,
      completed_tasks: 9,
      completion_rate: 60.0,
      avg_completion_time: 15.3,
      overdue_tasks: 2,
    },
    {
      agent_id: "agent-004",
      agent_type: "manager",
      agent_name: "管理Agent D",
      total_tasks: 12,
      completed_tasks: 7,
      completion_rate: 58.3,
      avg_completion_time: 20.1,
      overdue_tasks: 1,
    },
    {
      agent_id: "agent-005",
      agent_type: "developer",
      agent_name: "开发Agent E",
      total_tasks: 22,
      completed_tasks: 16,
      completion_rate: 72.7,
      avg_completion_time: 10.8,
      overdue_tasks: 0,
    },
    {
      agent_id: "agent-006",
      agent_type: "tester",
      agent_name: "测试Agent F",
      total_tasks: 19,
      completed_tasks: 11,
      completion_rate: 57.9,
      avg_completion_time: 9.5,
      overdue_tasks: 3,
    },
  ],
  project_stats: [
    {
      project_id: "proj-001",
      project_name: "电商平台重构",
      status: "active",
      priority: "P0",
      total_tasks: 24,
      completed_tasks: 9,
      completion_rate: 37.5,
      in_progress_tasks: 12,
      blocked_tasks: 0,
      overdue_tasks: 3,
      start_date: "2026-03-01",
      end_date: "2026-06-30",
    },
    {
      project_id: "proj-002",
      project_name: "移动端应用开发",
      status: "active",
      priority: "P1",
      total_tasks: 18,
      completed_tasks: 12,
      completion_rate: 66.7,
      in_progress_tasks: 4,
      blocked_tasks: 1,
      overdue_tasks: 1,
      start_date: "2026-03-15",
      end_date: "2026-05-30",
    },
    {
      project_id: "proj-003",
      project_name: "后台管理系统",
      status: "completed",
      priority: "P2",
      total_tasks: 15,
      completed_tasks: 15,
      completion_rate: 100.0,
      in_progress_tasks: 0,
      blocked_tasks: 0,
      overdue_tasks: 0,
      start_date: "2026-01-10",
      end_date: "2026-03-10",
    },
    {
      project_id: "proj-004",
      project_name: "数据迁移项目",
      status: "overdue",
      priority: "P0",
      total_tasks: 22,
      completed_tasks: 8,
      completion_rate: 36.4,
      in_progress_tasks: 10,
      blocked_tasks: 3,
      overdue_tasks: 4,
      start_date: "2026-02-01",
      end_date: "2026-03-15",
    },
    {
      project_id: "proj-005",
      project_name: "API接口优化",
      status: "active",
      priority: "P1",
      total_tasks: 14,
      completed_tasks: 10,
      completion_rate: 71.4,
      in_progress_tasks: 3,
      blocked_tasks: 0,
      overdue_tasks: 1,
      start_date: "2026-03-10",
      end_date: "2026-04-20",
    },
    {
      project_id: "proj-006",
      project_name: "UI组件库升级",
      status: "archived",
      priority: "P3",
      total_tasks: 8,
      completed_tasks: 8,
      completion_rate: 100.0,
      in_progress_tasks: 0,
      blocked_tasks: 0,
      overdue_tasks: 0,
      start_date: "2026-01-05",
      end_date: "2026-02-28",
    },
  ],
};

// 模拟项目列表（用于筛选）
const mockProjects = [
  { id: "proj-001", name: "电商平台重构" },
  { id: "proj-002", name: "移动端应用开发" },
  { id: "proj-003", name: "后台管理系统" },
  { id: "proj-004", name: "数据迁移项目" },
  { id: "proj-005", name: "API接口优化" },
  { id: "proj-006", name: "UI组件库升级" },
];

// 模拟Agent列表（用于筛选）
const mockAgents = [
  { id: "agent-001", name: "开发Agent A" },
  { id: "agent-002", name: "测试Agent B" },
  { id: "agent-003", name: "产品Agent C" },
  { id: "agent-004", name: "管理Agent D" },
  { id: "agent-005", name: "开发Agent E" },
  { id: "agent-006", name: "测试Agent F" },
];

export const CrossProjectStats: React.FC = () => {
  const [form] = Form.useForm();
  const [stats, setStats] = useState<CrossProjectStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  // 初始化表单值
  const [formValues, setFormValues] = useState({
    dateRange: [dayjs().subtract(30, "day"), dayjs()] as [Dayjs, Dayjs],
    projects: [] as string[],
    agents: [] as string[],
  });

  useEffect(() => {
    fetchCrossProjectStats();
  }, []);

  const fetchCrossProjectStats = async (params?: {
    start_date?: string;
    end_date?: string;
    project_ids?: string[];
    agent_ids?: string[];
  }) => {
    try {
      setLoading(true);
      const response = await statisticsApi.getCrossProjectStats(params);
      if (response.code === 0) {
        setStats(response.data);
      } else {
        console.error("获取跨项目统计失败:", response.msg);
        // 使用模拟数据
        setStats(mockCrossProjectStats);
      }
    } catch (error) {
      console.error("获取跨项目统计异常:", error);
      // 使用模拟数据
      setStats(mockCrossProjectStats);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (values: any) => {
    const { dateRange, projects, agents } = values;
    const params: any = {};
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.start_date = dateRange[0].format("YYYY-MM-DD");
      params.end_date = dateRange[1].format("YYYY-MM-DD");
    }
    if (projects && projects.length > 0) {
      params.project_ids = projects;
    }
    if (agents && agents.length > 0) {
      params.agent_ids = agents;
    }
    fetchCrossProjectStats(params);
  };

  const handleResetFilters = () => {
    form.resetFields();
    const defaultValues = {
      dateRange: [dayjs().subtract(30, "day"), dayjs()] as [Dayjs, Dayjs],
      projects: [],
      agents: [],
    };
    form.setFieldsValue(defaultValues);
    setFormValues(defaultValues);
    fetchCrossProjectStats();
  };

  const handleExportCSV = () => {
    setExportLoading(true);
    // 模拟导出延迟
    setTimeout(() => {
      exportToCSV();
      setExportLoading(false);
    }, 1000);
  };

  const exportToCSV = () => {
    if (!stats) return;

    // 防止注入攻击：清理数据
    const sanitize = (str: any) => {
      if (str === null || str === undefined) return "";
      const string = String(str);
      // 移除可能破坏CSV的字符：引号、逗号、换行等，用引号包裹
      return `"${string.replace(/"/g, '""')}"`;
    };

    const headers = [
      "类型",
      "ID",
      "名称",
      "状态",
      "优先级",
      "总任务数",
      "完成任务",
      "完成率%",
      "进行中任务",
      "阻塞任务",
      "逾期任务",
      "开始日期",
      "结束日期",
      "平均完成时间(小时)",
    ];

    const rows: string[] = [];

    // 添加摘要行
    rows.push(
      [
        "摘要",
        "",
        "",
        "",
        "",
        stats.summary.total_tasks,
        stats.summary.completed_tasks,
        stats.summary.completion_rate,
        stats.summary.in_progress_tasks,
        stats.summary.blocked_tasks,
        stats.summary.overdue_tasks,
        "",
        "",
        "",
      ]
        .map(sanitize)
        .join(","),
    );

    // 添加Agent统计数据
    stats.agent_stats.forEach((agent) => {
      rows.push(
        [
          "Agent",
          agent.agent_id,
          agent.agent_name,
          "",
          "",
          agent.total_tasks,
          agent.completed_tasks,
          agent.completion_rate,
          "",
          "",
          agent.overdue_tasks,
          "",
          "",
          agent.avg_completion_time,
        ]
          .map(sanitize)
          .join(","),
      );
    });

    // 添加项目统计数据
    stats.project_stats.forEach((project) => {
      rows.push(
        [
          "Project",
          project.project_id,
          project.project_name,
          project.status,
          project.priority,
          project.total_tasks,
          project.completed_tasks,
          project.completion_rate,
          project.in_progress_tasks,
          project.blocked_tasks,
          project.overdue_tasks,
          project.start_date,
          project.end_date,
          "",
        ]
          .map(sanitize)
          .join(","),
      );
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `cross-project-stats-${dayjs().format("YYYY-MM-DD")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Agent统计表格列定义
  const agentColumns = [
    {
      title: "Agent名称",
      dataIndex: "agent_name",
      key: "agent_name",
      render: (text: string, record: AgentStat) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-gray-500 text-xs">{record.agent_id}</div>
        </div>
      ),
    },
    {
      title: "总任务数",
      dataIndex: "total_tasks",
      key: "total_tasks",
      sorter: (a: AgentStat, b: AgentStat) => a.total_tasks - b.total_tasks,
    },
    {
      title: "完成任务",
      dataIndex: "completed_tasks",
      key: "completed_tasks",
      sorter: (a: AgentStat, b: AgentStat) =>
        a.completed_tasks - b.completed_tasks,
      render: (text: number) => <span className="text-green-600">{text}</span>,
    },
    {
      title: "完成率",
      dataIndex: "completion_rate",
      key: "completion_rate",
      sorter: (a: AgentStat, b: AgentStat) =>
        a.completion_rate - b.completion_rate,
      render: (rate: number) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
            <div
              className={`h-2 rounded-full ${rate >= 70 ? "bg-green-500" : rate >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
              style={{ width: `${Math.min(rate, 100)}%` }}
            />
          </div>
          <span>{rate.toFixed(1)}%</span>
        </div>
      ),
    },
    {
      title: "平均完成时间",
      dataIndex: "avg_completion_time",
      key: "avg_completion_time",
      sorter: (a: AgentStat, b: AgentStat) =>
        a.avg_completion_time - b.avg_completion_time,
      render: (time: number) => `${time.toFixed(1)} 小时`,
    },
    {
      title: "逾期任务",
      dataIndex: "overdue_tasks",
      key: "overdue_tasks",
      sorter: (a: AgentStat, b: AgentStat) => a.overdue_tasks - b.overdue_tasks,
      render: (count: number) => (
        <Tag color={count > 0 ? "red" : "green"}>{count}</Tag>
      ),
    },
  ];

  // 项目统计表格列定义
  const projectColumns = [
    {
      title: "项目名称",
      dataIndex: "project_name",
      key: "project_name",
      render: (text: string, record: ProjectStat) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-gray-500 text-xs">{record.project_id}</div>
        </div>
      ),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status: ProjectStat["status"]) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
          active: { color: "blue", text: "进行中" },
          completed: { color: "green", text: "已完成" },
          archived: { color: "gray", text: "已归档" },
          overdue: { color: "red", text: "逾期" },
        };
        const config = statusConfig[status] || {
          color: "default",
          text: status,
        };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: "优先级",
      dataIndex: "priority",
      key: "priority",
      render: (priority: ProjectStat["priority"]) => {
        const priorityColors: Record<string, string> = {
          P0: "red",
          P1: "orange",
          P2: "yellow",
          P3: "green",
        };
        return <Tag color={priorityColors[priority]}>{priority}</Tag>;
      },
    },
    {
      title: "总任务数",
      dataIndex: "total_tasks",
      key: "total_tasks",
      sorter: (a: ProjectStat, b: ProjectStat) => a.total_tasks - b.total_tasks,
    },
    {
      title: "完成任务",
      dataIndex: "completed_tasks",
      key: "completed_tasks",
      sorter: (a: ProjectStat, b: ProjectStat) =>
        a.completed_tasks - b.completed_tasks,
      render: (text: number) => <span className="text-green-600">{text}</span>,
    },
    {
      title: "完成率",
      dataIndex: "completion_rate",
      key: "completion_rate",
      sorter: (a: ProjectStat, b: ProjectStat) =>
        a.completion_rate - b.completion_rate,
      render: (rate: number) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
            <div
              className={`h-2 rounded-full ${rate >= 70 ? "bg-green-500" : rate >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
              style={{ width: `${Math.min(rate, 100)}%` }}
            />
          </div>
          <span>{rate.toFixed(1)}%</span>
        </div>
      ),
    },
    {
      title: "进行中",
      dataIndex: "in_progress_tasks",
      key: "in_progress_tasks",
    },
    {
      title: "阻塞",
      dataIndex: "blocked_tasks",
      key: "blocked_tasks",
      render: (count: number) =>
        count > 0 ? <Tag color="orange">{count}</Tag> : count,
    },
    {
      title: "逾期",
      dataIndex: "overdue_tasks",
      key: "overdue_tasks",
      render: (count: number) =>
        count > 0 ? <Tag color="red">{count}</Tag> : count,
    },
  ];

  // 准备图表数据
  const agentChartData =
    stats?.agent_stats.map((agent) => ({
      name: agent.agent_name,
      总任务数: agent.total_tasks,
      完成任务: agent.completed_tasks,
      逾期任务: agent.overdue_tasks,
    })) || [];

  const projectChartData =
    stats?.project_stats.map((project) => ({
      name: project.project_name,
      完成率: project.completion_rate,
      总任务数: project.total_tasks,
      进行中任务: project.in_progress_tasks,
    })) || [];

  if (loading && !stats) {
    return (
      <div className="p-4">
        <div className="text-center py-20">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* 页面标题 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">跨项目统计分析</h2>
        <Space>
          <Button
            icon={<ExportOutlined />}
            type="primary"
            loading={exportLoading}
            onClick={handleExportCSV}
          >
            导出CSV
          </Button>
          <Tooltip title="刷新数据">
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchCrossProjectStats()}
            />
          </Tooltip>
        </Space>
      </div>

      {/* 筛选面板 */}
      <Card
        className="mb-6"
        title={
          <div className="flex items-center">
            <FilterOutlined className="mr-2" />
            筛选条件
            <Tooltip title="根据日期范围、项目和Agent筛选统计数据">
              <InfoCircleOutlined className="ml-2 text-gray-400" />
            </Tooltip>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={formValues}
          onFinish={handleFilterSubmit}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Form.Item label="日期范围" name="dateRange">
                <RangePicker
                  className="w-full"
                  format="YYYY-MM-DD"
                  allowClear={false}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="项目筛选" name="projects">
                <Select
                  mode="multiple"
                  placeholder="选择项目（不选表示全部）"
                  className="w-full"
                  allowClear
                >
                  {mockProjects.map((proj) => (
                    <Option key={proj.id} value={proj.id}>
                      {proj.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Agent筛选" name="agents">
                <Select
                  mode="multiple"
                  placeholder="选择Agent（不选表示全部）"
                  className="w-full"
                  allowClear
                >
                  {mockAgents.map((agent) => (
                    <Option key={agent.id} value={agent.id}>
                      {agent.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <div className="flex justify-end gap-2">
            <Button onClick={handleResetFilters}>重置筛选</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              应用筛选
            </Button>
          </div>
        </Form>
      </Card>

      {/* 统计摘要卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="总项目数"
            value={stats?.summary.total_projects || 0}
            suffix=" 个"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="总任务数"
            value={stats?.summary.total_tasks || 0}
            suffix=" 个"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="完成任务"
            value={stats?.summary.completed_tasks || 0}
            suffix={` (${stats?.summary.completion_rate?.toFixed(1) || 0}%)`}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="进行中任务"
            value={stats?.summary.in_progress_tasks || 0}
            suffix=" 个"
            loading={loading}
          />
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Agent任务分布">
            <BarChart
              data={agentChartData}
              xKey="name"
              yKeys={[
                { key: "总任务数", name: "总任务数", color: "#1890ff" },
                { key: "完成任务", name: "完成任务", color: "#52c41a" },
                { key: "逾期任务", name: "逾期任务", color: "#f5222d" },
              ]}
              height={300}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="项目完成率排行">
            <LineChart
              data={projectChartData}
              xKey="name"
              yKeys={[{ key: "完成率", name: "完成率", color: "#1890ff" }]}
              height={300}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Agent统计表格 */}
      <Card title="Agent统计详情" className="mb-6">
        <Alert
          message="此表格展示各Agent的任务完成情况，支持按列排序。"
          type="info"
          showIcon
          className="mb-4"
        />
        <Table
          dataSource={stats?.agent_stats}
          columns={agentColumns}
          rowKey="agent_id"
          pagination={{ pageSize: 5 }}
          loading={loading}
          scroll={{ x: "max-content" }}
          className="responsive-table"
        />
      </Card>

      {/* 项目统计表格 */}
      <Card title="项目统计详情">
        <Alert
          message="此表格展示各项目的详细统计信息，支持按列排序。"
          type="info"
          showIcon
          className="mb-4"
        />
        <Table
          dataSource={stats?.project_stats}
          columns={projectColumns}
          rowKey="project_id"
          pagination={{ pageSize: 5 }}
          loading={loading}
          scroll={{ x: "max-content" }}
          className="responsive-table"
        />
      </Card>

      {/* 底部说明 */}
      <Alert
        message="数据说明"
        description="跨项目统计数据汇总了所有项目的任务完成情况、Agent工作量和项目进度。数据每小时更新一次，导出功能提供CSV格式文件，已进行注入攻击防护处理。"
        type="info"
        showIcon
        className="mt-6"
      />
    </div>
  );
};

export default CrossProjectStats;
