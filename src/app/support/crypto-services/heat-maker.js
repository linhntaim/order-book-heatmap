import {num} from '@/app/support/helpers'

export class HeatMaker
{
    constructor() {
        this.colors = {
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
    }

    setLatestCandle(latestCandle) {
        this.latestCandle = latestCandle
        return this
    }

    setTickerSize(tickerSize) {
        this.tickerSize = tickerSize
        return this
    }

    calcColor(heatTotal, side = 'bids') {
        return this.colors[side][(() => {
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

    calcHeatPrice(price, side = 'bids') {
        return (Math[side === 'bids' ? 'floor' : 'ceil'](price / this.latestCandle.heatSize) * this.latestCandle.heatSize).toFixed(num.precision(this.tickerSize))
    }

    aggregateOrdersByHeat(orders, side = 'bids') {
        const heatOrders = {} // heatPrice => {quantity, total}
        Object.keys(orders).forEach(price => {
            const heatPrice = this.calcHeatPrice(Number(price), side)
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

    makeHeatSideCollection(heatOrders, side = 'bids') {
        const heatSideCollection = {}
        Object.keys(heatOrders).forEach(heatPrice => {
            const heatTotal = heatOrders[heatPrice].total
            if (heatTotal < 300000) {
                return
            }
            if (!(heatPrice in heatSideCollection)) {
                heatSideCollection[heatPrice] = {
                    candles: [],
                    markers: [],
                }
            }
            const color = this.calcColor(heatTotal, side)
            const open = Number(heatPrice)
            const close = Number((Number(heatPrice) + this.latestCandle.heatSize).toFixed(num.precision(this.tickerSize)))
            heatSideCollection[heatPrice].candles.push({
                time: this.latestCandle.nextIntervalTime,
                open: open,
                high: close,
                low: open,
                close: close,
                color: color,
                borderColor: color,
                wickColor: color,
            })
            heatSideCollection[heatPrice].markers.push({
                time: this.latestCandle.nextIntervalTime,
                position: 'inBar',
                color: 'rgba(255, 255, 255, 0.85)',
                text: new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 2,
                }).format(heatTotal) + ' ' + `(${heatOrders[heatPrice].quantity.toFixed(2)})`,
            })
        })
        return heatSideCollection
    }

    makeHeatBook(orderBook) {
        return {
            asks: this.makeHeatSideCollection(this.aggregateOrdersByHeat(orderBook.asks, 'asks'), 'asks'),
            bids: this.makeHeatSideCollection(this.aggregateOrdersByHeat(orderBook.bids)),
        }
    }
}