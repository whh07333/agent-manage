```typescript
/**
 * 生成指定长度的随机字符串
 * @param length - 生成的字符串长度
 * @param charset - 自定义字符集，默认为大小写字母和数字
 * @returns 生成的随机字符串
 * @throws {Error} 当length小于等于0时抛出错误
 * @throws {Error} 当charset为空时抛出错误
 */
export function generateRandomString(
  length: number,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  if (length <= 0) {
    throw new Error('Length must be greater than 0');
  }
  if (!charset || charset.length === 0) {
    throw new Error('Charset cannot be empty');
  }

  let result = '';
  const charsetLength = charset.length;
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charsetLength);
    result += charset[randomIndex];
  }
  
  return result;
}
```
