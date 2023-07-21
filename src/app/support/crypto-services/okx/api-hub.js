import {ApiHub as BaseApiHub} from '../api-hub'
import moment from 'moment/moment'

export class ApiHub extends BaseApiHub
{
    baseUrl() {
        return 'https://www.okx.com/api/v5'
    }

    info() {
        return this.request('GET', 'public/instruments', {
            instId: this.ticker,
            instType: 'SPOT',
        }).then(data => ({
            ticker: {
                size: Number(data.data[0].tickSz),
            },
        }))
    }

    candles() {
        return this.request('GET', 'market/candles', {
            instId: this.ticker,
            bar: this.interval,
            limit: 300,
        }).then(data => data.data.map(i => ({
            time: moment(Number(i[0])).unix(),
            open: Number(i[1]),
            high: Number(i[2]),
            low: Number(i[3]),
            close: Number(i[4]),
        })).reverse())
    }

    orderBook() {
        return this.request('GET', 'market/books', {
            instId: this.ticker,
            sz: 400,
        }).then(data => ({
            asks: data.data[0].asks,
            bids: data.data[0].bids,
            lastUpdateId: Number(data.data[0].ts),
        }))
    }
}