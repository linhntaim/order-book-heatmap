import {StreamHub as BaseStreamHub} from '../stream-hub'
import moment from 'moment'

export class StreamHub extends BaseStreamHub
{
    constructor(ticker, interval) {
        super(ticker, interval)

        this.heartbeatInterval = null
    }

    url() {
        return 'wss://stream.bybit.com/v5/public/spot'
    }

    listen(onCandle, onOrderBook) {
        // send heartbeat every 20 second
        let heartbeatId = 2
        this.heartbeatInterval = setInterval(() => {
            this.stream.send(JSON.stringify({'req_id': `${heartbeatId}`, 'op': 'ping'}))
            ++heartbeatId
        }, 20000)

        super.listen(onCandle, onOrderBook)
    }

    subscriptionRequest() {
        return {
            'req_id': '1',
            'op': 'subscribe',
            'args': [
                `kline.${this.interval}.${this.ticker}`,
                `orderbook.50.${this.ticker}`,
            ],
        }
    }

    isCandle(data) {
        return 'topic' in data && data.topic.startsWith('kline')
    }

    transformCandle(data) {
        return {
            time: moment(data.data[0].start).unix(),
            open: Number(data.data[0].open),
            high: Number(data.data[0].high),
            low: Number(data.data[0].low),
            close: Number(data.data[0].close),
        }
    }

    isOrderBook(data) {
        return 'topic' in data && data.topic.startsWith('orderbook')
    }

    transformOrderBook(data) {
        return {
            type: data.type,
            asks: data.data.a,
            bids: data.data.b,
            lastUpdateId: data.data.u,
        }
    }

    disconnect() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
        }
        super.disconnect()
    }
}