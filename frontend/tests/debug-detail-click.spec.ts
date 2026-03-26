import { test } from '@playwright/test';

test('调试：检查项目名称元素的完整结构', async ({ page, context }) => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzQzNjU1ODIsImV4cCI6MTc3NDk3MzI3OX0.csZTqW8J3EIAuIRLXRAC_XUU1t8d-zuo8YO7HApJP3g';
  await context.addInitScript((t) => localStorage.setItem('token', t), token);
  
  await page.goto('http://localhost:5173/projects');
  await page.waitForTimeout(5000);
  
  // 查找所有Card.Meta元素
  const cardMetas = page.locator('.ant-list-item .ant-card-meta');
  console.log(`找到 ${await cardMetas.count()} 个Card.Meta元素`);
  
  if (await cardMetas.count() > 0) {
    const firstCardMeta = cardMetas.first();
    
    // 获取HTML结构
    const html = await firstCardMeta.innerHTML();
    console.log('第一个Card.Meta的HTML:', html);
    
    // 查找span元素
    const spans = firstCardMeta.locator('span');
    const spanCount = await spans.count();
    console.log(`Card.Meta中的span数量: ${spanCount}`);
    
    for (let i = 0; i < Math.min(spanCount, 5); i++) {
      const text = await spans.nth(i).textContent();
      const cursor = await spans.nth(i).evaluate(el => window.getComputedStyle(el).cursor);
      const decoration = await spans.nth(i).evaluate(el => window.getComputedStyle(el).textDecoration);
      const onclick = await spans.nth(i).evaluate(el => el.onclick !== null);
      
      console.log(`  span ${i}: text="${text}", cursor="${cursor}", decoration="${decoration}", hasOnClick=${onclick}`);
    }
    
    // 尝试点击
    console.log('尝试点击第一个span...');
    await spans.first().click();
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log('点击后URL:', currentUrl);
    
    if (currentUrl.includes('/projects/') && !currentUrl.endsWith('/projects')) {
      console.log('✅ 跳转成功');
    } else {
      console.log('❌ 跳转失败');
    }
  }
});
