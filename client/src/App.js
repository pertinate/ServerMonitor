import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Button, Table, List } from 'antd';
import 'antd/dist/antd.css';
import Column from 'antd/lib/table/Column';
import socket from 'socket.io-client';
export default class App extends React.Component {
  constructor(props)
  {
    super(props);

    this.state =
    {
      processStatus: undefined,
      socketLogs: []
    }
  }

  componentDidMount()
  {
    this.getStatus();
    let test = socket('http://localhost:8080');
    test.on('broadcast', data =>
    {
      let socketLogs = [data, ...this.state.socketLogs.slice(0, 2 * 15 - 1)];
      this.setState({socketLogs});
    })
  }

  getStatus = () =>
  {
    fetch('http://localhost:8080/getstatus')
    .then(result => result.json())
    .then(result => this.setState({processStatus: result}, () => setTimeout(this.getStatus, 10000)))
    .catch(error => console.error(error))
  }

  render() {
    return (
      <div className="App">
        <Table dataSource={this.state.processStatus}>
          <Column title='Process Name' dataIndex='name' key='name'/>
          <Column title='Process ID' dataIndex='pid' key='pid'/>
          <Column title='Status' dataIndex='status' key='status'/>
          <Column title='Node Version' dataIndex='node_version' key='node_version'/>
          <Column title='Process Created' dataIndex='processCreated' key='processCreated'/>
          <Column title='Up Time' dataIndex='upTime' key='upTime'/>
          <Column title='Restarted Amount' dataIndex='restartedAmt' key='restartedAmt'/>
          <Column title='Project Path' dataIndex='projectPath' key='projectPath'/>
          <Column title='Backend Path' dataIndex='backendPath' key='backendPath'/>
          <Column title='Memory Usage' dataIndex='memory' key='memory'/>
          <Column title='CPU %' dataIndex='cpu' key='cpu'/>
        </Table>
        <Button type="primary">Test</Button>
        <List 
        pagination={{
          onChange: page => {
            console.log(page);
          },
          pageSize: 15,
        }}
        dataSource={this.state.socketLogs}
        renderItem={
          item => (
            <List.Item>
              {item}
            </List.Item>
          )
        }
        />

      </div>
    )
  }
}
