import {ApiHub} from './api-hub'
import {Interval} from './interval'
import {OrderBook} from './order-book'
import {StreamHub} from './stream-hub'
import {Ticker} from './ticker'
import {HeatMaker} from '@/app/support/crypto-services/heat-maker'

export class DataHub
{
    constructor(baseSymbol = 'BTC', quoteSymbol = 'USDT', interval = '1d') {
        /**
         *
         * @type {Ticker}
         */
        this.ticker = this.createTicker(baseSymbol, quoteSymbol)
        this.tickerSize = 0.01

        /**
         *
         * @type {Interval}
         */
        this.interval = this.createInterval(interval)

        this.latestCandle = {
            candle: null,
            nextIntervalTime: 0,
            heatSize: 0,
        }

        /**
         *
         * @type {ApiHub}
         */
        this.apiHub = this.createApiHub()

        /**
         *
         * @type {StreamHub}
         */
        this.streamHub = this.createStreamHub()

        this.heatMaker = new HeatMaker()
    }

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

    getStartingInfo() {
        return this.apiHub.info()
    }

    getStartingCandles() {
        return this.apiHub.candles()
    }

    getStartingOrderBook() {
        return this.apiHub.orderBook()
    }

    initializeStartingOrderBook() {
        return new OrderBook(this.tickerSize)
    }

    createOrderBook(streamingOrderBook) {
        return new OrderBook(this.tickerSize, streamingOrderBook.asks, streamingOrderBook.bids)
    }

    createLatestCandle(streamingCandle) {
        return streamingCandle
    }

    async init() {
        const info = await this.getStartingInfo()
        this.tickerSize = info.ticker.size

        this.heatMaker.setTickerSize(this.tickerSize)
    }

    updateLatestCandle(latestCandle) {
        this.latestCandle.candle = latestCandle
        this.latestCandle.nextIntervalTime = this.interval.findOpenTimeOf(null, 1)
        this.latestCandle.heatSize =
            (heatSize => (heatSize <= 1000 ? 10 : heatSize / 100) * this.tickerSize)(Math.pow(10, Math.floor(Math.log10(latestCandle.close / this.tickerSize))))

        this.heatMaker.setLatestCandle(this.latestCandle)
    }

    // eslint-disable-next-line no-unused-vars
    shouldHandleStreamingCandle(streamingCandle) {
        // wait till starting candles fetched
        return this.latestCandle.candle != null
    }

    // eslint-disable-next-line no-unused-vars
    shouldHandleStreamingOrderBook(streamingOrderBook) {
        return streamingOrderBook.asks.length || streamingOrderBook.bids.length
    }

    beforeOn() {

    }

    async on(handleStartingCandles, handleStreamingCandle, handleStreamingOrderBook) {
        const startingCandles = await this.getStartingCandles()
        this.updateLatestCandle(startingCandles[startingCandles.length - 1])
        handleStartingCandles(startingCandles)

        this.beforeOn()

        const orderBook = this.initializeStartingOrderBook();
        (await this.streamHub.connect()).listen(
            streamingCandle => {
                if (this.shouldHandleStreamingCandle(streamingCandle)) {
                    const latestCandle = this.createLatestCandle(streamingCandle)
                    this.updateLatestCandle(latestCandle)
                    handleStreamingCandle(latestCandle)
                }
            },
            streamingOrderBook => {
                if (this.shouldHandleStreamingOrderBook(streamingOrderBook)) {
                    handleStreamingOrderBook(
                        this.heatMaker.makeHeatBook(
                            orderBook.update(this.createOrderBook(streamingOrderBook)),
                        ),
                    )
                }
            },
        )

        orderBook.replace(this.createOrderBook(await this.getStartingOrderBook()))
    }

    off() {
        this.streamHub.disconnect()
    }
}