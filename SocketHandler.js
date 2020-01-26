class SocketHandler
{
    constructor(wss)
    {
        this.state =
        {
            wss: wss
        }

        this.broadcast = this.broadcast.bind(this);
    }

    broadcast(msg)
    {
        if(this.state.wss.clients)
        {
            this.state.wss.clients.forEach(client =>
                {
                    if(client.readyState === 1)
                    {
                        client.send(msg);
                    }
                })
        }
    }
}

module.exports = SocketHandler;