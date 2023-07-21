import {num} from '@/app/support/helpers'

export class OrderBook
{
    /**
     *
     * @param tickerSize
     * @param asks
     * @param bids
     */
    constructor(tickerSize, asks = [], bids = []) {
        this.tickerSize = tickerSize

        /**
         *
         * @type {{Number}} price => quantity
         */
        this.asks = this.aggregateByPrice(asks)

        /**
         *
         * @type {{Number}} price => quantity
         */
        this.bids = this.aggregateByPrice(bids)
    }

    /**
     *
     * @param orders
     * @returns {{Number}}
     */
    aggregateByPrice(orders) {
        const aggregatedOrders = {} // price => quantity
        orders.forEach(order => {
            const price = Number(order[0]).toFixed(num.precision(this.tickerSize))
            if (!(order[0] in aggregatedOrders)) {
                aggregatedOrders[price] = 0
            }
            aggregatedOrders[price] += Number(order[1])
        })
        return aggregatedOrders
    }

    /**
     *
     * @param {OrderBook} orderBook
     * @returns {OrderBook}
     */
    // eslint-disable-next-line no-unused-vars
    replace(orderBook) {
        this.asks = orderBook.asks
        this.bids = orderBook.bids
        return this
    }

    /**
     *
     * @param {OrderBook} orderBook
     * @returns {OrderBook}
     */
    // eslint-disable-next-line no-unused-vars
    update(orderBook) {
        const updateSide = side => Object.keys(orderBook[side]).forEach(price => {
            if (orderBook[side][price] === 0) {
                delete this[side][price]
            }
            else {
                this[side][price] = orderBook[side][price]
            }
        })
        updateSide('asks')
        updateSide('bids')
        return this
    }
}