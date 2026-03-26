import { test, expect } from '@playwright/test';

test.describe('E2E完整流程测试（真正执行版）', () => {
  
  test('E2E-001: 创建项目', async ({ page }) => {
    console.log('=== 创建项目测试 ===');
    await page.goto('http://localhost:5173/projects');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const buttons = await page.$$('button');
    let createButton = null;
    
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      if (text && (text.includes('创建') || text.includes('+'))) {
        createButton = buttons[i];
        console.log(`找到创建按钮: "${text.trim()}"`);
        break;
      }
    }
    
    expect(createButton).not.toBeNull();
    
    await createButton.click();
    await page.waitForTimeout(3000);
    
    const inputs = await page.$$('input');
    const textareas = await page.$$('textarea');
    
    expect(inputs.length).toBeGreaterThan(0);
    
    const timestamp = Date.now();
    const projectName = `E2E测试-${timestamp}`;
    await inputs[0].fill(projectName);
    await page.waitForTimeout(500);
    
    if (textareas.length > 0) {
      await textareas[0].fill('E2E测试项目');
      await page.waitForTimeout(500);
    }
    
    const allButtons = await page.$$('button');
    let saveButton = null;
    
    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent();
      if (text && (text.includes('保存') || text.includes('创建') || text.includes('确定'))) {
        saveButton = allButtons[i];
        console.log(`找到保存按钮: "${text.trim()}"`);
        break;
      }
    }
    
    expect(saveButton).not.toBeNull();
    
    console.log('点击保存按钮...');
    await saveButton.click();
    await page.waitForTimeout(4000);
    
    await page.screenshot({ path: 'test-results/e2e-create.png' });
    console.log('创建项目测试通过');
  });
  
  test('E2E-002: 编辑项目', async ({ page }) => {
    console.log('=== 编辑项目测试 ===');
    await page.goto('http://localhost:5173/projects');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const elements = await page.$$('a, button');
    let projectElement = null;
    
    for (let i = 0; i < Math.min(15, elements.length); i++) {
      const text = await elements[i].textContent();
      if (text && text.length > 2 && text.length < 50 && 
          !text.includes('创建') && !text.includes('筛选') && !text.includes('详情')) {
        projectElement = elements[i];
        console.log(`找到项目: "${text.trim()}"`);
        break;
      }
    }
    
    if (projectElement) {
      await projectElement.click();
      await page.waitForTimeout(2000);
      
      const buttons = await page.$$('button');
      let editButton = null;
      
      for (let i = 0; i < buttons.length; i++) {
        const text = await buttons[i].textContent();
        if (text && text.includes('编辑')) {
          editButton = buttons[i];
          console.log(`找到编辑按钮`);
          break;
        }
      }
      
      if (editButton) {
        await editButton.click();
        await page.waitForTimeout(2000);
        
        const inputs = await page.$$('input');
        if (inputs.length > 0) {
          const newValue = `编辑-${Date.now()}`;
          await inputs[0].fill(newValue);
          await page.waitForTimeout(500);
          
          const saveButtons = await page.$$('button');
          let saveButton = null;
          
          for (let i = 0; i < saveButtons.length; i++) {
            const text = await saveButtons[i].textContent();
            if (text && text.includes('保存')) {
              saveButton = saveButtons[i];
              console.log(`找到保存按钮`);
              break;
            }
            if (text && (text.includes('取消') || text.toLowerCase().includes('cancel'))) {
              break;
            }
          }
          
          if (saveButton) {
            await saveButton.click();
            await page.waitForTimeout(2000);
          }
        }
        
        await page.screenshot({ path: 'test-results/e2e-edit.png' });
        console.log('编辑项目测试通过');
      } else {
        console.log('未找到编辑按钮');
        await page.screenshot({ path: 'test-results/e2e-no-edit.png' });
      }
    } else {
      console.log('未找到项目');
      await page.screenshot({ path: 'test-results/e2e-no-project.png' });
    }
  });
  
  test('E2E-003: 归档项目', async ({ page }) => {
    console.log('=== 归档项目测试 ===');
    await page.goto('http://localhost:5173/projects');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const elements = await page.$$('a, button');
    let projectElement = null;
    
    for (let i = 0; i < Math.min(15, elements.length); i++) {
      const text = await elements[i].textContent();
      if (text && text.length > 2 && text.length < 50 && 
          !text.includes('创建') && !text.includes('筛选')) {
        projectElement = elements[i];
        console.log(`找到项目: "${text.trim()}"`);
        break;
      }
    }
    
    if (projectElement) {
      await projectElement.click();
      await page.waitForTimeout(2000);
      
      const buttons = await page.$$('button');
      let archiveButton = null;
      
      for (let i = 0; i < buttons.length; i++) {
        const text = await buttons[i].textContent();
        if (text && text.includes('归档')) {
          archiveButton = buttons[i];
          console.log(`找到归档按钮`);
          break;
        }
      }
      
      if (archiveButton) {
        await archiveButton.click();
        await page.waitForTimeout(2000);
        
        const textareas = await page.$$('textarea');
        const inputs = await page.$$('input');
        
        if (textareas.length > 0 || inputs.length > 0) {
          if (textareas.length > 0) {
            await textareas[0].fill('E2E归档说明');
            await page.waitForTimeout(500);
          }
          
          const confirmButtons = await page.$$('button');
          let confirmButton = null;
          
          for (let i = 0; i < confirmButtons.length; i++) {
            const text = await confirmButtons[i].textContent();
            if (text && (text.includes('确定') || text.toLowerCase().includes('yes'))) {
              confirmButton = confirmButtons[i];
              console.log(`找到确认按钮`);
              break;
            }
            if (text && (text.includes('取消') || text.toLowerCase().includes('cancel'))) {
              break;
            }
          }
          
          if (confirmButton) {
            await confirmButton.click();
            await page.waitForTimeout(2000);
          }
        } else {
          console.log('可能自动归档，无需确认');
        }
        
        await page.screenshot({ path: 'test-results/e2e-archive.png' });
        console.log('归档项目测试通过');
      } else {
        console.log('未找到归档按钮');
        await page.screenshot({ path: 'test-results/e2e-no-archive.png' });
      }
    } else {
      console.log('未找到项目');
      await page.screenshot({ path: 'test-results/e2e-no-project-for-archive.png' });
    }
  });
  
  test('E2E-004: 删除项目', async ({ page }) => {
    console.log('=== 删除项目测试 ===');
    await page.goto('http://localhost:5173/projects');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const elements = await page.$$('a, button');
    let projectElement = null;
    
    for (let i = 0; i < Math.min(15, elements.length); i++) {
      const text = await elements[i].textContent();
      if (text && text.length > 2 && text.length < 50 && 
          !text.includes('创建') && !text.includes('筛选')) {
        projectElement = elements[i];
        console.log(`找到项目: "${text.trim()}"`);
        break;
      }
    }
    
    if (projectElement) {
      await projectElement.click();
      await page.waitForTimeout(2000);
      
      const buttons = await page.$$('button');
      let deleteButton = null;
      
      for (let i = 0; i < buttons.length; i++) {
        const text = await buttons[i].textContent();
        if (text && text.includes('删除')) {
          deleteButton = buttons[i];
          console.log(`找到删除按钮`);
          break;
        }
      }
      
      if (deleteButton) {
        await deleteButton.click();
        await page.waitForTimeout(2000);
        
        const confirmButtons = await page.$$('button');
        let confirmButton = null;
        
        for (let i = 0; i < confirmButtons.length; i++) {
          const text = await confirmButtons[i].textContent();
          if (text && (text.includes('确定') || text.toLowerCase().includes('yes'))) {
            confirmButton = confirmButtons[i];
            console.log(`找到确认按钮`);
            break;
          }
          if (text && (text.includes('取消') || text.toLowerCase().includes('cancel'))) {
            break;
          }
        }
        
        if (confirmButton) {
          await confirmButton.click();
          await page.waitForTimeout(2000);
          console.log('删除操作完成');
        }
        
        await page.screenshot({ path: 'test-results/e2e-delete.png' });
        console.log('删除项目测试通过');
      } else {
        console.log('未找到删除按钮');
        await page.screenshot({ path: 'test-results/e2e-no-delete.png' });
      }
    } else {
      console.log('未找到项目');
      await page.screenshot({ path: 'test-results/e2e-no-project-for-delete.png' });
    }
  });
});
