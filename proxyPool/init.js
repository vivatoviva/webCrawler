const schedule = require('node-schedule');
const Koa = require('koa');
const koaRouter = require('koa-router');
const Crawler = require('./getProxy');
const RedisClient = require('./operateProxy');
const TestCrawel = require('./detectionProxy');
// 能不能启动四个进程运行任务

async function init() {
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

const client = new RedisClient();
const app = new Koa();
const router = new koaRouter();

router.get('/', async (ctx, next) => {
  const proxy = await client.random();
  ctx.body = {
    code: '100001',
    data: proxy,
  };
});
router.get('/all', async (ctx, next) => {
  const allProxy = await client.all();
  ctx.body = {
    code: '10001',
    data: allProxy,
  };
});
app.use(router.routes());
app.listen(3000);
