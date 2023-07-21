import {ApiHub as BaseApiHub} from '../api-hub'
import moment from 'moment/moment'

export class ApiHub extends BaseApiHub
{
    baseUrl() {
        return 'https://api.binance.com/api/v3'
    }

    info() {
        return this.request('GET', 'exchangeInfo', {symbol: this.ticker})
            .then(data => {
                const filter = data.symbols[0].filters.find(filter => filter.filterType === 'PRICE_FILTER')
                return {
                    ticker: {
                        size: filter ? Number(filter.tickSize) : 0.01,
                    },
                }
            })
    }

    candles() {
        return this.request('GET', 'klines', {
            symbol: this.ticker,
            interval: this.interval,
            limit: 1000,
        }).then(data => data.map(i => ({
            time: moment(i[0]).unix(),
            open: Number(i[1]),
            high: Number(i[2]),
            low: Number(i[3]),
            close: Number(i[4]),
        })))
    }

    orderBook() {
        return this.request('GET', 'depth', {
            symbol: this.ticker,
            limit: 5000,
        }).then(data => ({
            asks: data.asks,
            bids: data.bids,
            lastUpdateId: data.lastUpdateId,
        }))
    }
}