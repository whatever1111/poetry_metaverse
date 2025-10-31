# TODO: 共笔API Dify异步获取机制重构

## 任务概述
**目标**: 将共笔API的Dify调用从简单的阻塞式请求重构为三阶段异步获取机制，解决504超时问题。

**优先级**: 🔴 高（影响用户体验和功能稳定性）

**预计工时**: 2-3小时（实现 + 测试）

**关联文件**:
- `lugarden_universal/application/server.js` - 共笔API实现
- `lugarden_universal/lu_the_poet/dify_output/lujiaming_output_v5.py` - 参考实现（Python）
- `lugarden_universal/lu_the_poet/dify_output/test_async_fixed.py` - 参考测试脚本

## 问题背景

### 当前问题
1. **504超时频繁发生**: Dify AI诗歌生成通常需要2-5分钟，当前120秒超时不足
2. **用户体验差**: 长时间等待后得到超时错误，正在生成的诗歌丢失
3. **简单增加超时不是解决方案**: 
   - 600秒超时仍可能不够
   - 浏览器/代理可能有自己的超时限制
   - 长时间阻塞占用服务器资源

### 当前实现（存在问题）
```javascript
// 阻塞式等待完整响应
const difyResponse = await fetch('https://api.dify.ai/v1/chat-messages', {
  method: 'POST',
  body: JSON.stringify({
    response_mode: 'blocking',
    // ...
  }),
  signal: controller.signal // 120秒后abort
});
```

## 解决方案：两阶段Fire-and-Track机制

### 核心思路
**参考**: `lujiaming_output_v5.py` 的 `send_chat_and_get_id` 函数（第857-940行）

这是一个**"Fire and Forget then Track"**（发射后追踪）模式：
1. 快速发送请求触发Dify后台处理（3秒超时足够）
2. 立即进入追踪模式，通过conversation查找和轮询获取结果
3. 关键：Dify即使客户端断开，后台仍会继续处理

### 两阶段流程（非三阶段）

#### 阶段1：快速触发请求（3秒超时）
```javascript
// 目的：触发Dify后台处理，而非等待完整响应
const controller = new AbortController();
setTimeout(() => controller.abort(), 3000); // 只需3秒

let requestSent = false;
try {
  await fetch('https://api.dify.ai/v1/chat-messages', {
    method: 'POST',
    body: JSON.stringify({
      response_mode: 'blocking',
      // ...
    }),
    signal: controller.signal
  });
  console.log('[/api/zhou/gongbi] ✅ 请求已发送');
  requestSent = true;
} catch (error) {
  // 超时/错误也算发送成功（Dify后台已开始处理）
  console.log('[/api/zhou/gongbi] ✅ 请求已发送（超时）');
  requestSent = true;
}

if (!requestSent) {
  return { error: '请求发送失败' };
}
// 立即进入阶段2
```

**关键**: 
- 不等待响应，只确保请求发出
- 3秒超时足够TCP握手和发送POST数据
- 超时不是错误，而是预期行为

#### 阶段2：查找conversation_id并轮询结果

**步骤2.1：查找conversation_id**（最多3次，首次等待5秒，后续递增）
```javascript
// 参考: lujiaming_output_v5.py 第893-940行
const queryKeywords = difyPrompt.substring(0, 20); // 前20字符作为匹配关键词
const maxRetries = 3;

for (let attempt = 1; attempt <= maxRetries; attempt++) {
  // 递增等待：5秒, 8秒, 11秒
  const waitTime = 5 + (attempt - 1) * 3;
  console.log(`[/api/zhou/gongbi] 🔍 第${attempt}次查询conversation_id，等待${waitTime}秒...`);
  await sleep(waitTime * 1000);
  
  const conversationsResponse = await fetch(
    'https://api.dify.ai/v1/conversations?user=gongbi&limit=20',
    { headers: { Authorization: `Bearer ${DIFY_API_KEY}` } }
  );
  
  const { data: conversations } = await conversationsResponse.json();
  
  // 通过name字段匹配（name是query的截断版本）
  for (const conv of conversations) {
    if (conv.name.includes(queryKeywords) || queryKeywords.includes(conv.name)) {
      conversationId = conv.id;
      console.log(`[/api/zhou/gongbi] ✅ 找到匹配的conversation: ${conversationId}`);
      break;
    }
  }
  
  if (conversationId) break;
}

if (!conversationId) {
  return { error: 'conversation_id查找失败' };
}
```

**匹配逻辑**: 
- Dify会将query的前N个字符作为conversation的name
- 通过关键词匹配找到对应的conversation
- conversations列表按创建时间降序排列，最新在前
- 等待时间递增，给Dify更多处理时间

**步骤2.2：轮询消息内容**（最多300秒，每10秒查询一次）
```javascript
// 参考: lujiaming_output_v5.py 第943-1008行

const maxWaitTime = 300; // 5分钟
const pollInterval = 10; // 10秒

for (let elapsed = 0; elapsed < maxWaitTime; elapsed += pollInterval) {
  const messagesResponse = await fetch(
    `https://api.dify.ai/v1/messages?conversation_id=${conversationId}&limit=1`,
    { headers: { Authorization: `Bearer ${DIFY_API_KEY}` } }
  );
  
  const messages = await messagesResponse.json();
  
  if (messages.data && messages.data[0]) {
    const message = messages.data[0];
    const answer = message.answer || '';
    
    if (answer.length > 0) {
      // ✅ 完成：answer有内容了
      return {
        answer: message.answer,
        conversation_id: conversationId,
        message_id: message.id,
        metadata: message.metadata
      };
    }
  }
  
  await sleep(pollInterval * 1000);
}
```

**完成判断**: `message.answer`字段长度 > 0

## 实现任务分解

### 任务B.1：提取辅助函数
- [ ] 创建 `findConversationByQuery` 函数
  - 输入: `query`
  - 输出: `conversationId` 或 `null`
  - 最多尝试3次，等待时间递增（5s, 8s, 11s）
  - 通过query前20字符匹配conversation.name
  
- [ ] 创建 `pollMessageContent` 函数
  - 输入: `conversationId`
  - 输出: 完整的Dify响应对象
  - 最多等待300秒，每10秒查询一次
  - 判断标准: `message.answer.length > 0`

### 任务B.2：重构主请求流程（两阶段）
- [ ] 修改 `/api/zhou/gongbi` 的Dify调用部分
  - [ ] 阶段1：快速触发请求（3秒超时）
    - 目的：触发Dify后台处理
    - 超时不报错（预期行为）
    - 立即进入阶段2
  
  - [ ] 阶段2.1：调用 `findConversationByQuery`
    - 找到 → 进入2.2
    - 未找到 → 返回错误
  
  - [ ] 阶段2.2：调用 `pollMessageContent`
    - 成功 → 返回结果
    - 超时 → 返回504错误

- [ ] 保持原有的答案解析逻辑不变
  - 标题、引文、正文的split逻辑
  - 返回格式结构

### 任务B.3：错误处理优化
- [ ] 区分不同的错误类型
  - `DIFY_REQUEST_FAILED`: 阶段1请求发送失败
  - `DIFY_CONVERSATION_NOT_FOUND`: 阶段2.1找不到conversation
  - `DIFY_POLL_TIMEOUT`: 阶段2.2轮询超时
  
- [ ] 优化错误提示
  - 对用户友好的中文提示
  - 包含建议操作（如"稍后重试"）

### 任务B.4：日志优化
- [ ] 添加详细的阶段日志
  ```javascript
  console.log('[/api/zhou/gongbi] 📤 阶段1：发送请求触发Dify处理');
  console.log('[/api/zhou/gongbi] ✅ 请求已发送');
  console.log('[/api/zhou/gongbi] 🔍 阶段2.1：查找conversation_id，第1/3次，等待5秒');
  console.log('[/api/zhou/gongbi] ✅ 找到匹配的conversation: xxx');
  console.log('[/api/zhou/gongbi] ⏱️  阶段2.2：轮询消息内容 [30s]');
  console.log('[/api/zhou/gongbi] ✅ 获取成功，answer长度: 500');
  ```

## 测试验证

### 单元测试（手动）
- [ ] **正常流程测试**
  - 输入任意prompt（如"写一首关于春天的诗"）
  - 预期流程：
    1. 3秒内完成请求发送
    2. 5-14秒内找到conversation_id
    3. 轮询直到获得结果
    4. 总时间2-5分钟，最终成功
  
- [ ] **高并发测试**
  - 多个用户同时提交（模拟真实场景）
  - 验证conversation匹配不会冲突

- [ ] **超时测试**
  - 模拟极端长时间生成（>5分钟）
  - 预期：返回友好的超时提示

### 回归测试
- [ ] 验证原有功能不受影响
  - 诗歌解析逻辑正常
  - 返回格式与前端兼容
  - 元数据（conversation_id, message_id）正确

### 性能测试
- [ ] 对比重构前后的表现
  - 重构前：阻塞120秒 → 504错误 → 诗歌丢失
  - 重构后：快速响应（10-20秒反馈追踪开始）→ 后台处理 → 最终获取 → 成功率接近100%

## 参考代码位置

### Python实现（参考）
1. **核心流程**: `lujiaming_output_v5.py` 第857-940行
   - `send_chat_and_get_id` 函数（发送+查找conversation）
   - **关键**：`timeout=3`（第880行）- 只等3秒
   - **关键**：超时也算成功（第886行）- Fire and Forget模式
   
2. **轮询消息**: `lujiaming_output_v5.py` 第943-1008行
   - `poll_until_complete_batch` 函数
   - 每10秒查询，最多300秒

3. **测试脚本**: `test_async_fixed.py`
   - 两阶段流程演示
   - 清晰的日志输出

### 当前Node.js实现
- **文件**: `lugarden_universal/application/server.js`
- **函数**: `/api/zhou/gongbi` 路由处理器（第240-495行）
- **需修改部分**: 第355-394行（Dify API调用）

## 注意事项

### 关键要点
1. **核心理念**: Fire and Forget then Track（发射后追踪），不是"先快后慢"
2. **超时不是错误**: 3秒超时是预期行为，只要请求发出即可
3. **不破坏现有功能**: 只重构Dify调用部分，保持答案解析逻辑不变
4. **向后兼容**: 前端无需任何修改
5. **日志完整**: 每个步骤都要有清晰的日志，便于调试

### 可能的陷阱
1. **匹配精度**: query关键词长度（20字符）可能需要调整
2. **时间窗口**: conversations列表可能不包含刚创建的（需等待5-14秒）
3. **并发请求**: 多用户同时使用时，name匹配可能冲突
   - 解决方案：使用唯一的user标识（如`gongbi_${timestamp}`）
   - 匹配时结合创建时间窗口（最近1分钟内）

## 完成标准

### 功能标准
- [ ] 两阶段机制完整实现
- [ ] 快速触发请求（3秒）正常工作
- [ ] conversation查找逻辑准确（递增等待）
- [ ] 消息轮询稳定可靠
- [ ] 错误处理全面

### 质量标准
- [ ] 代码通过ESLint检查
- [ ] 日志清晰易读
- [ ] 错误信息友好
- [ ] 注释完整准确

### 测试标准
- [ ] 正常流程测试通过
- [ ] 高并发测试通过
- [ ] 超时处理测试通过
- [ ] 回归测试通过

## 当前状态
🔄 待开始

---

## 实施经验记录

### 遇到的问题

### 解决方案

### 优化建议

---

*创建时间: 2025-10-31*
*预计完成: 2025-10-31*
*参考: 陆家明AI诗人创作工具V5的生产级异步获取机制*

