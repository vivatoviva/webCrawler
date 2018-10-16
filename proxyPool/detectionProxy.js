const request = require('request');
const cheerio = require('cheerio');
const RedisClient = require('./operateProxy');

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


// 检测模块
class Test {
    constructor(props) {
        super(props);
        this.redis = new RedisClient();
    }

    async check(proxy) {
        // 抓取百度，判断是不是有用的代理
        const option = {
            url: 'http://www.baidu.com',
            proxy,
            timeout: 5000,
        }
        const $ = await requestUrl(option);
        return $('title').text() === '百度一下，你就知道'
    }

    async run() {
        console.log('测试模块开始运行！');
        const proxies = this.redis.all();
        const testPromise = [];
        // 测试函数
        const TESTFUNCTION = proxy => new Promise((resolve, reject) => {
            this.check(proxy).then(isTrue => {
                if(isTrue) {
                    this.redis.max(proxy);
                } else {
                    this.redis.decrease(proxy);
                }
            })
        })
        for(let proxy of proxies) {
            testPromise.push(TESTFUNCTION(proxy));
        }
        return await Promise.all(testPromise);
    }
}

module.exports = Test;
