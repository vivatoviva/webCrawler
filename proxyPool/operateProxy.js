// 存储模块
const redis = require('redis');
const INIT_SCORE = 20;
const REDIS_KEY ='proxies';
const MAX_SCORE = 100;
const MIN_SCORE = 0;
const REDIS_CONFIG ={
    host: '',
    port: '',
}
class RedisClient {
    constructor(props) {
        const client = redis.createClient();
        client.on('error', () => {
            console.log('数据库连接失败');
        })
        this.client = client;
        this.add = this.add.bind(this);
        this.random = this.random.bind(this);
        this.choice = this.choice.bind(this);
        this.decrease = this.decrease.bind(this);
        this.exists = this.exists.bind(this);
        this.max = this.max.bind(this);
        this.count = this.count.bind(this);
        this.all = this.all.bind(this);
    }

    add(proxy, score = INIT_SCORE) {
        if(this.client.zscore(REDIS_KEY, proxy)) {
            this.client.zadd(REDIS_KEY, score, proxy);
        }
    }

    random() {
        let result = this.client.zrangebyscore(REDIS_KEY, MAX_SCORE, MIN_SCORE);
        if(result.length > 0) {
            return this.choice(result);
        }
        result = this.client.zrevrange(REDIS_KEY, 0, 100);
        if(result.length > 0) {
            return this.choice(result);
        }
        throw new Error('不存在代理')
    }

    choice(data) {
        const length = data.length;
        if(!length) return;
        const randomValue = Math.floor(Math.random() * length / 4);
        return data[randomValue];
    }

    decrease(proxy) {
        // 代理减一
        const score = this.client.zscore(REDIS_KEY, proxy);
        if(score && score > MIN_SCORE) {
            return this.client.zincrby(REDIS_KEY, proxy, -1);
        } else {
            return this.client.zrem(REDIS_KEY, proxy)
        }
    }

    exists(proxy) {
        return this.client.zrem(REDIS_KEY, proxy) === null;
    }

    max(proxy) {
        return this.client.zadd(REDIS_KEY, MAX_SCORE, proxy)
    }

    count() {
        return this.client.zcard(REDIS_KEY);
    }

    all() {
        return this.client.zrangebyscore(REDIS_KEY, MIN_SCORE, MAX_SCORE);
    }

}
module.exports = RedisClient;
