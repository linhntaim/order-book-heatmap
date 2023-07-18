export class BinanceStreamHub
{
    constructor() {
        this.streams = {}
        this.idIncrement = 0
    }

    openStream(path, dataCallback) {
        const stream = new WebSocket(`wss://stream.binance.com:9443/ws/${path}`)
        stream.addEventListener('message', event => dataCallback(JSON.parse(event.data)))
        this.streams[++this.idIncrement] = stream
        return this.idIncrement
    }

    closeStream(id) {
        if (id in this.streams) {
            this.streams[id].close()
            delete this.streams[id]
            return true
        }
        return false
    }
}