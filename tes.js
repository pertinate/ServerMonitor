const moment = require('moment');
let name = 'tes';
let PORT = 8089;
const {log, warn, error} = console;
console.log = (...msg) => log(`<[${name}]:[${PORT}]:[${new moment().format('MM/DD/YYYY hh:mm:ss A')}] <LOG>> ${msg.join(' ')}`);
console.error = (...msg) => error(`<[${name}]:[${PORT}]:[${new moment().format('MM/DD/YYYY hh:mm:ss A')}] <ERROR>> ${msg.join(' ')}`);
console.warn = (...msg) => warn(`<[${name}]:[${PORT}]:[${new moment().format('MM/DD/YYYY hh:mm:ss A')}] <WARN>> ${msg.join(' ')}`);
console.log('Server Started');
let index = 0;
setInterval(()=>
{
    console.log(`Logging new message: ${index++}`)
}, 1000)