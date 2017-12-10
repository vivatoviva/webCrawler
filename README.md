## node制作的小爬虫

----
* 使用phantom抓取动态页面
* 使用pm2作为任务管理
* 使用schedule作为定时服务

> cnpm install 安装依赖

> pm2 start app.js 开启服务

> pm2 stop app.js 停止服务

> pm2更多命令请参考http://www.jianshu.com/p/fdc12d82b661


#### 说明：
启动项目会创建images文件夹，并且首先向里面放入12*54张以前的bing图片
然后开启定时服务，每天在晚上23：40抓取今天的图片
