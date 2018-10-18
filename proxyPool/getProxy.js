const request = require('request');
const cheerio = require('cheerio');
const RedisClient = require('./operateProxy');

const POOL_UPPER_THRESHOLD = 10000;

function requestUrl(options) {
  return new Promise((resolve, reject) => {
    request(options, (err, res, body) => {
      if (err) {
        return reject(err);
      }
      const $ = cheerio.load(body);
      return resolve($);
    });
  });
}

// 获取模块
class Crawler {
  getProxies() {
    return this.crawlDaili66();
  }

  async crawlDaili66() {
    this.a = 10;
    const urls = [];
    const proxies = [];
    for (let i = 1; i < 2; i += 1) {
      urls.push(`http://www.66ip.cn/${i}.html`);
    }
    for (const url of urls) {
      const $ = await requestUrl(url);
      const trs = $('#main table tr');
      for(let [key, tr] of Object.entries(trs)) {
          const tds = tr.children;
          if(!tds || key == 0 || key == '_root' || key == 'prevObject') continue;
          const ip = $(tds[0]).text();
          const port = $(tds[1]).text();
          proxies.push(`${ip}:${port}`);
      }
    }
    return proxies;
  }
}

class Getter {
  constructor() {
    this.redis = new RedisClient();
    this.crawler = new Crawler();
  }

  isOverThreshold() {
    if (this.redis.count() >= POOL_UPPER_THRESHOLD) {
      return true;
    }
    return false;
  }

  async run() {
    console.log('获取模块开始执行！');
    if (!this.isOverThreshold()) {
      const proxies = await this.crawler.getProxies();
      const addPromise = [];
      proxies.forEach(item => {
        addPromise.push(this.redis.add(item));
      });
      return Promise.all(addPromise);
      // return Promise.all(addPromise).then(() => this.redis.end());
    }
    return false;
  }
}
module.exports = Getter;
