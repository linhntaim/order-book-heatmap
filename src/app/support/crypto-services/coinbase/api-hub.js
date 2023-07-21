import {ApiHub as BaseApiHub} from '../api-hub'

export class ApiHub extends BaseApiHub
{
    baseUrl() {
        return 'https://api.exchange.coinbase.com'
    }

    info() {
        return this.request('GET', `products/${this.ticker}`)
            .then(data => ({
                ticker: {
                    size: Number(data.quote_increment),
                },
            }))
    }

    candles() {
        return this.request('GET', `products/${this.ticker}/candles`, {
            granularity: this.interval,
        }).then(data => data.map(i => ({
            time: i[0],
            low: i[1],
            high: i[2],
            open: i[3],
            close: i[4],
        })).reverse())
    }

    orderBook() {
        return this.request('GET', `products/${this.ticker}/book`, {
            level: 2,
        }).then(data => ({
            asks: data.asks,
            bids: data.bids,
            lastUpdateId: data.sequence,
        }))
    }
}