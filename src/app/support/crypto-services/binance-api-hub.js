import axios from 'axios'

export class BinanceApiHub
{
    request(method, path, params = {}) {
        return axios
            .request({
                url: `https://api.binance.com/api/v3/${path}`,
                method: method,
                params: params,
            })
            .then(res => res.data)
    }

    exchangeInfo(symbol) {
        return this.request('GET', 'exchangeInfo', {symbol})
    }

    klines(symbol, interval, limit = 1000) {
        return this.request('GET', 'klines', {symbol, interval, limit})
    }

    depth(symbol, limit = 1000) {
        return this.request('GET', 'depth', {symbol, limit})
    }

    aggTrades(symbol, from = null, startTime = null, endTime = null, limit = 1000) {
        const params = {symbol, limit}
        if (from) {
            params.from = from
        }
        if (startTime) {
            params.startTime = startTime
        }
        if (endTime) {
            params.endTime = endTime
        }
        return this.request('GET', 'aggTrades', params)
    }
}