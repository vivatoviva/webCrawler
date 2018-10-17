// 调度进行处理
const Crawler = require('./getProxy');
const RedisClient = require('./operateProxy');
const TestCrawel = require('./detectionProxy');
// const schedule = require('node-schedule');

const crawler = new Crawler();
const client = new RedisClient();
const test = new TestCrawel();


// async function init() {
//     // await crawler.run();
//     // await test.run();
//     const all = await client.all();
//     console.log(all);
  
// }
// init();

setTimeout(()=> {  client.end();}, 1000)