var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
//var phantom = require('phantom');
var log = console.log;
var schedule = require('node-schedule');

//静态页面// var page = phantom.create();

//动态js生成的页面抓取（后面再用）
//如需使用，需要本地安装phantom，具体百度吧
// (async function() {
//     const instance = await phantom.create();
//     const page = await instance.createPage();
//     await page.on('onResourceRequested', function(requestData) {
//         console.info('Requesting', requestData.url);
//     });
//
//     const status = await page.open('https://bing.ioliu.cn/');
//     const content = await page.property('content');
//
//     await instance.exit();
// })();

let imgUrl=[];//存放抓取到所有图片的url


function init() {
    fs.exists('./images', function(status){
        if(!status){
            fs.mkdir('./images',function(){
                "use strict";
                log('获取更多图片开始');
                moreImg();
            });
        }
        task();
    })
}
init();
//定时轮询任务
function task(){

    schedule.scheduleJob({hour: 23, minute: 40}, function(){
        requestDay();//爬取当天任务存放到本地中
    });
}
//更多图片
async function moreImg() {
    var  options = {
        method: 'get',
        url:'https://bing.ioliu.cn/'
    };
    for(var i = 1;i<=54;i++){
        options.url="https://bing.ioliu.cn/?p="+i;
        await requestUrl(options);
        log('请求一次'+i);
    }
    log(imgUrl);
    var IMG = [];
    for(var i of imgUrl){
       IMG.push(getImg(i));
    }
    log(IMG.length);
    Promise.all(IMG).then(()=>{
        log('爬取完毕');
    })
}



//爬取每天的图片
async function requestDay(){
    "use strict";
    let title = new Date();
    title=title.getFullYear()+''+title.getMonth()+1+''+title.getDate();
    console.log(title)
    getImg({url:'https://api.dujin.org/bing/1920.php',title})
}


function requestUrl (options){
    return new Promise(function (resolve,reject){
        request(options, function (err, res, body) {
            if (err) {
                reject(err);
            }else {
                $ = cheerio.load(body);
                var mark = $('.progressive__img');
                var desc = $('.description h3')
                for(let [key,value] of Object.entries(mark)){
                    if(parseInt(key)<=11){
                        var title = $(desc[key]).text();
                        url = $(value).attr('src');
                        url = url.replace("320x240","1920x1080");
                        title=title.substr(0,title.indexOf('('));
                        imgUrl.push({url,title});
                    }
                }
                reject();
            }
        });
    }).catch(function(err){
    })
}


function getImg({url,title}){
    return new Promise((resolve,reject)=>{
        request({url,encoding:'binary'},(err,response,body)=>{
            if(!err&&response.statusCode==200){
                fs.writeFile('./images/'+title+".jpg",body,'binary',function(err){
                    "use strict";
                    if(err){
                        log(err);
                    }else{
                        log('存储完毕！')
                    }
                    resolve();
                })
            }
        })
    })
}
