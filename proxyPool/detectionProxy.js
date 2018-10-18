const request = require('request');
const cheerio = require('cheerio');
const RedisClient = require('./operateProxy');

function requestUrl(options) {
    return new Promise(function (resolve,reject){
        request(options, function (err, res, body) {
            if (err) {
                return reject(err);
            }else {
                const $ = cheerio.load(body);
                return resolve($);
            }
        });
    });
}

// 检测模块
class Test {
    constructor() {
        this.redis = new RedisClient();
    }
    async check(proxy) {
        // 抓取百度，判断是不是有用的代理
        const option = {
            url: 'http://www.baidu.com',
            proxy: 'http://' + proxy,
            timeout: 5000,
        };
        try {
            const $ = await requestUrl(option);
            if(!$) return false;
            return $('title').text() === '百度一下，你就知道';
        } catch(err) {
            return false;
        }
    }

    async run() {
        console.log('测试模块开始运行！');
        const proxies = await this.redis.all();
        const testPromise = [];
        const TESTFUNCTION = proxy =>
            this.check(proxy)
                .then(isTrue => {
                    if(isTrue) {
                        return this.redis.max(proxy);
                    } else {
                        // 检查失败，设置scroe减一
                        return this.redis.decrease(proxy);
                    }
                });
        for(let proxy of proxies) {
            testPromise.push(TESTFUNCTION(proxy));
        }
        return Promise.all(testPromise).then(() => {
            // this.redis.end();
        });
    }
}

module.exports = Test;
