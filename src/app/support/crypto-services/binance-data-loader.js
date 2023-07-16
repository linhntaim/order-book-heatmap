import {DataLoader} from './data-loader'
import axios from 'axios'
import moment from 'moment'
import {num} from '../helpers'

export class BinanceDataLoader extends DataLoader
{
    constructor(symbol = 'BTCUSDT', interval = '1d') {
        super(symbol, interval)
    }

    async init() {
        const info = await axios
            .get('https://api.binance.com/api/v3/exchangeInfo', {
                params: {
                    symbol: this.symbol,
                },
            })
            .then(res => {
                const symbolInfo = res.data.symbols[0]
                const filters = {}
                symbolInfo.filters.forEach(filter => {
                    filters[filter.filterType] = filter
                })
                return {
                    tickSize: Number(filters.PRICE_FILTER.tickSize),
                }
            })

        this.info.tickSize = info.tickSize
    }

    async fetchCandles() {
        const candles = await axios
            .get('https://api.binance.com/api/v3/klines', {
                params: {
                    symbol: this.symbol,
                    interval: this.interval,
                },
            })
            .then(res => {
                const klines = res.data
                return klines.map(i => ({
                    time: moment(i[0]).unix(),
                    open: Number(i[1]),
                    high: Number(i[2]),
                    low: Number(i[3]),
                    close: Number(i[4]),
                }))
            })

        this.updateLatestCandle(candles[candles.length - 1])

        return candles
    }

    startCandleStream(callback) {
        this.socket = new WebSocket(`wss://stream.binance.com:9443/ws/${this.symbol.toLowerCase()}@kline_${this.interval}`)
        this.socket.addEventListener('message', (event) => {
            const candle = (data => ({
                time: moment(data.k.t).unix(),
                open: Number(data.k.o),
                high: Number(data.k.h),
                low: Number(data.k.l),
                close: Number(data.k.c),
            }))(JSON.parse(event.data))

            this.updateLatestCandle(candle)
            callback(candle)
        })
    }

    endCandleStream() {
        if (this.socket) {
            this.socket.close()
            this.socket = null
        }
    }

    async startHeatBookStream(heatCallback = null) {
        const keyByPrice = orders => {
            const orderBook = {}
            orders.forEach(trade => {
                orderBook[trade[0]] = Number(trade[1]) // price => quantity
            })
            return orderBook
        }

        const orderBook = await axios
            .get('https://api.binance.com/api/v3/depth', {
                params: {
                    symbol: this.symbol,
                    limit: 1000,
                },
            })
            .then(res => ({
                bids: keyByPrice(res.data.bids), // buyer
                asks: keyByPrice(res.data.asks), // seller
            }))

        const heat = () => {
            const calcFiatOrders = (orders, side = 'bids') => {
                const fiatOrders = {}
                Object.keys(orders).forEach(price => {
                    const heatPrice = (Math[side === 'bids' ? 'floor' : 'ceil'](Number(price) / this.info.heatSize) * this.info.heatSize).toFixed(num.precision(this.info.tickSize))
                    if (!(heatPrice in fiatOrders)) {
                        fiatOrders[heatPrice] = 0
                    }
                    fiatOrders[heatPrice] += Number(price) * Number(orders[price])
                })
                return fiatOrders
            }
            const makeCandles = fiatOrders => {
                const candles = {}
                Object.keys(fiatOrders).forEach(heatPrice => {
                    if (fiatOrders[heatPrice] < 300000) {
                        return
                    }
                    const open = Number(heatPrice)
                    const close = Number((Number(heatPrice) + this.info.heatSize).toFixed(num.precision(this.info.tickSize)))
                    candles[heatPrice] = {
                        fiat: Number(fiatOrders[heatPrice].toFixed(2)),
                        data: [{
                            time: this.info.latestCandle.time,
                            open: open,
                            high: close,
                            low: open,
                            close: close,
                        }],
                    }
                })
                return candles
            }

            heatCallback && heatCallback({
                bids: makeCandles(calcFiatOrders(orderBook.bids)),
                asks: makeCandles(calcFiatOrders(orderBook.asks, 'asks')),
            })
        }
        const updateOrderBook = (updatingOrderBook, side = '', heating = true) => {
            if (side === '') {
                updateOrderBook(updatingOrderBook, 'bids', false)
                updateOrderBook(updatingOrderBook, 'asks', true)
            }
            else {
                Object.keys(updatingOrderBook[side]).forEach(price => {
                    orderBook[side][price] = updatingOrderBook[side][price]
                })
                if (heating) {
                    heat()
                }
            }
        }

        this.heatBookSocket = new WebSocket(`wss://stream.binance.com:9443/ws/${this.symbol.toLowerCase()}@depth`)
        this.heatBookSocket.addEventListener('message', (event) => {
            updateOrderBook((data => ({
                bids: keyByPrice(data.b), // buyer
                asks: keyByPrice(data.a), // seller
            }))(JSON.parse(event.data)))
        })
    }

    endHeatBookStream() {
        if (this.heatBookSocket) {
            this.heatBookSocket.close()
            this.heatBookSocket = null
        }
    }
}