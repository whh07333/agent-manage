/**
 * 计算两个日期之间的天数差
 *
 * 该函数计算两个日期之间的整数天数差，基于UTC日期计算，忽略时间部分。
 * 返回值为第一个日期减去第二个日期的天数差（正数表示date1在date2之后，负数表示date1在date2之前）。
 *
 * @param date1 - 第一个日期，可以是Date对象、时间戳（毫秒）或日期字符串
 * @param date2 - 第二个日期，可以是Date对象、时间戳（毫秒）或日期字符串
 * @returns 两个日期之间的整数天数差（date1 - date2）
 *
 * @example
 * ```typescript
 * // 计算两个Date对象之间的天数差
 * const diff1 = dateDiff(new Date('2023-01-15'), new Date('2023-01-10')); // 5
 *
 * // 计算时间戳之间的天数差
 * const diff2 = dateDiff(1673740800000, 1673308800000); // 5 (2023-01-15 - 2023-01-10)
 *
 * // 计算日期字符串之间的天数差
 * const diff3 = dateDiff('2023-01-15', '2023-01-20'); // -5
 *
 * // 混合类型参数
 * const diff4 = dateDiff(new Date('2023-01-15'), '2023-01-10'); // 5
 * ```
 */
export function dateDiff(
  date1: Date | number | string,
  date2: Date | number | string
): number {
  // 将输入转换为Date对象
  const d1 = normalizeDate(date1);
  const d2 = normalizeDate(date2);

  // 计算UTC日期的午夜时间（忽略时间部分）
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());

  // 计算毫秒差并转换为天数
  const msPerDay = 24 * 60 * 60 * 1000; // 86400000
  const diffInMs = utc1 - utc2;

  // 返回整数天数差
  return Math.floor(diffInMs / msPerDay);
}

/**
 * 将各种日期格式标准化为Date对象
 *
 * @param date - 日期值，可以是Date对象、时间戳（毫秒）或日期字符串
 * @returns 标准化后的Date对象
 * @throws 如果无法解析为有效日期则抛出错误
 */
function normalizeDate(date: Date | number | string): Date {
  if (date instanceof Date) {
    return date;
  }

  if (typeof date === 'number') {
    return new Date(date);
  }

  if (typeof date === 'string') {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      throw new Error(`无效的日期字符串: ${date}`);
    }
    return parsed;
  }

  throw new Error(`不支持的日期类型: ${typeof date}`);
}

// 导出normalizeDate函数以供测试或高级使用
export { normalizeDate };