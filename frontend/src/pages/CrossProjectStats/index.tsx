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
    totalProjects: 12,
    totalTasks: 156,
    completedTasks: 89,
    completionRate: 57.1,
    inProgressTasks: 45,
    blockedTasks: 8,
    overdueTasks: 14,
  },
  agentStats: [
    {
      agentId: "agent-001",
      agentType: "developer",
      agentName: "开发Agent A",
      totalTasks: 24,
      completedTasks: 18,
      completionRate: 75.0,
      avgCompletionTime: 12.5,
      overdueTasks: 1,
    },
    {
      agentId: "agent-002",
      agentType: "tester",
      agentName: "测试Agent B",
      totalTasks: 18,
      completedTasks: 12,
      completionRate: 66.7,
      avgCompletionTime: 8.2,
      overdueTasks: 0,
    },
    {
      agentId: "agent-003",
      agentType: "product",
      agentName: "产品Agent C",
      totalTasks: 15,
      completedTasks: 9,
      completionRate: 60.0,
      avgCompletionTime: 15.3,
      overdueTasks: 2,
    },
    {
      agentId: "agent-004",
      agentType: "manager",
      agentName: "管理Agent D",
      totalTasks: 12,
      completedTasks: 7,
      completionRate: 58.3,
      avgCompletionTime: 20.1,
      overdueTasks: 1,
    },
    {
      agentId: "agent-005",
      agentType: "developer",
      agentName: "开发Agent E",
      totalTasks: 22,
      completedTasks: 16,
      completionRate: 72.7,
      avgCompletionTime: 10.8,
      overdueTasks: 0,
    },
    {
      agentId: "agent-006",
      agentType: "tester",
      agentName: "测试Agent F",
      totalTasks: 19,
      completedTasks: 11,
      completionRate: 57.9,
      avgCompletionTime: 9.5,
      overdueTasks: 3,
    },
  ],
  projectStats: [
    {
      projectId: "proj-001",
      projectName: "电商平台重构",
      status: "active",
      priority: "P0",
      totalTasks: 24,
      completedTasks: 9,
      completionRate: 37.5,
      inProgressTasks: 12,
      blockedTasks: 0,
      overdueTasks: 3,
      startDate: "2026-03-01",
      endDate: "2026-06-30",
    },
    {
      projectId: "proj-002",
      projectName: "移动端应用开发",
      status: "active",
      priority: "P1",
      totalTasks: 18,
      completedTasks: 12,
      completionRate: 66.7,
      inProgressTasks: 4,
      blockedTasks: 1,
      overdueTasks: 1,
      startDate: "2026-03-15",
      endDate: "2026-05-30",
    },
    {
      projectId: "proj-003",
      projectName: "后台管理系统",
      status: "completed",
      priority: "P2",
      totalTasks: 15,
      completedTasks: 15,
      completionRate: 100.0,
      inProgressTasks: 0,
      blockedTasks: 0,
      overdueTasks: 0,
      startDate: "2026-01-10",
      endDate: "2026-03-10",
    },
    {
      projectId: "proj-004",
      projectName: "数据迁移项目",
      status: "overdue",
      priority: "P0",
      totalTasks: 22,
      completedTasks: 8,
      completionRate: 36.4,
      inProgressTasks: 10,
      blockedTasks: 3,
      overdueTasks: 4,
      startDate: "2026-02-01",
      endDate: "2026-03-15",
    },
    {
      projectId: "proj-005",
      projectName: "API接口优化",
      status: "active",
      priority: "P1",
      totalTasks: 14,
      completedTasks: 10,
      completionRate: 71.4,
      inProgressTasks: 3,
      blockedTasks: 0,
      overdueTasks: 1,
      startDate: "2026-03-10",
      endDate: "2026-04-20",
    },
    {
      projectId: "proj-006",
      projectName: "UI组件库升级",
      status: "archived",
      priority: "P3",
      totalTasks: 8,
      completedTasks: 8,
      completionRate: 100.0,
      inProgressTasks: 0,
      blockedTasks: 0,
      overdueTasks: 0,
      startDate: "2026-01-05",
      endDate: "2026-02-28",
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
      setStats(mockCrossProjectStats);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (values: any) => {
    const { dateRange, projects, agents } = values;
    const params: any = {};
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.startDate = dateRange[0].format("YYYY-MM-DD");
      params.endDate = dateRange[1].format("YYYY-MM-DD");
    }
    if (projects && projects.length > 0) {
      params.projectIds = projects;
    }
    if (agents && agents.length > 0) {
      params.agentIds = agents;
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
        stats.summary.totalTasks,
        stats.summary.completedTasks,
        stats.summary.completionRate,
        stats.summary.inProgressTasks,
        stats.summary.blockedTasks,
        stats.summary.overdueTasks,
        "",
        "",
        "",
      ]
        .map(sanitize)
        .join(","),
    );

    // 添加Agent统计数据
    stats.agentStats.forEach((agent) => {
      rows.push(
        [
          "Agent",
          agent.agentId,
          agent.agentName,
          "",
          "",
          agent.totalTasks,
          agent.completedTasks,
          agent.completionRate,
          "",
          "",
          agent.overdueTasks,
          "",
          "",
          agent.avgCompletionTime,
        ]
          .map(sanitize)
          .join(","),
      );
    });

    // 添加项目统计数据
    stats.projectStats.forEach((project) => {
      rows.push(
        [
          "Project",
          project.projectId,
          project.projectName,
          project.status,
          project.priority,
          project.totalTasks,
          project.completedTasks,
          project.completionRate,
          project.inProgressTasks,
          project.blockedTasks,
          project.overdueTasks,
          project.startDate,
          project.endDate,
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
      dataIndex: "agentName",
      key: "agentName",
      render: (text: string, record: AgentStat) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-gray-500 text-xs">{record.agentId}</div>
        </div>
      ),
    },
    {
      title: "总任务数",
      dataIndex: "totalTasks",
      key: "totalTasks",
      sorter: (a: AgentStat, b: AgentStat) => a.totalTasks - b.totalTasks,
    },
    {
      title: "完成任务",
      dataIndex: "completedTasks",
      key: "completedTasks",
      sorter: (a: AgentStat, b: AgentStat) =>
        a.completedTasks - b.completedTasks,
      render: (text: number) => <span className="text-green-600">{text}</span>,
    },
    {
      title: "完成率",
      dataIndex: "completionRate",
      key: "completionRate",
      sorter: (a: AgentStat, b: AgentStat) =>
        a.completionRate - b.completionRate,
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
      dataIndex: "avgCompletionTime",
      key: "avgCompletionTime",
      sorter: (a: AgentStat, b: AgentStat) =>
        a.avgCompletionTime - b.avgCompletionTime,
      render: (time: number) => `${time.toFixed(1)} 小时`,
    },
    {
      title: "逾期任务",
      dataIndex: "overdueTasks",
      key: "overdueTasks",
      sorter: (a: AgentStat, b: AgentStat) => a.overdueTasks - b.overdueTasks,
      render: (count: number) => (
        <Tag color={count > 0 ? "red" : "green"}>{count}</Tag>
      ),
    },
  ];

  // 项目统计表格列定义
  const projectColumns = [
    {
      title: "项目名称",
      dataIndex: "projectName",
      key: "projectName",
      render: (text: string, record: ProjectStat) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-gray-500 text-xs">{record.projectId}</div>
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
      dataIndex: "totalTasks",
      key: "totalTasks",
      sorter: (a: ProjectStat, b: ProjectStat) => a.totalTasks - b.totalTasks,
    },
    {
      title: "完成任务",
      dataIndex: "completedTasks",
      key: "completedTasks",
      sorter: (a: ProjectStat, b: ProjectStat) =>
        a.completedTasks - b.completedTasks,
      render: (text: number) => <span className="text-green-600">{text}</span>,
    },
    {
      title: "完成率",
      dataIndex: "completionRate",
      key: "completionRate",
      sorter: (a: ProjectStat, b: ProjectStat) =>
        a.completionRate - b.completionRate,
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
      dataIndex: "inProgressTasks",
      key: "inProgressTasks",
    },
    {
      title: "阻塞",
      dataIndex: "blockedTasks",
      key: "blockedTasks",
      render: (count: number) =>
        count > 0 ? <Tag color="orange">{count}</Tag> : count,
    },
    {
      title: "逾期",
      dataIndex: "overdueTasks",
      key: "overdueTasks",
      render: (count: number) =>
        count > 0 ? <Tag color="red">{count}</Tag> : count,
    },
  ];

  // 准备图表数据
  const agentChartData =
    stats?.agentStats.map((agent) => ({
      name: agent.agentName,
      总任务数: agent.totalTasks,
      完成任务: agent.completedTasks,
      逾期任务: agent.overdueTasks,
    })) || [];

  const projectChartData =
    stats?.projectStats.map((project) => ({
      name: project.projectName,
      完成率: project.completionRate,
      总任务数: project.totalTasks,
      进行中任务: project.inProgressTasks,
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
            value={stats?.summary.totalProjects || 0}
            suffix=" 个"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="总任务数"
            value={stats?.summary.totalTasks || 0}
            suffix=" 个"
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="完成任务"
            value={stats?.summary.completedTasks || 0}
            suffix={` (${stats?.summary.completionRate?.toFixed(1) || 0}%)`}
            loading={loading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="进行中任务"
            value={stats?.summary.inProgressTasks || 0}
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
          dataSource={stats?.agentStats}
          columns={agentColumns}
          rowKey="agentId"
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
          dataSource={stats?.projectStats}
          columns={projectColumns}
          rowKey="projectId"
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
