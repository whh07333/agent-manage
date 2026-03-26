import { test } from '@playwright/test';

test('调试：检查页面实际显示和网络请求', async ({ page, context, request }) => {
  console.log('🔍 开始调试页面显示问题...\n');
  
  // 1. 直接使用API请求验证
  console.log('1️⃣ 验证API是否正常');
  const apiResponse = await request.get('http://localhost:3001/api/projects', {
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQ0OTM2NjcsImV4cCI6MTc3NTA5ODQ2N30.mmFD2YgHNqg47t10JiJ4WiabQ-zBdhmrwTGfIzHveO8'
    }
  });
  console.log(`API响应状态: ${apiResponse.status()}`);
  const apiData = await apiResponse.json();
  console.log(`API返回项目数: ${apiData.data?.length || 0}`);
  
  // 2. 检查localStorage中的token
  console.log('\n2️⃣ 检查localStorage');
  await page.goto('http://localhost:5173');
  const localStorageToken = await page.evaluate(() => {
    return {
      token: localStorage.getItem('token'),
      tokenLength: localStorage.getItem('token')?.length || 0
    };
  });
  console.log(`localStorage中的token长度: ${localStorageToken.tokenLength}`);
  
  // 3. 检查网络请求
  console.log('\n3️⃣ 监控网络请求');
  let projectRequestFailed = false;
  let projectRequestStatus = 0;
  
  page.on('response', async (response) => {
    if (response.url().includes('/api/projects')) {
      projectRequestStatus = response.status();
      console.log(`收到 /api/projects 响应: ${response.status()}`);
      
      if (response.status() !== 200) {
        projectRequestFailed = true;
        const body = await response.text();
        console.log(`请求失败: ${body.substring(0, 200)}`);
      }
    }
  });
  
  // 4. 加载项目列表页面
  console.log('\n4️⃣ 加载项目列表页面');
  await page.goto('http://localhost:5173/projects');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  
  // 5. 检查页面显示
  console.log('\n5️⃣ 检查页面显示');
  const listItems = page.locator('.ant-list-item');
  const count = await listItems.count();
  console.log(`页面显示项目数: ${count}`);
  
  if (count > 0) {
    // 获取第一个项目的名称
    const firstProjectName = await listItems.first().textContent();
    console.log(`第一个项目名称: ${firstProjectName?.substring(0, 50)}...`);
  }
  
  // 6. 截图
  console.log('\n6️⃣ 截图保存');
  await page.screenshot({ path: 'test-results/current-page-debug.png', fullPage: true });
  console.log('截图已保存: test-results/current-page-debug.png');
  
  // 7. 总结
  console.log('\n📊 调试总结:');
  console.log(`- API返回项目数: ${apiData.data?.length || 0}`);
  console.log(`- 网络请求状态: ${projectRequestStatus || '未发起'}`);
  console.log(`- 页面显示项目数: ${count}`);
  console.log(`- localStorage token: ${localStorageToken.tokenLength > 0 ? '存在' : '不存在'}`);
  
  if (count === 0) {
    console.log('\n❌ 问题：页面没有显示任何项目');
    
    // 检查是否有错误提示
    const errorMessages = await page.locator('.ant-message-error').allTextContents();
    if (errorMessages.length > 0) {
      console.log('页面错误信息:');
      errorMessages.forEach(msg => console.log(`  - ${msg}`));
    }
  }
});
