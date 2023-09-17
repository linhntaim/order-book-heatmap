import {StreamHub as BaseStreamHub} from '../stream-hub'
import moment from 'moment'

export class StreamHub extends BaseStreamHub
{
    url() {
        return 'wss://api.gateio.ws/ws/v4'
    }

    subscribe() {
        this.stream.send(JSON.stringify({
            'time': Math.floor(new Date().getTime() / 1000),
            'channel': 'spot.candlesticks',
            'event': 'subscribe',
            'payload': [this.interval, this.ticker],
        }))
        this.stream.send(JSON.stringify({
            'time': Math.floor(new Date().getTime() / 1000),
            'channel': 'spot.order_book_update',
            'event': 'subscribe',
            'payload': [this.ticker, '1000ms'],
        }))
    }

    isCandle(data) {
        return data.channel === 'spot.candlesticks'
    }

    transformCandle(data) {
        return {
            time: moment(Number(data.result.t)).unix(),
            open: Number(data.result.o),
            high: Number(data.result.h),
            low: Number(data.result.l),
            close: Number(data.result.c),
        }
    }

    isOrderBook(data) {
        return data.channel === 'spot.order_book_update'
    }

    transformOrderBook(data) {
        return {
            asks: data.result.a,
            bids: data.result.b,
            lastUpdateId: data.result.u,
        }
    }
}