import {DataHub as BaseDataHub} from '../data-hub'
import {ApiHub} from './api-hub'
import {Interval} from './interval'
import {OrderBook} from './order-book'
import {StreamHub} from './stream-hub'
import {Ticker} from './ticker'

export class DataHub extends BaseDataHub
{
    createTicker(baseSymbol, quoteSymbol) {
        return new Ticker(baseSymbol, quoteSymbol)
    }

    createInterval(interval) {
        return new Interval(interval)
    }

    createApiHub() {
        return new ApiHub(this.ticker, this.interval)
    }

    createStreamHub() {
        return new StreamHub(this.ticker, this.interval)
    }

    initializeStartingOrderBook() {
        return new OrderBook(this.tickerSize)
    }

    createOrderBook(streamingOrderBook) {
        return new OrderBook(this.tickerSize, streamingOrderBook.asks, streamingOrderBook.bids, streamingOrderBook.lastUpdateId)
    }

    beforeOn() {
        const depth = (d => d === 4 ? 5 : d)(Math.log10(this.latestCandle.heatSize / this.tickerSize))
        this.apiHub.setDepth(depth)
        this.streamHub.setDepth(depth)
    }
}