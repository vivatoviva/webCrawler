const request = require('request');
const cheerio = require('cheerio');
const RedisClient = require('./operateProxy');
const POOL_UPPER_THRESHOLD = 10000;

function requestUrl (options){
    return new Promise(function (resolve,reject){
        request(options, function (err, res, body) {
            if (err) {
                return reject(err);
            }else {
                $ = cheerio.load(body);
                return resolve($);
            }
        })
    }).catch(function(err){
        console.log('ERROR', err)
    })
}

// 获取模块
class Crawler {

    async getProxies() {
        const crawl_daili66 = await this.crawl_daili66();
        return crawl_daili66;
    }

    async crawl_daili66() {
        // 爬下66ip的代理
        const urls = [];
        const proxies = [];
        for(let i = 1; i < 2; i++) {
            urls.push(`http://www.66ip.cn/${i}.html`)
        }
        for(let url of urls) {
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
    is_over_threshold() {
        if(this.redis.count() >= POOL_UPPER_THRESHOLD) {
            return true
        }
        return false;
    }

    async run() {
        console.log('获取模块开始执行！');
        if(!this.is_over_threshold()) {
            const proxies = await this.crawler.getProxies();
            const addPromise = [];
            for(let item of proxies) {
                addPromise.push(this.redis.add(item));
            }
            return Promise.all(addPromise).then(() => this.redis.end())
        }
    }
}
module.exports = Getter;
