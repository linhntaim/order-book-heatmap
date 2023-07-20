import {StreamHub as BaseStreamHub} from '../stream-hub'
import moment from 'moment'

export class StreamHub extends BaseStreamHub
{
    url() {
        return 'wss://stream.binance.com:9443/ws'
    }

    subscriptionRequest() {
        return {
            'method': 'SUBSCRIBE',
            'params':
                [
                    `${this.ticker}@kline_${this.interval}`,
                    `${this.ticker}@depth`, // @100ms
                ],
            'id': 1,
        }
    }

    isCandle(data) {
        return data.e === 'kline'
    }

    transformCandle(data) {
        return {
            time: moment(data.k.t).unix(),
            open: Number(data.k.o),
            high: Number(data.k.h),
            low: Number(data.k.l),
            close: Number(data.k.c),
        }
    }

    isOrderBook(data) {
        return data.e === 'depthUpdate'
    }

    transformOrderBook(data) {
        return {
            asks: data.a,
            bids: data.b,
            lastUpdateId: data.u,
        }
    }
}