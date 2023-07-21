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
        return new OrderBook(this.tickerSize, streamingOrderBook.asks, streamingOrderBook.bids, streamingOrderBook.type)
    }

    createLatestCandle(streamingCandle) {
        const intervalTime = this.interval.findOpenTimeOf(streamingCandle.time)
        return intervalTime === this.latestCandle.candle.time
            ? (latestCandle => {
                latestCandle.close = streamingCandle.close
                if (streamingCandle.close < latestCandle.low) {
                    latestCandle.low = streamingCandle.close
                }
                if (streamingCandle.close > latestCandle.high) {
                    latestCandle.high = streamingCandle.close
                }
                return latestCandle
            })(this.latestCandle.candle)
            : {
                time: intervalTime,
                open: streamingCandle.close,
                low: streamingCandle.close,
                high: streamingCandle.close,
                close: streamingCandle.close,
            }
    }
}