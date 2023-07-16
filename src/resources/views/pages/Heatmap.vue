<template lang="pug">
.vw-100.vh-100.chart-container(ref="chartContainer")
</template>

<script>
import {createChart, CrosshairMode} from 'lightweight-charts'
import {BinanceDataLoader} from '@/app/support/crypto-services'
import {num} from '@/app/support/helpers'

let chart, priceSeries, dataLoader, collectionOfHeatSeries = []

export default {
    // eslint-disable-next-line
    name: 'Chart',
    data() {
        return {
            type: 'Candlestick',
            exchange: this.$route.params.exchange,
            symbol: this.$route.params.symbol,
            interval: this.$route.params.interval,
        }
    },
    mounted() {
        this.construct()
    },
    unmounted() {
        this.destruct()
    },
    methods: {
        async construct() {
            await this.createDataLoader()
            this.createChart()
            await this.createPriceSeries()
            await this.createCollectionOfHeatSeries()
        },
        destruct() {
            this.removeDataLoader()
            this.removeCollectionOfHeatSeries()
            this.removePriceSeries()
            this.removeChart()
        },
        async createDataLoader() {
            const loader = (() => {
                switch (this.exchange) {
                    case 'binance':
                    default:
                        return new BinanceDataLoader(this.symbol, this.interval)
                }
            })()

            await loader.init()

            dataLoader = loader
        },
        removeDataLoader() {
            if (dataLoader) {
                dataLoader.endCandleStream()
                dataLoader.endHeatBookStream()
                dataLoader = null
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
                    precision: num.precision(dataLoader.info.tickSize),
                    minMove: dataLoader.info.tickSize,
                },
            })
            priceSeries.setData(await dataLoader.fetchCandles())

            dataLoader.startCandleStream(data => priceSeries.update(data))
        },
        removePriceSeries() {
            if (priceSeries) {
                chart.removeSeries(priceSeries)
                priceSeries = null
            }
        },
        async createCollectionOfHeatSeries() {
            await dataLoader.startHeatBookStream(collectionOfHeatCandles => {
                this.removeCollectionOfHeatSeries()

                const createSeries = (candles, side = 'bids') => {
                    const series = chart.addCandlestickSeries({
                        priceLineVisible: false,
                        lastValueVisible: false,
                    })
                    series.setData(candles.data.map(candle => {
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
                        const color = colors[side][(() => {
                            switch (true) {
                                case candles.fiat < 500000:
                                    return 0
                                case candles.fiat >= 500000 && candles.fiat < 1000000:
                                    return 1
                                case candles.fiat >= 1000000 && candles.fiat < 2000000:
                                    return 2
                                case candles.fiat >= 2000000 && candles.fiat < 3000000:
                                    return 3
                                case candles.fiat >= 3000000 && candles.fiat < 5000000:
                                    return 4
                                case candles.fiat >= 5000000 && candles.fiat < 10000000:
                                    return 5
                                case candles.fiat >= 10000000 && candles.fiat < 20000000:
                                    return 6
                                case candles.fiat >= 20000000 && candles.fiat < 30000000:
                                    return 7
                                default:
                                    return 8
                            }
                        })()]
                        candle.color = color
                        candle.borderColor = color
                        candle.wickColor = color
                        return candle
                    }))
                    return series
                }

                const createCollectionOfSeries = (collectionOfCandles, side = 'bids') => {
                    Object.keys(collectionOfCandles).forEach(key => collectionOfHeatSeries.push(createSeries(collectionOfCandles[key], side)))
                }

                createCollectionOfSeries(collectionOfHeatCandles.bids)
                createCollectionOfSeries(collectionOfHeatCandles.asks, 'asks')
            })
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
.chart-container {
    background: rgb(65, 78, 112);
}
</style>
