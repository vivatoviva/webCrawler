// 创建进程，作为子进程
const schedule = require('node-schedule');
const Koa = require('koa');
const KoaRouter = require('koa-router');
const Crawler = require('./getProxy');
const RedisClient = require('./operateProxy');
const TestCrawel = require('./detectionProxy');
// 能不能启动四个进程运行任务
const client = new RedisClient();
const app = new Koa();
const router = new KoaRouter();
let worker; // 连接的tcp请求接口

// 初始化操作
async function init() {
  console.log('爬虫初始化进行');
  const crawler = new Crawler();
  const test = new TestCrawel();
  schedule.scheduleJob('*/30 * * * *', async () => {
    console.log('30 分钟抓取一次');
    await crawler.run();
  });
  schedule.scheduleJob('*/2 * * * *', async () => {
    console.log('2 分钟一次');
    await test.run();
  });
}
init();

// 构建服务器
router.get('/', async (ctx) => {
  const proxy = await client.random();
  ctx.body = {
    code: '100001',
    data: proxy,
  };
});
router.get('/all', async (ctx) => {
  const allProxy = await client.all();
  ctx.body = {
    code: '10001',
    data: allProxy,
  };
});
app.use(router.routes());

// 进程监听
process.on('message', (message, tcp) => {
  if (message === 'server') {
    worker = tcp;
    worker.on('connection', (socket) => {
      console.log('监听请求');
      app.emit('connection', socket);
    });
  }
});

process.on('uncaughtException', (error) => {
  console.log(`爬虫进程报错：${process.pid}, ${error}`);
  worker.close(() => {
    process.exit(0);
  });
});
