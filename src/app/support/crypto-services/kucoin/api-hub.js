import {ApiHub as BaseApiHub} from '../api-hub'
import moment from 'moment/moment'

export class ApiHub extends BaseApiHub
{
    baseUrl() {
        return 'https://api.kucoin.com/api'
    }

    info() {
        return this.request('GET', 'v2/symbols')
            .then(data => {
                const symbol = data.data.find(symbol => symbol.symbol === this.ticker)
                if (symbol && symbol.enableTrading) {
                    return {
                        ticker: {
                            size: Number(symbol.priceIncrement),
                        },
                    }
                }
                throw 'Ticker not supported'
            })
    }

    candles() {
        return this.request('GET', 'v1/market/candles', {
            symbol: this.ticker,
            type: this.interval,
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