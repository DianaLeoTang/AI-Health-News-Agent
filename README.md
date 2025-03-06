# AI-Health-News-Agent
AI-Health-News-Agent 是一个基于 Node.js 的 AI 代理程序，每日获取公共卫生领域的最新热点新闻，生成 Markdown/HTML 报告，并通过邮件发送。

## 项目目录结构
ai-health-news-agent/
├── apps/
│   ├── back-end/         # Backend application
│   ├── front-end/        # Frontend application
│   └── front-end-e2e/    # End-to-end tests for frontend
├── dist/                 # Build output directory
├── node_modules/         # Dependencies
└── ...                   # Configuration files

## 📌 功能
- 爬取 WHO、CDC、Nature 等公共卫生新闻
- 生成 Markdown 和 HTML 报告
- 通过 API 提供新闻数据
- 每天 8:00 自动执行并发送邮件

## 🚀 安装与运行

### 1️⃣ 克隆项目
```sh
git clone https://github.com/your-repo/AI-Health-News-Agent.git
cd AI-Health-News-Agent

# Using npm
npm install

# Using yarn
yarn install
```

### 2运行后端项目
```sh
# Using npm
npm run start:back-end

# Using yarn
yarn start:back-end

# Using Nx directly
npx nx serve back-end
```
### 3运行前端项目
```sh
# Using npm
npm run start:front-end

# Using yarn
yarn start:front-end

# Using Nx directly
npx nx serve front-end
```
### 4运行全部项目
```sh
# Using npm
npm run start:all

# Using yarn
yarn start:all

# Using Nx directly
npx nx run-many --target=serve --projects=back-end,front-end --parallel
```
### 测试项目
```sh
# Using npm
npm run test:back-end

# Using yarn
yarn test:back-end

# Using Nx directly
npx nx test back-end

# Using npm
npm run test:front-end

# Using yarn
yarn test:front-end

# Using Nx directly
npx nx test front-end

# Using npm
npm run e2e

# Using yarn
yarn e2e

# Using Nx directly
npx nx e2e front-end-e2e

```
### 打包项目
```sh
# Using npm
npm run build:back-end

# Using yarn
yarn build:back-end

# Using Nx directly
npx nx build back-end

# Using npm
npm run build:front-end

# Using yarn
yarn build:front-end

# Using Nx directly
npx nx build front-end

# Using npm
npm run build:all

# Using yarn
yarn build:all

# Using Nx directly
npx nx run-many --target=build --projects=back-end,front-end --parallel
```
## 可用脚本
```sh
start:back-end       - Starts the backend application in development mode
start:front-end      - Starts the frontend application in development mode
start:all            - Starts both backend and frontend applications
test:back-end        - Runs tests for the backend application
test:front-end       - Runs tests for the frontend application
test:all             - Runs tests for all applications
lint:back-end        - Lints the backend application code
lint:front-end       - Lints the frontend application code
lint:all             - Lints all applications
build:back-end       - Builds the backend application for production
build:front-end      - Builds the frontend application for production
build:all            - Builds all applications for production
e2e                  - Runs end-to-end tests
```

## 清理缓存
npx nx reset
