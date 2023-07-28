import {StreamHub as BaseStreamHub} from '../stream-hub'
import moment from 'moment'
import {take} from '@/app/support/helpers'

export class StreamHub extends BaseStreamHub
{
    constructor(ticker, interval) {
        super(ticker, interval)

        this.queueOrderBook = {
            counter: 0,
            asks: [],
            bids: [],
        }
    }

    url() {
        return 'wss://ws-feed.exchange.coinbase.com'
    }

    resetQueue() {
        this.queueOrderBook.counter = 0
        this.queueOrderBook.asks = []
        this.queueOrderBook.bids = []
    }

    subscriptionRequest() {
        return {
            'type': 'subscribe',
            'channels': [
                'level2_batch',
                'matches',
            ],
            'product_ids': [
                this.ticker,
            ],
        }
    }

    isCandle(data) {
        return data.type === 'match' || data.type === 'last_match'
    }

    transformCandle(data) {
        return {
            time: moment(data.time).unix(),
            close: Number(data.price),
        }
    }

    isOrderBook(data) {
        return data.type === 'l2update' || data.type === 'snapshot'
    }

    transformOrderBook(data) {
        if (data.type === 'snapshot') {
            this.resetQueue()
            return {
                type: data.type,
                asks: data.asks,
                bids: data.bids,
            }
        }

        // l2update
        // collect into chunk
        const chunk = {
            asks: [],
            bids: [],
        }
        const changes = data.changes
        while (changes.length) {
            const change = changes.shift()
            if (change.shift() === 'buy') {
                chunk.bids.push(change)
            }
            else {
                chunk.asks.push(change)
            }
        }
        // push chunk to queue
        this.queueOrderBook.asks.push(chunk.asks)
        this.queueOrderBook.bids.push(chunk.bids)
        // return all chunks in queue after 1s
        if (++this.queueOrderBook.counter === 60) { // 10 * 0.05s
            return take(
                {
                    type: data.type,
                    asks: this.queueOrderBook.asks,
                    bids: this.queueOrderBook.bids,
                },
                () => this.resetQueue(),
            )
        }
        return {
            type: data.type,
            asks: [],
            bids: [],
        }
    }
}