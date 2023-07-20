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
    // eslint-disable-next-line no-unused-vars
    aggregateByPrice(orders) {
        return {}
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