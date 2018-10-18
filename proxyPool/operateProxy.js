const redis = require('redis');
const bluebird = require('bluebird');
const INIT_SCORE = 20;
const REDIS_KEY = 'proxies';
const MAX_SCORE = 100;
const MIN_SCORE = 0;
const REDIS_CONFIG = {
  port: 6379,
  host: '120.78.71.60',
  password: 'genluo_123',
  db: 0,
};
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

class RedisClient {
  constructor() {
    const client = redis.createClient(REDIS_CONFIG);
    client.on('error', (err) => {
      console.log('数据库连接失败', err);
    });
    this.client = client;
    this.add = this.add.bind(this);
    this.random = this.random.bind(this);
    this.choice = this.choice.bind(this);
    this.decrease = this.decrease.bind(this);
    this.exists = this.exists.bind(this);
    this.max = this.max.bind(this);
    this.count = this.count.bind(this);
    this.all = this.all.bind(this);
    this.end = this.end.bind(this);
  }

  add(proxy, score = INIT_SCORE) {
    if (this.client.zscoreAsync(REDIS_KEY, proxy)) {
      this.client.zaddAsync(REDIS_KEY, score, proxy);
    }
  }

  async random() {
    let result = await this.client.zrangebyscoreAsync(REDIS_KEY, MAX_SCORE, MIN_SCORE);
    if (result.length > 0) {
      return this.choice(result);
    }
    result = await this.client.zrevrangeAsync(REDIS_KEY, 0, 100);
    if (result.length > 0) {
      return this.choice(result);
    }
    throw new Error('不存在代理');
  }

  choice(data) {
    const length = data.length;
    if(!length) return;
    const randomValue = Math.floor(Math.random() * length / 4);
    return data[randomValue];
  }

  async decrease(proxy) {
      // 代理减一
      const score = await this.client.zscoreAsync(REDIS_KEY, proxy);
      if(score && score > MIN_SCORE) {
          console.log('当前代理', proxy, '测试失败,值减少1');
          return this.client.zincrbyAsync(REDIS_KEY, -1, proxy).catch(error => {
              console.log(error);
          });
      } else {
          console.log('当前代理', proxy, '测试失败，进行删除')
          return this.client.zremAsync(REDIS_KEY, proxy)
      }
  }

  exists(proxy) {
      return this.client.zremAsync(REDIS_KEY, proxy) === null;
  }

  max(proxy) {
      console.log('当前代理', proxy, '测试通过，值为100')
      return this.client.zaddAsync(REDIS_KEY, MAX_SCORE, proxy).catch(error => {
          console.log(error);
      });
  }

  count() {
      return this.client.zcardAsync(REDIS_KEY);
  }

  all() {
      return this.client.zrangebyscoreAsync(REDIS_KEY, MIN_SCORE, MAX_SCORE);
  }

  end() {
      console.log('over')
      return this.client.quitAsync();
  }
}
module.exports = RedisClient;
