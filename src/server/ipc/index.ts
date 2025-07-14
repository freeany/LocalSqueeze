/**
 * IPC处理程序索引文件
 */

import { initCompressionHandlers } from './compression-handler';
import { initStatsHandlers } from './stats-handler';
import { initConfigHandlers } from './config-handler';

/**
 * 初始化所有IPC处理程序
 */
export function initAllHandlers() {
  initCompressionHandlers();
  initStatsHandlers();
  initConfigHandlers();
}
