import {num} from '../helpers'
import {BinanceApiHub} from './binance-api-hub'
import {BinanceStreamHub} from './binance-stream-hub'
import {DataHub} from './data-hub'
import moment from 'moment'

export class BinanceDataHub extends DataHub
{
    constructor(symbol = 'BTCUSDT', interval = '1d') {
        super(symbol, interval)

        this.apiHub = new BinanceApiHub()
        this.streamHub = new BinanceStreamHub()
        this.klineStreamId = 0
        this.depthStreamId = 0
    }

    async init() {
        this.info.tickSize = await this.apiHub.exchangeInfo(this.symbol)
            .then(data => {
                const filter = data.symbols[0].filters.find(filter => filter.filterType === 'PRICE_FILTER')
                return filter ? Number(filter.tickSize) : 1
            })
    }

    async startCandleStream(startCallback, streamCallback) {
        const candles = await this.apiHub.klines(this.symbol, this.interval.toString())
            .then(data => data.map(i => ({
                time: moment(i[0]).unix(),
                open: Number(i[1]),
                high: Number(i[2]),
                low: Number(i[3]),
                close: Number(i[4]),
            })))

        this.updateLatestCandle(candles[candles.length - 1])

        startCallback(candles)

        this.klineStreamId = this.streamHub.openStream(
            `${this.symbol.toLowerCase()}@kline_${this.interval.toString()}`,
            data => {
                const candle = {
                    time: moment(data.k.t).unix(),
                    open: Number(data.k.o),
                    high: Number(data.k.h),
                    low: Number(data.k.l),
                    close: Number(data.k.c),
                }

                this.updateLatestCandle(candle)

                streamCallback(candle)
            },
        )
    }

    endCandleStream() {
        if (this.klineStreamId) {
            this.streamHub.closeStream(this.klineStreamId)
            this.klineStreamId = 0
        }
    }

    async startHeatStream(startCallback, streamCallback) {
        const colors = {
            bids: [
                'rgba(0, 76, 153, .65)', // 300k
                'rgba(0, 102, 204, .65)', // 500k
                'rgba(0, 128, 255, .65)', // 1m
                'rgba(51, 153, 255, .65)', // 2m
                'rgba(0, 204, 204, .65)', // 3m
                'rgba(0, 255, 255, .65)', // 5m
                'rgba(51, 255, 255, .65)', // 10m
                'rgba(102, 255, 255, .65)', // 20m
                'rgba(204, 255, 255, .65)', // 30m
            ],
            asks: [
                'rgba(153, 76, 0, .65)', // 300k
                'rgba(204, 102, 0, .65)', // 500k
                'rgba(255, 128, 0, .65)', // 1m
                'rgba(255, 153, 51, .65)', // 2m
                'rgba(204, 204, 0, .65)', // 3m
                'rgba(255, 255, 0, .65)', // 5m
                'rgba(255, 255, 51, .65)', // 10m
                'rgba(255, 255, 102, .65)', // 20m
                'rgba(255, 255, 204, .65)', // 30m
            ],
        }
        const calcColor = (heatTotal, side = 'bids') => {
            return colors[side][(() => {
                switch (true) {
                    case heatTotal < 500000:
                        return 0
                    case heatTotal >= 500000 && heatTotal < 1000000:
                        return 1
                    case heatTotal >= 1000000 && heatTotal < 2000000:
                        return 2
                    case heatTotal >= 2000000 && heatTotal < 3000000:
                        return 3
                    case heatTotal >= 3000000 && heatTotal < 5000000:
                        return 4
                    case heatTotal >= 5000000 && heatTotal < 10000000:
                        return 5
                    case heatTotal >= 10000000 && heatTotal < 20000000:
                        return 6
                    case heatTotal >= 20000000 && heatTotal < 30000000:
                        return 7
                    default:
                        return 8
                }
            })()]
        }

        const calcHeatPrice = (price, side = 'bids') => (Math[side === 'bids' ? 'floor' : 'ceil'](price / this.info.heatSize) * this.info.heatSize).toFixed(num.precision(this.info.tickSize))

        // const makeBookOfHeatTradeCandles = async () => {
        //     const heatTradeBook = {
        //         asks: {}, // time => heatPrice => heatTotal
        //         bids: {},
        //     }
        //     const putInHeatTradeBook = (trade, side = 'bids') => {
        //         const time = this.interval.findOpenTimeOf(trade.T)
        //         if (!(time in heatTradeBook[side])) {
        //             heatTradeBook[side][time] = {}
        //         }
        //         const heatPrice = calcHeatPrice(Number(trade.p), side)
        //         if (!(heatPrice in heatTradeBook[side][time])) {
        //             heatTradeBook[side][time][heatPrice] = 0
        //         }
        //
        //         heatTradeBook[side][time][heatPrice] += Number(trade.p) * Number(trade.q)
        //     }
        //
        //     let minTime = this.interval.findOpenTimeOf(null, -1000) * 1000
        //     let endTime = this.interval.findOpenTimeOf() * 1000 - 1
        //     let ignoreAggTradeId = null
        //     while (endTime >= minTime) {
        //         const aggTrades = await this.apiHub.aggTrades(this.symbol, null, null, endTime)
        //         while (aggTrades.length) {
        //             const aggTrade = aggTrades.pop()
        //
        //             if (ignoreAggTradeId) {
        //                 if (aggTrade.a >= ignoreAggTradeId) {
        //                     continue
        //                 }
        //             }
        //
        //             putInHeatTradeBook(aggTrade, aggTrade.m ? 'bids' : 'asks')
        //
        //             endTime = aggTrade.T - 1
        //             if (endTime < minTime) {
        //                 break
        //             }
        //             ignoreAggTradeId = aggTrade.a
        //         }
        //
        //         await new Promise(resolve => setTimeout(() => resolve(), 1000))
        //     }
        //
        //     const makeCollectionOfHeatTradeCandles = (heatTrades, side = 'bids') => {
        //         const collectionOfHeatCandles = {}
        //         Object.keys(heatTrades).forEach(time => {
        //             Object.keys(heatTrades[time]).forEach(heatPrice => {
        //                 const heatTotal = heatTrades[time][heatPrice]
        //                 if (heatTotal < 300000) {
        //                     return
        //                 }
        //                 if (!(heatPrice in collectionOfHeatCandles)) {
        //                     collectionOfHeatCandles[heatPrice] = []
        //                 }
        //                 const color = calcColor(heatTotal, side)
        //                 const open = Number(heatPrice)
        //                 const close = Number((Number(heatPrice) + this.info.heatSize).toFixed(num.precision(this.info.tickSize)))
        //                 collectionOfHeatCandles[heatPrice].push({
        //                     time: time,
        //                     open: open,
        //                     high: close,
        //                     low: open,
        //                     close: close,
        //                     color: color,
        //                     borderColor: color,
        //                     wickColor: color,
        //                 })
        //             })
        //         })
        //         return collectionOfHeatCandles
        //     }
        //
        //     return {
        //         asks: makeCollectionOfHeatTradeCandles(heatTradeBook.asks, 'asks'),
        //         bids: makeCollectionOfHeatTradeCandles(heatTradeBook.bids),
        //     }
        // }

        // startCallback(await makeBookOfHeatTradeCandles())

        const aggregateOrdersByPrice = orders => {
            const aggregatedOrders = {} // price => quantity
            orders.forEach(order => {
                const price = Number(order[0]).toFixed(num.precision(this.info.tickSize))
                if (!(order[0] in aggregatedOrders)) {
                    aggregatedOrders[price] = 0
                }
                aggregatedOrders[price] += Number(order[1])
            })
            return aggregatedOrders
        }

        // const orderBook = await this.apiHub.depth(this.symbol)
        //     .then(data => ({
        //         asks: aggregateOrdersByPrice(data.asks), // seller
        //         bids: aggregateOrdersByPrice(data.bids), // buyer
        //     }))
        const orderBook = {
            asks: {},
            bids: {},
        }

        const updateOrderBook = updatingOrderBook => {
            const updateSide = side => {
                Object.keys(updatingOrderBook[side]).forEach(price => {
                    const updatingQuantity = updatingOrderBook[side][price]
                    if (updatingQuantity === 0) {
                        delete orderBook[side][price]
                    }
                    else {
                        orderBook[side][price] = updatingQuantity
                    }
                })
            }
            updateSide('asks')
            updateSide('bids')
        }

        const makeBookOfHeatOrderCandles = () => {
            const calcHeatOrders = (orders, side = 'bids') => {
                const heatOrders = {} // heatPrice => heatTotal
                Object.keys(orders).forEach(price => {
                    const heatPrice = calcHeatPrice(Number(price), side)
                    if (!(heatPrice in heatOrders)) {
                        heatOrders[heatPrice] = {
                            quantity: 0,
                            total: 0,
                        }
                    }
                    heatOrders[heatPrice].quantity += Number(orders[price])
                    heatOrders[heatPrice].total += Number(price) * Number(orders[price])
                })
                return heatOrders
            }

            const makeCollectionOfHeatOrderCandles = (heatOrders, side = 'bids') => {
                const collectionOfHeatCandles = {}
                Object.keys(heatOrders).forEach(heatPrice => {
                    const heatTotal = heatOrders[heatPrice].total
                    if (heatTotal < 300000) {
                        return
                    }
                    if (!(heatPrice in collectionOfHeatCandles)) {
                        collectionOfHeatCandles[heatPrice] = {
                            candles: [],
                            markers: [],
                        }
                    }
                    const color = calcColor(heatTotal, side)
                    const open = Number(heatPrice)
                    const close = Number((Number(heatPrice) + this.info.heatSize).toFixed(num.precision(this.info.tickSize)))
                    collectionOfHeatCandles[heatPrice].candles.push({
                        time: this.info.nextIntervalTime,
                        open: open,
                        high: close,
                        low: open,
                        close: close,
                        color: color,
                        borderColor: color,
                        wickColor: color,
                    })
                    collectionOfHeatCandles[heatPrice].markers.push({
                        time: this.info.nextIntervalTime,
                        position: 'inBar',
                        color: 'rgba(255, 255, 255, 0.85)',
                        text: new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 2,
                        }).format(heatTotal) + ' ' + `(${heatOrders[heatPrice].quantity.toFixed(2)})`,
                    })
                })
                return collectionOfHeatCandles
            }

            return {
                asks: makeCollectionOfHeatOrderCandles(calcHeatOrders(orderBook.asks, 'asks'), 'asks'),
                bids: makeCollectionOfHeatOrderCandles(calcHeatOrders(orderBook.bids)),
            }
        }

        this.depthStreamId = this.streamHub.openStream(
            `${this.symbol.toLowerCase()}@depth`,
            data => {
                updateOrderBook({
                    asks: aggregateOrdersByPrice(data.a), // seller
                    bids: aggregateOrdersByPrice(data.b), // buyer
                })

                streamCallback(orderBook, makeBookOfHeatOrderCandles())
            },
        )
    }

    endHeatStream() {
        if (this.depthStreamId) {
            this.streamHub.closeStream(this.depthStreamId)
            this.depthStreamId = 0
        }
    }
}