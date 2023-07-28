export class HeatMaker
{
    constructor() {
        this.invert = false
        this.colors = {
            bids: [
                'rgba(0, 20, 80, 1.0)', // 100k
                'rgba(0, 40, 100, 1.0)', // 200k
                'rgba(0, 60, 120, 1.0)', // 300k
                'rgba(0, 80, 140, 1.0)', // 500k

                'rgba(40, 100, 160, 1.0)', // 1m
                'rgba(60, 120, 160, 1.0)', // 2m
                'rgba(80, 140, 160, 1.0)', // 3m
                'rgba(100, 160, 160, 1.0)', // 5m

                'rgba(140, 180, 180, 1.0)', // 10m
                'rgba(160, 200, 200, 1.0)', // 20m
                'rgba(180, 220, 220, 1.0)', // 30m
                'rgba(200, 240, 240, 1.0)', // 50m
            ],
            asks: [
                'rgba(80, 20, 0, 1.0)', // 100k
                'rgba(100, 40, 0, 1.0)', // 200k
                'rgba(120, 60, 0, 1.0)', // 300k
                'rgba(140, 80, 0, 1.0)', // 500k

                'rgba(160, 100, 40, 1.0)', // 1m
                'rgba(160, 120, 60, 1.0)', // 2m
                'rgba(160, 140, 80, 1.0)', // 3m
                'rgba(160, 160, 100, 1.0)', // 5m

                'rgba(180, 180, 140, 1.0)', // 10m
                'rgba(200, 200, 160, 1.0)', // 20m
                'rgba(220, 220, 180, 1.0)', // 30m
                'rgba(240, 240, 200, 1.0)', // 50m
            ],
        }
    }

    setLatestCandle(latestCandle) {
        this.latestCandle = latestCandle
        return this
    }

    setTickerSize(tickerSize) {
        this.tickerSize = tickerSize
        this.usdFormatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: this.tickerSize.precision,
        })
        return this
    }

    calcColorIndex(heatTotal, side = 'bids') {
        return (index => this.invert ? this.colors[side].length - 1 - index : index)((() => {
            switch (true) {
                case heatTotal < 200000:
                    return 0
                case heatTotal >= 200000 && heatTotal < 300000:
                    return 1
                case heatTotal >= 300000 && heatTotal < 500000:
                    return 2
                case heatTotal >= 500000 && heatTotal < 1000000:
                    return 3
                case heatTotal >= 1000000 && heatTotal < 2000000:
                    return 4
                case heatTotal >= 2000000 && heatTotal < 3000000:
                    return 5
                case heatTotal >= 3000000 && heatTotal < 5000000:
                    return 6
                case heatTotal >= 5000000 && heatTotal < 10000000:
                    return 7
                case heatTotal >= 10000000 && heatTotal < 20000000:
                    return 8
                case heatTotal >= 20000000 && heatTotal < 30000000:
                    return 9
                case heatTotal >= 30000000 && heatTotal < 50000000:
                    return 10
                default:
                    return 11
            }
        })())
    }

    calcColor(heatTotal, side = 'bids') {
        return this.colors[side][this.calcColorIndex(heatTotal, side)]
    }

    calcHeatPrice(price, side = 'bids') {
        return (Math[side === 'bids' ? 'floor' : 'ceil'](price / this.latestCandle.heatSize) * this.latestCandle.heatSize).toFixed(this.tickerSize.precision)
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
            const heatQuantity = heatOrders[heatPrice].quantity
            if (heatTotal < 100000) {
                return
            }
            if (!(heatPrice in heatSideCollection)) {
                heatSideCollection[heatPrice] = {
                    candles: [],
                    // markers: [],
                    data: [],
                }
            }
            const color = this.calcColor(heatTotal, side)
            const open = Number(heatPrice)
            const close = open + this.latestCandle.heatSize
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
            const heatTotalText = this.usdFormatter.format(heatTotal)
            const heatQuantityText = heatQuantity.toFixed(this.tickerSize.precision)
            // heatSideCollection[heatPrice].markers.push({
            //     time: this.latestCandle.nextIntervalTime,
            //     position: 'inBar',
            //     color: 'rgba(255, 255, 255, 1.0)',
            //     text: `${heatTotalText} (${heatQuantityText})`,
            // })
            heatSideCollection[heatPrice].data.push({
                price: open,
                priceText: heatPrice,
                color: color,
                total: heatTotal,
                quantity: heatQuantity,
                totalText: heatTotalText,
                quantityText: heatQuantityText,
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