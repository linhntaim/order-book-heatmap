<template lang="pug">
.wrapper.vw-100.vh-100
    .chart-container(ref="chartContainer")
    .order-book.small
        .order-book-list.order-book-ask
            .order-book-row.d-flex(v-for="(amount, price) in orderBook.asks")
                .order-book-col.text-danger
                    | {{ price }}
                .order-book-col
                    | {{ amount.toFixed(4) }}
        .order-book-list.order-book-bid
            .order-book-row.d-flex(v-for="(amount, price) in orderBook.bids")
                .order-book-col.text-success
                    | {{ price }}
                .order-book-col
                    | {{ amount.toFixed(4) }}
</template>

<script>
import {createChart, CrosshairMode} from 'lightweight-charts'
import {num, obj} from '@/app/support/helpers'
import {BinanceDataHub} from '@/app/support/crypto-services'

let chart, priceSeries, dataHub, collectionOfHeatSeries = []

export default {
    // eslint-disable-next-line
    name: 'Chart',
    data() {
        return {
            type: 'Candlestick',
            exchange: this.$route.params.exchange,
            symbol: this.$route.params.symbol,
            interval: this.$route.params.interval,

            orderBook: {
                asks: {},
                bids: {},
            },
        }
    },
    mounted() {
        if (!this.symbol.endsWith('USDT')) {
            this.$router.push({name: 'not_found'})
            return
        }
        this.construct()
    },
    unmounted() {
        this.destruct()
    },
    methods: {
        async construct() {
            await this.createDataHub()
            this.createChart()
            await this.createPriceSeries()
            await this.createCollectionOfHeatSeries()
        },
        destruct() {
            this.removeDataHub()
            this.removeCollectionOfHeatSeries()
            this.removePriceSeries()
            this.removeChart()
        },
        async createDataHub() {
            const hub = (() => {
                switch (this.exchange) {
                    case 'binance':
                    default:
                        return new BinanceDataHub(this.symbol, this.interval)
                }
            })()

            await hub.init()

            dataHub = hub
        },
        removeDataHub() {
            if (dataHub) {
                dataHub.endCandleStream()
                dataHub.endHeatStream()
                dataHub = null
            }
        },
        createChart() {
            chart = createChart(this.$refs.chartContainer, {
                autoSize: true,
                layout: {
                    background: 'rgb(20, 24, 35)',
                    textColor: 'rgb(172, 175, 184)',
                },
                grid: {
                    vertLines: {
                        color: 'rgb(34, 38, 49)',
                    },
                    horzLines: {
                        color: 'rgb(34, 38, 49)',
                    },
                },
                rightPriceScale: {
                    borderColor: 'rgb(34, 38, 49)',
                },
                crosshair: {
                    mode: CrosshairMode.Normal,
                },
                timeScale: {
                    timeVisible: true,
                    borderColor: 'rgb(34, 38, 49)',
                    rightOffset: 50,
                },
            })
        },
        removeChart() {
            if (chart) {
                chart.remove()
                chart = null
            }
        },
        async createPriceSeries() {
            priceSeries = chart.addCandlestickSeries({
                priceFormat: {
                    precision: num.precision(dataHub.info.tickSize),
                    minMove: dataHub.info.tickSize,
                },
            })

            await dataHub.startCandleStream(
                candles => {
                    priceSeries.setData(candles)
                    chart.applyOptions({
                        rightPriceScale: {
                            autoScale: false,
                        },
                    })
                },
                candle => priceSeries.update(candle),
            )
        },
        removePriceSeries() {
            if (priceSeries) {
                chart.removeSeries(priceSeries)
                priceSeries = null
            }
        },
        async createCollectionOfHeatSeries() {
            await dataHub.startHeatStream(
                bookOfHeatTradeCandles => {
                    console.log(bookOfHeatTradeCandles)
                },
                (orderBook, bookOfHeatOrderCandles) => {
                    this.removeCollectionOfHeatSeries()

                    this.orderBook.asks = obj.sortByKey(orderBook.asks, 'asc', 'number')
                    this.orderBook.bids = obj.sortByKey(orderBook.bids, 'desc', 'number')

                    this.createBookOfHeatSeries(bookOfHeatOrderCandles)
                },
            )
        },
        createBookOfHeatSeries(bookOfHeatCandles) {
            const createHeatSeries = heatCandles => {
                const heatSeries = chart.addCandlestickSeries({
                    priceLineVisible: false,
                    lastValueVisible: false,
                })
                heatSeries.setData(heatCandles.candles)
                heatSeries.setMarkers(heatCandles.markers)
                return heatSeries
            }
            const createCollectionOfHeatSeries = (collectionOfHeatCandles) => {
                Object.keys(collectionOfHeatCandles).forEach(
                    heatPrice => collectionOfHeatSeries.push(
                        createHeatSeries(collectionOfHeatCandles[heatPrice]),
                    ),
                )
            }

            createCollectionOfHeatSeries(bookOfHeatCandles.asks)
            createCollectionOfHeatSeries(bookOfHeatCandles.bids)
        },
        removeCollectionOfHeatSeries() {
            collectionOfHeatSeries.forEach(heatSeries => {
                chart.removeSeries(heatSeries)
            })
            collectionOfHeatSeries = []
        },
    },
}
</script>

<style lang="scss" scoped>
.wrapper {
    position: relative;
    background: rgb(22, 26, 30);
}

.chart-container {
    position: absolute;
    top: 0;
    left: 0;
    width: calc(100% - 320px);
    height: 100%;
}

.order-book {
    position: absolute;
    top: 0;
    right: 0;
    width: 320px;
    height: 100%;
    display: flex;
    flex-direction: column;
    color: #ffffff;
}

.order-book-list {
    height: 50%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.order-book-ask {
    flex-direction: column-reverse;
}

.order-book-bid {
}

.order-book-row {
    padding: 0.125rem 1rem;
}

.order-book-col {
    flex: 1 1 0;

    &:not(:first-child) {
        margin-left: 4px;
        text-align: right;
    }
}
</style>
