
// const schedule = require('node-schedule');
const child_process = require('child_process');

const ps = child_process.spawn('node', ['init.js']);


ps.on('close', (code) => {
  if (code !== 0) {
    console.log(`ps 进程退出码：${code}`);
  }
});
