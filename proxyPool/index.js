const Crawler = require('./getProxy');
const RedisClient = require('./operateProxy');

const crawler = new Crawler();
const client = new RedisClient();

async function init() {
    await crawler.run();
    const all = await client.all();
    console.log('全部', all);
}
init();


