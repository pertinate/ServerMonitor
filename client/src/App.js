import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Button, Table, List, Col, Row, Tabs } from 'antd';
import 'antd/dist/antd.css';
import Column from 'antd/lib/table/Column';
import socket from 'socket.io-client';
import moment from 'moment';

const { TabPane } = Tabs;

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state =
    {
      processStatus: undefined,
      socketLogs: [],
      logTabs: ['All'],
      individualLogs: [],
      pageSize: 10,
      pageLength: 20,
      arrayLength: 0
    }
  }

  componentDidMount() {
    this.setState({arrayLength: this.state.pageSize * this.state.pageLength - 1})
    this.getStatus();
    let test = socket('http://localhost:8080');
    test.on('broadcast', data => {
      let socketLogs = [data.msg, ...this.state.socketLogs.slice(0, this.state.pageSize * this.state.pageLength - 1)];
      let socketNames = [...this.state.logTabs];
      socketLogs.map(log => log.split(/\[(.*?)\]/)).forEach(name => socketNames.push(name[1]));

      let individualLogs = this.state.individualLogs;

      socketNames.forEach(name =>
        {
          if(individualLogs.filter(log => log[0] === name).length === 0)
          {
            individualLogs.push([name, []])
          }
        })
      
      individualLogs = individualLogs.map(log =>
        {
          if(log[0] === data.msg.split(/\[(.*?)\]/)[1])
          {
            log[1] = [data.msg, ...log[1].slice(0, this.state.pageSize * this.state.pageLength - 1)];
            log[1] = log[1].filter((e, index) => log[1].indexOf(e) === index);
          }
          return log;
        })

      this.setState({ socketLogs, logTabs: socketNames.filter((e, index) => socketNames.indexOf(e) === index), individualLogs });
    })
  }

  getStatus = () => {
    fetch('http://localhost:8080/getstatus')
      .then(result => result.json())
      .then(result => this.setState({ processStatus: result }, () => setTimeout(this.getStatus, 10000)))
      .catch(error => console.error(error))
  }

  handleControl = (command, record) =>
  {
      fetch(`http://localhost:8080/control?app=${record.name}&command=${command}`)
      .then(() => 
      {
        console.log(`${command} has been ran for ${record.name}`);
      })
      .catch(error => console.error(`Failed ot run command: ${error}`))
  }

  render() {
    return (
      <div className="App">
        <Table dataSource={this.state.processStatus}
          rowKey={
            (record, index) => `tb${index}`
          }
        >
          <Column title='Process Name' dataIndex='name' key='name' />
          <Column title='Process ID' dataIndex='pid' key='pid' />
          <Column title='Status' dataIndex='status' key='status' />
          <Column title='Node Version' dataIndex='node_version' key='node_version' />
          <Column title='Process Created' dataIndex='processCreated' key='processCreated'
          render={
            text =>
            (
            <span>{moment(text).format('MM/DD/YYYY hh:mm:ss A')}</span>
            )
          }/>
          <Column title='Up Time' dataIndex='upTime' key='upTime' 
          render={
            text =>
            (
            <span>{moment(text).format('MM/DD/YYYY hh:mm:ss A')}</span>
            )
          }
          />
          <Column title='Restarted Amount' dataIndex='restartedAmt' key='restartedAmt' />
          <Column title='Project Path' dataIndex='projectPath' key='projectPath' />
          <Column title='Backend Path' dataIndex='backendPath' key='backendPath' />
          <Column title='Memory Usage' dataIndex='memory' key='memory'
          render={
            text =>
            (
            <span>{(text / 1024.0 / 1024.0).toFixed(2)} MB</span>
            )
          }
          />
          <Column title='CPU %' dataIndex='cpu' key='cpu'
          render={
            text =>
            (
              <span>{text}%</span>
            )
          }
          />
          <Column title='Actions' key='actions'
            render={
              (text, record) => (
                <span>
                  <Row>
                    <Button type="primary" style={{ marginLeft: '5px', marginTop: '5px' }} onClick={() => this.handleControl('start', record)}>Start</Button>
                  </Row>
                  <Row>
                    <Button type="primary" style={{ marginLeft: '5px', marginTop: '5px' }} onClick={() => this.handleControl('stop', record)}>Stop</Button>
                  </Row>
                  <Row>
                    <Button type="primary" style={{ marginTop: '5px' }} onClick={() => this.handleControl('restart', record)}>Restart</Button>
                  </Row>
                </span>
              )
            }
          />
        </Table>
        <Tabs tabPosition='left'>
          {
            this.state.logTabs.map((logName, index) => {
              return (
                <TabPane tab={logName} key={'log' + index}>
                  <List
                    pagination={{
                      onChange: page => {
                      },
                      pageSize: 10,
                    }}
                    dataSource={
                      logName === 'All' ? this.state.socketLogs.filter((e, index) => this.state.socketLogs.indexOf(e) === index) : this.state.individualLogs.filter(log => log[0] === logName)[0][1]
                    }
                    renderItem={
                      (item, index) => (
                        <List.Item key={index}>
                          {index === 0 ? `[RECENT]: ${item}` : item}
                        </List.Item>
                      )
                    }
                  />
                </TabPane>
              )
            })
          }
        </Tabs>
      </div>
    )
  }
}
