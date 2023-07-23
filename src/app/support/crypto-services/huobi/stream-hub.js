import {StreamHub as BaseStreamHub} from '../stream-hub'
import moment from 'moment'
import pako from 'pako'

export class StreamHub extends BaseStreamHub
{
    url() {
        return 'wss://api.huobi.pro/ws'
    }

    setDepth(depth) {
        this.depth = depth
    }

    subscribe() {
        this.stream.send(JSON.stringify({
            'sub': `market.${this.ticker}.kline.${this.interval}`,
            'id': '1',
        }))
        this.stream.send(JSON.stringify({
            'sub': `market.${this.ticker}.depth.step5`,
            'id': '2',
        }))
    }

    async parseData(rawData) {
        const data = JSON.parse(
            pako.inflate(await rawData.arrayBuffer(), {to: 'string'}), // decompress gzip
        )
        if (data.ping) {
            this.stream.send(JSON.stringify({
                pong: data.ping,
            }))
        }
        else if (data.tick) {
            return data
        }
        return {ch: ''}
    }

    isCandle(data) {
        return data.ch.includes('kline')
    }

    transformCandle(data) {
        return {
            time: moment(data.tick.id).unix(),
            open: data.tick.open,
            high: data.tick.high,
            low: data.tick.low,
            close: data.tick.close,
        }
    }

    isOrderBook(data) {
        return data.ch.includes('depth')
    }

    transformOrderBook(data) {
        return {
            asks: data.tick.asks,
            bids: data.tick.bids,
            lastUpdateId: data.tick.ts,
        }
    }
}