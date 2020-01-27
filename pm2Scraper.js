const {exec, spawn} = require('child_process');
const moment = require('moment');

const state =
{
    spawnProcess: [],
    processes: []
}

function beginScrape()
{
    getStatus()
    .then(result => SendLogs(result))
    monitorStatus();
}

function getStatus()
{
    return new Promise((resolve, reject) =>
    {
        exec('pm2 jlist', (error, stdout, stderr) =>
        {
            if(error)
            {
                return reject(error);
            }
            else
            {                
                let data = JSON.parse(stdout).map(process =>
                {
                    return ({
                        name: process.name,
                        pid: process.pid,
                        status: process.pm2_env.status,
                        node_version: process.pm2_env.node_version,
                        processCreated: process.pm2_env.created_at,
                        upTime: process.pm2_env.pm_uptime,
                        restartedAmt: process.pm2_env.restart_time,
                        projectPath: process.pm2_env.pm_cwd,
                        backendPath: process.pm2_env.pm_exec_path,
                        memory: process.monit.memory,
                        cpu: process.monit.cpu
                    })
                });
                return resolve(data);
            }
        })
    });
}

function monitorStatus()
{
    new Promise((resolve, reject) =>
    {
        exec('pm2 jlist', (error, stdout, stderr) =>
        {
            if(error)
            {
                return reject(error);
            }
            else
            {                
                let data = JSON.parse(stdout).map(process =>
                {
                    // console.log(process.pm2_env.status)
                    return ({
                        name: process.name,
                        pid: process.pid,
                        status: process.pm2_env.status,
                        node_version: process.pm2_env.node_version,
                        processCreated: process.pm2_env.created_at,
                        upTime: process.pm2_env.pm_uptime,
                        restartedAmt: process.pm2_env.restart_time,
                        projectPath: process.pm2_env.pm_cwd,
                        backendPath: process.pm2_env.pm_exec_path,
                        memory: process.monit.memory,
                        cpu: process.monit.cpu
                    })
                });
                return resolve(data);
            }
        })
    })
    .then(result => 
        {
            let processNames = state.processes.map(process => process.name);
            result.forEach(process =>
                {
                    if(processNames.includes(process.name))
                    {
                        let index = state.processes.indexOf(state.processes.filter(e => e.name === process.name)[0]);
                        if(state.processes[index].status !== process.status)
                        {
                            // console.log('something is different', process.status);
                            global.broadcast(`<[${process.name}]:[${new moment().format('MM/DD/YYYY hh:mm:ss A')}] <CRITICAL>> Process has an updated status of: ${process.status}`)
                            state.processes[index] = process;
                        }
                    }
                    else
                    {
                        console.log('does not have process');
                        state.processes.push(process);
                        SendLogs([process]);
                    }
                })
            new Promise(resolve => setTimeout(monitorStatus, 1000));
        });
}

function SendLogs(processes)
{
    processes.map(process =>
        {
            console.log(process);
            if(process.name !== 'servermonitor')
            {
                let newInstance = {
                    name: process.name,
                    spawnInstance: spawn('pm2', ['logs', process.name, '--raw', '--lines', '0'])
                };
                state.spawnProcess.push(newInstance);
                newInstance.spawnInstance.stdout.on('data', data =>
                {
                    global.broadcast(data.toString());
                });
                newInstance.spawnInstance.stderr.on('data', data=>
                {
                    global.broadcast(data.toString());
                })
                newInstance.spawnInstance.on('close', code => {
                    console.log(`${process.name} was closed.`);
                })
            }
        });
}

module.exports = {beginScrape, getStatus}