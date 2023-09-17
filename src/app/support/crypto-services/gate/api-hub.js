import {ApiHub as BaseApiHub} from '../api-hub'
import moment from 'moment/moment'

export class ApiHub extends BaseApiHub
{
    baseUrl() {
        return 'https://api.gateio.ws/api/v4'
    }

    info() {
        return this.request('GET', `spot/currency_pairs/${this.ticker}`)
            .then(data => ({
                ticker: {
                    size: Number(`1e-${data.precision}`),
                },
            }))
    }

    candles() {
        return this.request('GET', 'spot/candlesticks', {
            currency_pair: this.ticker,
            interval: this.interval,
            limit: 1000,
        }).then(data => data.map(i => ({
            time: moment(Number(i[0])).unix(),
            open: Number(i[5]),
            high: Number(i[3]),
            low: Number(i[4]),
            close: Number(i[2]),
        })))
    }

    orderBook() {
        return this.request('GET', 'spot/order_book', {
            currency_pair: this.ticker,
            limit: 5000,
            with_id: 'true',
        }).then(data => ({
            asks: data.asks,
            bids: data.bids,
            lastUpdateId: data.id,
        }))
    }
}