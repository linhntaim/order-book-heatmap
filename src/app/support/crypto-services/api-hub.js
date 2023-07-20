import axios from 'axios'

export class ApiHub
{
    /**
     *
     * @param {Ticker} ticker
     * @param {Interval} interval
     */
    constructor(ticker, interval) {
        this.ticker = ticker.useInApi()
        this.interval = interval.useInApi()

        this.client = axios.create({
            baseURL: this.baseUrl(),
        })
    }

    baseUrl() {
        return 'http://localhost'
    }

    request(method, path, params = {}) {
        return this.client
            .request({
                url: path,
                method: method,
                params: params,
            })
            .then(res => res.data)
    }

    info() {
        return new Promise(resolve => resolve({
            ticker: {
                size: 0.01,
            },
        }))
    }

    candles() {
        return new Promise(resolve => resolve([{
            time: 0,
            open: 0,
            high: 0,
            low: 0,
            close: 0,
        }]))
    }

    orderBook() {
        return new Promise(resolve => resolve({
            asks: [],
            bids: [],
        }))
    }
}