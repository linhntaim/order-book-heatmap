import {ApiHub as BaseApiHub} from '../api-hub'
import moment from 'moment/moment'

export class ApiHub extends BaseApiHub
{
    baseUrl() {
        return 'https://api.bybit.com/v5'
    }

    info() {
        return this.request('GET', 'market/instruments-info', {
                category: 'spot',
                symbol: this.ticker,
            })
            .then(data => ({
                ticker: {
                    size: Number(data.result.list[0].priceFilter.tickSize),
                },
            }))
    }

    candles() {
        return this.request('GET', 'market/kline', {
            category: 'spot',
            symbol: this.ticker,
            interval: this.interval,
            limit: 1000,
        }).then(data => data.result.list.map(i => ({
            time: moment(Number(i[0])).unix(),
            open: Number(i[1]),
            high: Number(i[2]),
            low: Number(i[3]),
            close: Number(i[4]),
        })).reverse())
    }

    orderBook() {
        return this.request('GET', 'market/orderbook', {
            category: 'spot',
            symbol: this.ticker,
            limit: 50,
        }).then(data => ({
            type: 'snapshot',
            asks: data.result.a,
            bids: data.result.b,
            lastUpdateId: data.result.u,
        }))
    }
}