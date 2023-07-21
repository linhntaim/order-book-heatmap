import {OrderBook as BaseOrderBook} from '../order-book'

export class OrderBook extends BaseOrderBook
{
    constructor(tickerSize, asks = [], bids = [], type = 'snapshot') {
        super(tickerSize, type === 'l2update' ? [] : asks, type === 'l2update' ? [] : bids)

        this.type = type
        if (this.type === 'l2update') {
            this.asks = this.aggregateByPriceForL2Update(asks)
            this.bids = this.aggregateByPriceForL2Update(bids)
        }
    }

    aggregateByPriceForL2Update(orders) {
        const aggregatedOrders = {} // price => quantity
        orders.forEach(chunkedOrders => {
            const chunkedAggregatedOrders = this.aggregateByPrice(chunkedOrders)
            Object.keys(chunkedAggregatedOrders).forEach(price => {
                aggregatedOrders[price] = chunkedAggregatedOrders[price]
            })
        })
        return aggregatedOrders
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