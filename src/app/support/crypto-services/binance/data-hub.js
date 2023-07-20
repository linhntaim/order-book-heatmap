import {DataHub as BaseDataHub} from '../data-hub'
import {ApiHub} from './api-hub'
import {OrderBook} from './order-book'
import {StreamHub} from './stream-hub'
import {Ticker} from './ticker'

export class DataHub extends BaseDataHub
{
    createTicker(baseSymbol, quoteSymbol) {
        return new Ticker(baseSymbol, quoteSymbol)
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

    createOrderBook(orderBook) {
        return new OrderBook(this.tickerSize, orderBook.asks, orderBook.bids, orderBook.lastUpdateId)
    }
}