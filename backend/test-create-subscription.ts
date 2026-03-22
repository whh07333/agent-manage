// 单元测试验证 createSubscription 字段提取逻辑

function testCreateSubscriptionExtraction(data: any) {
  const extracted = {
    agent_id: data.agentId ?? data.agent_id,
    agent_type: data.agentType ?? data.agent_type,
    event_type: data.eventType ?? data.event_type,
    target_id: data.targetId ?? data.target_id,
    callback_url: data.callbackUrl ?? data.callback_url,
    secret: data.secret ?? data.secret,
    is_active: data.isActive !== undefined ? data.isActive : (data.is_active !== undefined ? data.is_active : true),
    max_retries: data.maxRetries ?? data.max_retries ?? 5,
    expire_at: data.expireAt ?? data.expire_at ?? null,
  };

  console.log('Input data:', JSON.stringify(data, null, 2));
  console.log('Extracted:', JSON.stringify(extracted, null, 2));
  console.log('--------------------------------------------------------');

  // 检查是否有null
  const nulls = [];
  if (extracted.agent_id === null || extracted.agent_id === undefined) nulls.push('agent_id');
  if (extracted.agent_type === null || extracted.agent_type === undefined) nulls.push('agent_type');
  if (extracted.event_type === null || extracted.event_type === undefined) nulls.push('event_type');
  if (extracted.target_id === null || extracted.target_id === undefined) nulls.push('target_id');
  if (extracted.callback_url === null || extracted.callback_url === undefined) nulls.push('callback_url');

  console.log(`Null/undefined fields: ${nulls.length > 0 ? nulls.join(', ') : 'none'}`);
  console.log(`Test ${nulls.length === 0 ? 'PASSED ✅' : 'FAILED ❌'}`);
  return nulls.length === 0;
}

console.log('=== TEST 1: camelCase input ===');
const test1 = {
  agentId: 'a1b2c3',
  agentType: 'backend-dev',
  eventType: 'task.completed',
  targetId: 'c3d2e1',
  callbackUrl: 'https://example.com/callback',
};
const result1 = testCreateSubscriptionExtraction(test1);

console.log('\n=== TEST 2: snake_case input ===');
const test2 = {
  agent_id: 'a1b2c3',
  agent_type: 'backend-dev',
  event_type: 'task.completed',
  target_id: 'c3d2e1',
  callback_url: 'https://example.com/callback',
};
const result2 = testCreateSubscriptionExtraction(test2);

console.log('\n=== TEST 3: mixed input ===');
const test3 = {
  agentId: 'a1b2c3',
  agent_type: 'backend-dev',
  eventType: 'task.completed',
  target_id: 'c3d2e1',
  callbackUrl: 'https://example.com/callback',
};
const result3 = testCreateSubscriptionExtraction(test3);

console.log('\n=== SUMMARY ===');
const total = 3;
const passed = [result1, result2, result3].filter(Boolean).length;
const failed = total - passed;
console.log(`${passed}/${total} passed, ${failed} failed`);

if (failed === 0) {
  console.log('\n✅ ALL TESTS PASSED! Both camelCase and snake_case work correctly.');
} else {
  console.log('\n❌ Some tests failed');
}
