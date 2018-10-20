// 作为父进程
const { fork } = require('child_process');
const net = require('net');
const cpus = require('os').cpus();

const workers = [];
const server = net.createServer();
const limit = 10;
const during = 60000;
let restart = [];
// 判断是不是多次重启
const isTooFrequently = () => {
  const time = new Date();
  const length = restart.push(time);
  if (length > limit) {
    restart = restart.slice(limit * -1);
  }
  return restart.length >= limit && restart[restart.length - 1] - restart[0] < during;
};
// 创建进程，多进程分发
const createWorker = () => {
  if (isTooFrequently()) {
    process.emit('giveup');
    return;
  }
  const worker = fork('./init.js');
  worker.on('message', (message) => {
    if (message.act === 'suicide') {
      createWorker();
    }
  });
  worker.on('exit', () => {
    console.log(`restart new worker:${worker.pid}`);
    delete workers[worker.pid];
  });
  worker.send('server', server);
  workers[worker.pid] = worker;
  console.log(`create worker:${worker.pid}`);
};

for (let i = 0; i < cpus.length; i += 1) {
  createWorker();
}

process.on('oncaughtException', (err) => {
  console.log('Master uncaughtException');
  console.log(err);
});
server.listen(3000);
