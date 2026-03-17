import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  BarChartOutlined,
  FileTextOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';

const { Header, Content, Sider, Footer } = Layout;
const { Title } = Typography;

type MenuItemType = Exclude<Required<MenuProps>['items'][number], { type: 'divider' }>;

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItemType[] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '首页',
      onClick: () => navigate('/'),
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: '项目管理',
      onClick: () => navigate('/projects'),
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: '任务管理',
      onClick: () => navigate('/tasks'),
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: '统计看板',
      onClick: () => navigate('/statistics'),
    },
    {
      key: '/audit',
      icon: <FileTextOutlined />,
      label: '审计日志',
      onClick: () => navigate('/audit'),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      onClick: () => navigate('/settings'),
    },
  ];

  const userMenuItems: MenuItemType[] = [
    {
      key: 'profile',
      label: '个人信息',
      icon: <UserOutlined />,
    },
    {
      key: 'logout',
      label: '退出登录',
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div style={{
          height: 32,
          margin: 16,
          textAlign: 'center',
          color: '#fff',
          fontSize: 18,
          fontWeight: 'bold',
        }}>
          {!collapsed && 'OpenClaw 管理系统'}
          {collapsed && 'OC'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          selectedKeys={[location.pathname]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%', padding: '0 24px' }}>
            <Title level={4} style={{ margin: 0 }}>
              {menuItems.find(item => item?.key === location.pathname)?.label || 'OpenClaw 管理系统'}
            </Title>
            <Space>
              <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span>管理员</span>
                </Space>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '6px' }}>
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center', padding: '16px 50px', background: '#fff', marginTop: 'auto' }}>
          OpenClaw AI Agent项目管理系统 ©2026 - 前端高级开发工程师 Wendy
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;
