import {OrderBook as BaseOrderBook} from '../order-book'

export class OrderBook extends BaseOrderBook
{
    constructor(tickerSize, asks = [], bids = [], type='snapshot', lastUpdateId = 0) {
        super(tickerSize, asks, bids)

        this.type = type
        this.lastUpdateId = lastUpdateId

        /**
         *
         * @type {OrderBook[]}
         */
        this.updatingQueue = []
    }

    replace(orderBook) {
        super.replace(orderBook)
        this.type = orderBook.type
        this.lastUpdateId = orderBook.lastUpdateId
        return this
    }

    update(orderBook) {
        if (orderBook.type === 'snapshot') {
            return this.replace(orderBook)
        }
        if (this.lastUpdateId === 0) {
            this.updatingQueue.push(orderBook)
            return this
        }
        if (this.updatingQueue.length) {
            let lastUpdatedId = this.lastUpdateId
            this.updatingQueue.push(orderBook)
            while (this.updatingQueue.length) {
                const queuedOrderBook = this.updatingQueue.shift()
                if (queuedOrderBook.lastUpdateId <= this.lastUpdateId) {
                    continue
                }
                super.update(queuedOrderBook)
                lastUpdatedId = queuedOrderBook.lastUpdateId
            }
            this.lastUpdateId = lastUpdatedId
            return this
        }

        super.update(orderBook)
        this.lastUpdateId = orderBook.lastUpdateId
        return this
    }
}