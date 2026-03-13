#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
OpenClaw AI Agent项目管理系统 - API自动化测试框架
v1.0 版本测试脚本
"""

import requests
import json
import unittest
from datetime import datetime, timedelta
import time


class OpenClawAPITest(unittest.TestCase):
    """OpenClaw项目管理系统API测试基类"""
    
    # 测试环境配置
    BASE_URL = "http://api.openclaw.test"
    
    # 请求头配置
    HEADERS = {
        "Content-Type": "application/json",
        "Authorization": "Bearer test_token"
    }
    
    @classmethod
    def setUpClass(cls):
        """测试前的准备工作"""
        print("=" * 50)
        print(f"开始测试 OpenClaw AI Agent项目管理系统 API")
        print(f"测试环境: {cls.BASE_URL}")
        print("=" * 50)
        print()
    
    @classmethod
    def tearDownClass(cls):
        """测试后的清理工作"""
        print()
        print("=" * 50)
        print(f"OpenClaw API测试完成")
        print("=" * 50)


class ProjectManagementAPITest(OpenClawAPITest):
    """项目管理API测试"""
    
    def test_project_creation_success(self):
        """测试项目创建API - 正常创建项目"""
        print("测试项目创建API - 正常创建项目")
        
        # 构造请求参数
        data = {
            "project_name": "测试项目" + str(int(time.time())),
            "business_goal": "测试项目管理功能",
            "cycle": "2周",
            "priority": "P0",
            "agent_list": ["agent_1", "agent_2"]
        }
        
        # 发送请求
        response = requests.post(
            f"{self.BASE_URL}/api/v1/projects",
            headers=self.HEADERS,
            data=json.dumps(data)
        )
        
        # 验证响应结果
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertIn("project_id", result)
        self.assertGreater(len(result["project_id"]), 0)
        print(f"✅ 项目创建成功，项目ID: {result['project_id']}")
        
        # 保存项目ID供其他测试使用
        self.test_project_id = result["project_id"]
    
    def test_project_creation_missing_param(self):
        """测试项目创建API - 缺失必填参数"""
        print("测试项目创建API - 缺失必填参数")
        
        # 构造请求参数（缺少项目名称）
        data = {
            "business_goal": "测试项目管理功能",
            "cycle": "2周",
            "priority": "P0",
            "agent_list": ["agent_1", "agent_2"]
        }
        
        # 发送请求
        response = requests.post(
            f"{self.BASE_URL}/api/v1/projects",
            headers=self.HEADERS,
            data=json.dumps(data)
        )
        
        # 验证响应结果
        self.assertEqual(response.status_code, 400)
        result = response.json()
        self.assertIn("error", result)
        self.assertIn("project_name", result["error"])
        print("✅ 参数验证成功，正确拒绝了缺少必填参数的请求")
    
    def test_project_query_by_id(self):
        """测试项目查询API - 按项目ID查询"""
        print("测试项目查询API - 按项目ID查询")
        
        # 首先创建一个项目
        self.test_project_creation_success()
        
        # 查询项目信息
        response = requests.get(
            f"{self.BASE_URL}/api/v1/projects/{self.test_project_id}",
            headers=self.HEADERS
        )
        
        # 验证响应结果
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertEqual(result["project_id"], self.test_project_id)
        self.assertGreater(len(result["project_name"]), 0)
        print(f"✅ 项目查询成功，项目名称: {result['project_name']}")
    
    def test_project_query_nonexistent(self):
        """测试项目查询API - 查询不存在的项目"""
        print("测试项目查询API - 查询不存在的项目")
        
        # 查询不存在的项目
        response = requests.get(
            f"{self.BASE_URL}/api/v1/projects/nonexistent_project",
            headers=self.HEADERS
        )
        
        # 验证响应结果
        self.assertEqual(response.status_code, 404)
        result = response.json()
        self.assertIn("error", result)
        self.assertIn("不存在", result["error"])
        print("✅ 正确处理了查询不存在项目的请求")


class TaskManagementAPITest(OpenClawAPITest):
    """任务管理API测试"""
    
    def setUp(self):
        """每个任务测试前的准备工作"""
        # 创建测试项目
        self.test_project_id = self._create_test_project()
    
    def _create_test_project(self):
        """创建测试项目"""
        data = {
            "project_name": "测试项目" + str(int(time.time())),
            "business_goal": "测试任务管理功能",
            "cycle": "2周",
            "priority": "P0",
            "agent_list": ["agent_1", "agent_2"]
        }
        
        response = requests.post(
            f"{self.BASE_URL}/api/v1/projects",
            headers=self.HEADERS,
            data=json.dumps(data)
        )
        
        if response.status_code == 200:
            return response.json()["project_id"]
        else:
            raise Exception(f"创建测试项目失败: {response.text}")
    
    def test_task_creation_success(self):
        """测试任务创建API - 正常创建任务"""
        print("测试任务创建API - 正常创建任务")
        
        # 构造请求参数
        data = {
            "title": "测试任务" + str(int(time.time())),
            "description": "测试任务管理功能",
            "priority": "P0",
            "deadline": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
            "assignee": "agent_1",
            "project_id": self.test_project_id
        }
        
        # 发送请求
        response = requests.post(
            f"{self.BASE_URL}/api/v1/tasks",
            headers=self.HEADERS,
            data=json.dumps(data)
        )
        
        # 验证响应结果
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertIn("task_id", result)
        self.assertGreater(len(result["task_id"]), 0)
        print(f"✅ 任务创建成功，任务ID: {result['task_id']}")
        
        # 保存任务ID供其他测试使用
        self.test_task_id = result["task_id"]
    
    def test_task_status_update(self):
        """测试任务状态更新API"""
        print("测试任务状态更新API")
        
        # 创建测试任务
        self.test_task_creation_success()
        
        # 构造请求参数
        data = {
            "status": "进行中"
        }
        
        # 发送请求
        response = requests.put(
            f"{self.BASE_URL}/api/v1/tasks/{self.test_task_id}/status",
            headers=self.HEADERS,
            data=json.dumps(data)
        )
        
        # 验证响应结果
        self.assertEqual(response.status_code, 200)
        print("✅ 任务状态更新成功")
    
    def test_task_deliverable_upload(self):
        """测试交付物管理API - 上传交付物"""
        print("测试交付物管理API - 上传交付物")
        
        # 创建测试任务
        self.test_task_creation_success()
        
        # 构造请求参数
        data = {
            "type": "文档",
            "url": "https://example.com/document.pdf",
            "version": "v1.0"
        }
        
        # 发送请求
        response = requests.post(
            f"{self.BASE_URL}/api/v1/tasks/{self.test_task_id}/deliverables",
            headers=self.HEADERS,
            data=json.dumps(data)
        )
        
        # 验证响应结果
        self.assertEqual(response.status_code, 200)
        print("✅ 交付物上传成功")


class EventSubscriptionAPITest(OpenClawAPITest):
    """事件订阅API测试"""
    
    def test_event_subscription_success(self):
        """测试事件订阅API - 正常订阅事件"""
        print("测试事件订阅API - 正常订阅事件")
        
        # 构造请求参数
        data = {
            "event_type": "task_status_change",
            "callback_url": "https://example.com/callback",
            "filter": {
                "project_id": "test_project",
                "task_id": "test_task"
            }
        }
        
        # 发送请求
        response = requests.post(
            f"{self.BASE_URL}/api/v1/subscriptions",
            headers=self.HEADERS,
            data=json.dumps(data)
        )
        
        # 验证响应结果
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertIn("subscription_id", result)
        self.assertGreater(len(result["subscription_id"]), 0)
        print(f"✅ 事件订阅成功，订阅ID: {result['subscription_id']}")


if __name__ == "__main__":
    # 运行所有测试
    unittest.main(verbosity=2)
