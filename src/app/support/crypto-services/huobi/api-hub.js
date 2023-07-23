import {ApiHub as BaseApiHub} from '../api-hub'
import moment from 'moment/moment'

export class ApiHub extends BaseApiHub
{
    baseUrl() {
        return 'https://api.huobi.pro'
    }

    setDepth(depth) {
        this.depth = depth
    }

    info() {
        return this.request('GET', 'v1/settings/common/market-symbols', {symbols: this.ticker})
            .then(data => ({
                ticker: {
                    size: Number('1e-' + data.data[0].pp),
                },
            }))
    }

    candles() {
        return this.request('GET', 'market/history/kline', {
            symbol: this.ticker,
            period: this.interval,
            size: 1000,
        }).then(data => data.data.map(i => ({
            time: moment(i.id).unix(),
            open: i.open,
            high: i.high,
            low: i.low,
            close: i.close,
        })).reverse())
    }

    orderBook() {
        return this.request('GET', 'market/depth', {
            symbol: this.ticker,
            depth: 20,
            type: `step${this.depth}`,
        }).then(data => ({
            asks: data.tick.asks,
            bids: data.tick.bids,
            lastUpdateId: data.tick.ts,
        }))
    }
}