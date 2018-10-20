const { fork }  = require('child_process');
const cpus = require('os').cpus();
const server = require('net').createServer();
const workers = [];
const limit = 10;// 重启次数
const during = 60000; // 时间单位
const restart = [];
const isTooFrequently = () => {
  const time = new Date();
  const length = restart.push(time);
  if(length > limit) {
    restart = restart.slice(limit * -1);
    return restart.length >= limit && restart[restart.length - 1] - restart[0] < during;
  }
}

const createWoker = () => {
  if(isTooFrequently()) {
    process.emit('giveup', length, during);
    return;
  }
  const worker = fork(__dirname + './worker.js');
  worker.on('exit', () => {
    console.log('进程退出！');
    delete workers[workers.pid];
  })
  worker.on('message', message => {
    if(message.act === 'suicide') {
      createWoker();
    }
  })
  worker.send('server', server);
  workers[worker.pid] = worker;
  console.log('Create worker.pid:' + worker.pid);
}

// 根据CPU创建相应的工作进程
for(const i = 0; i < cpus; i++) {
  createWoker();
}

// master进程退出的时候，杀掉所有子进程
process.on('exit', () => {
  for(var worker of workers) {
    worker.kill();
  }
})

server.listen(3000);
