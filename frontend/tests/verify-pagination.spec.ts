import { test } from '@playwright/test';

test('验证：项目列表分页和总数', async ({ page, context }) => {
  const newToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQ0OTI2NTAsImV4cCI6MTc3NTA5NzQ1MH0.GCkxoJajZ9hAWwF2LxDeLSQDOH-4YvRtKFfjstZrV9I';
  
  await context.addInitScript(() => localStorage.removeItem('token'));
  await context.addInitScript((t) => localStorage.setItem('token', t), newToken);
  
  await page.goto('http://localhost:5173/projects');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  
  // 检查第一页的项目数
  const listItems = page.locator('.ant-list-item');
  const page1Count = await listItems.count();
  
  console.log(`📊 第一页显示项目数: ${page1Count}`);
  
  // 检查是否有分页控件
  const pagination = page.locator('.ant-pagination');
  const hasPagination = await pagination.count() > 0;
  
  console.log(`🔍 是否有分页控件: ${hasPagination ? '是' : '否'}`);
  
  if (hasPagination) {
    // 检查总页数和总记录数
    const paginationInfo = page.locator('.ant-pagination-item-active, .ant-pagination-total-text');
    const text = await paginationInfo.allTextContents();
    console.log(`📄 分页信息: ${text.join(', ')}`);
    
    // 检查是否有下一页
    const nextPageButton = page.locator('.ant-pagination-next');
    const hasNextPage = await nextPageButton.isEnabled();
    console.log(`➡️ 是否有下一页: ${hasNextPage ? '是' : '否'}`);
    
    if (hasNextPage) {
      console.log(`\n🔍 尝试点击下一页查看更多项目...`);
      await nextPageButton.click();
      await page.waitForTimeout(3000);
      
      const page2Count = await listItems.count();
      console.log(`📊 第二页显示项目数: ${page2Count}`);
    }
  } else {
    console.log(`⚠️ 没有分页控件，可能只显示了前${page1Count}个项目`);
  }
  
  console.log(`\n📊 总结:`);
  console.log(`- 数据库实际项目数: 19`);
  console.log(`- 第一页显示: ${page1Count}个`);
});
