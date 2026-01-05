# RAG 知识库系统

一个基于 RAG (Retrieval-Augmented Generation) 技术的智能问答系统，使用向量检索和 AI 生成相结合的方式，提供基于知识库的智能问答服务。

## ✨ 功能特性

- 📚 **知识库管理**：支持添加和管理知识文档，自动生成向量嵌入
- 🔍 **向量检索**：基于 PostgreSQL + pgvector 实现高效的向量相似度搜索
- 💬 **智能问答**：使用 Vercel AI SDK 实现流式响应的智能对话
- 🎨 **现代化 UI**：响应式设计，支持深色模式
- ⚡ **实时响应**：流式输出，提供更好的用户体验
- 📊 **来源追踪**：显示答案的来源文档和相似度分数

## 🛠️ 技术栈

### 前端
- **Next.js 16** - React 框架
- **React 19** - UI 库
- **Tailwind CSS 4** - 样式框架
- **Vercel AI SDK** - AI 对话管理

### 后端
- **Hono** - 轻量级 Web 框架
- **Prisma** - ORM 数据库工具
- **PostgreSQL** - 关系型数据库
- **pgvector** - PostgreSQL 向量扩展

### AI 服务
- **OpenRouter** - AI 模型服务提供商
  - 文本嵌入：`openai/text-embedding-3-small`
  - 语言模型：`openai/gpt-4o-mini`

### 开发工具
- **TypeScript** - 类型安全
- **Biome** - 代码格式化
- **Zod** - 数据验证

## 📁 项目结构

```
rag-example/
├── app/                    # Next.js App Router
│   ├── add/               # 添加知识页面
│   ├── chat/              # 智能问答页面
│   ├── api/               # API 路由
│   │   ├── chat/          # AI SDK 聊天 API
│   │   └── [[...route]]/  # Hono 路由代理
│   └── page.tsx           # 首页
├── server/                # 后端服务
│   ├── routers/           # 路由定义
│   │   ├── chat/          # 聊天路由（传统 API）
│   │   └── knowledge-chunk/ # 知识块路由
│   ├── middlewares/      # 中间件
│   └── lib/               # 工具函数
├── prisma/                # 数据库相关
│   ├── schema.prisma      # 数据库模型
│   └── generated/         # Prisma 生成的文件
└── lib/                   # 共享工具
```

## 🚀 快速开始

### 环境要求

- Node.js 20+
- PostgreSQL 14+ (需要安装 pgvector 扩展)
- pnpm (推荐) 或 npm/yarn

### 安装步骤

1. **克隆项目**

```bash
git clone <repository-url>
cd rag-example
```

2. **安装依赖**

```bash
pnpm install
```

3. **配置环境变量**

创建 `.env` 文件：

```env
# 数据库连接
DATABASE_URL="postgresql://user:password@localhost:5432/rag_db?schema=public"

# OpenRouter API Key
OPENROUTER_API_KEY="your-openrouter-api-key"
```

4. **设置数据库**

确保 PostgreSQL 已安装并启用了 pgvector 扩展：

```sql
-- 连接到数据库后执行
CREATE EXTENSION IF NOT EXISTS vector;
```

5. **初始化数据库**

```bash
# 生成 Prisma Client
pnpm db:generate

# 推送数据库架构
pnpm db:push
```

或者使用组合命令：

```bash
pnpm prisma
```

6. **启动开发服务器**

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📖 使用指南

### 添加知识

1. 访问 `/add` 页面或点击导航栏的"添加知识"
2. 在文本框中输入知识内容
3. （可选）添加元数据（JSON 格式），例如：
   ```json
   {
     "source": "产品文档",
     "author": "张三",
     "category": "技术文档"
   }
   ```
4. 点击"添加知识"按钮
5. 系统会自动生成向量嵌入并存储到数据库

### 智能问答

1. 访问 `/chat` 页面或点击导航栏的"智能问答"
2. 在输入框中输入您的问题
3. 系统会：
   - 生成问题的向量嵌入
   - 在知识库中搜索最相似的内容
   - 使用检索到的上下文生成回答
4. 可以展开查看答案的来源文档和相似度

## 🔌 API 文档

### 添加知识块

**POST** `/api/knowledge-chunk`

请求体：
```json
{
  "text": "知识内容",
  "metadata": {
    "source": "文档名称",
    "author": "作者"
  }
}
```

响应：
```json
{
  "success": true,
  "message": "Data stored successfully",
  "embedding": [0.1, 0.2, 0.3, ...]
}
```

### 智能问答（传统 API）

**POST** `/api/chat`

请求体：
```json
{
  "question": "你的问题",
  "topK": 3
}
```

响应：
```json
{
  "answer": "AI 生成的回答",
  "context": [
    {
      "id": "1",
      "content": "相关文档内容",
      "similarity": 0.95,
      "metadata": {...}
    }
  ]
}
```

### 智能问答（AI SDK）

**POST** `/api/chat` (用于 Vercel AI SDK)

请求体：
```json
{
  "messages": [
    {
      "role": "user",
      "content": "你的问题"
    }
  ]
}
```

响应：流式响应，使用 Vercel AI SDK 的 `useChat` hook 处理。

## 🗄️ 数据库模型

### KnowledgeChunk

```prisma
model KnowledgeChunk {
  id        BigInt    @id @default(autoincrement())
  content   String    // 知识内容
  embedding Unsupported("vector")  // 向量嵌入（pgvector）
  metadata  Json?     // 元数据（JSON）
  createdAt DateTime  @default(now())
  
  @@map("knowledge_chunks")
}
```

## 🔧 开发说明

### 数据库操作

由于 Prisma 不支持直接操作 `vector` 类型，需要使用原始 SQL：

```typescript
// 插入向量数据
await db.$executeRawUnsafe(
  `INSERT INTO knowledge_chunks (content, embedding, metadata, "createdAt")
   VALUES ($1, $2::vector, $3::jsonb, NOW())`,
  text,
  vectorString, // 格式: [0.1,0.2,0.3]
  metadata ? JSON.stringify(metadata) : null
);

// 向量相似度搜索
const results = await db.$queryRawUnsafe(
  `SELECT 
     id,
     content,
     1 - (embedding <=> $1::vector) as similarity
   FROM knowledge_chunks
   ORDER BY embedding <=> $1::vector
   LIMIT 3`,
  vectorString
);
```

### 向量相似度

- `<=>` 操作符：余弦距离（值越小越相似）
- `1 - (embedding <=> $1::vector)`：转换为相似度（值越大越相似）

### 代码格式化

项目使用 Biome 进行代码格式化：

```bash
# 检查格式
pnpm biome check .

# 自动修复
pnpm biome check --write .
```

## 📝 环境变量说明

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 数据库连接字符串 | ✅ |
| `OPENROUTER_API_KEY` | OpenRouter API 密钥 | ✅ |

## 🚢 部署

### Vercel 部署

1. 将项目推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 确保 PostgreSQL 数据库可访问（可使用 Vercel Postgres 或其他服务）

### 数据库迁移

生产环境部署前，确保：

1. PostgreSQL 已安装 pgvector 扩展
2. 运行数据库迁移：
   ```bash
   pnpm prisma migrate deploy
   ```

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📚 相关资源

- [Next.js 文档](https://nextjs.org/docs)
- [Hono 文档](https://hono.dev)
- [Prisma 文档](https://www.prisma.io/docs)
- [pgvector 文档](https://github.com/pgvector/pgvector)
- [Vercel AI SDK 文档](https://sdk.vercel.ai/docs)
- [OpenRouter 文档](https://openrouter.ai/docs)
