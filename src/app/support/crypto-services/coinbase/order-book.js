import {OrderBook as BaseOrderBook} from '../order-book'

export class OrderBook extends BaseOrderBook
{
    constructor(tickerSize, asks = [], bids = [], type = 'snapshot') {
        super(tickerSize, asks, bids)

        this.type = type
    }

    replace(orderBook) {
        super.replace(orderBook)
        this.type = orderBook.type
        return this
    }

    update(orderBook) {
        if (orderBook.type === 'snapshot') {
            return this.replace(orderBook)
        }
        super.update(orderBook)
        this.type = orderBook.type
        return this
    }
}