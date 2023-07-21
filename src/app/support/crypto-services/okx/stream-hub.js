import {StreamHub as BaseStreamHub} from '../stream-hub'
import moment from 'moment'

export class StreamHub extends BaseStreamHub
{
    url() {
        return 'wss://ws.okx.com:8443/ws/v5/public'
    }

    subscriptionRequest() {
        return {
            'op': 'subscribe',
            'args': [
                {
                    'channel': `candle${this.interval}`,
                    'instId': this.ticker,
                },
                {
                    'channel': 'books',
                    'instId': this.ticker,
                },
            ],
        }
    }

    isCandle(data) {
        return data.arg.channel.startsWith('candle') && !('event' in data)
    }

    transformCandle(data) {
        return {
            time: moment(Number(data.data[0][0])).unix(),
            open: Number(data.data[0][1]),
            high: Number(data.data[0][2]),
            low: Number(data.data[0][3]),
            close: Number(data.data[0][4]),
        }
    }

    isOrderBook(data) {
        return data.arg.channel === 'books' && !('event' in data)
    }

    transformOrderBook(data) {
        return {
            asks: data.data[0].asks,
            bids: data.data[0].bids,
            lastUpdateId: Number(data.data[0].ts),
        }
    }
}