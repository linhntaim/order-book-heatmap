<template lang="pug">
.chart-wrapper.vw-100.vh-100
    .legend-container
        .legend
            span.legend-inner
                span.legend-primary.text-nowrap {{ baseSymbol }} / {{ quoteSymbol }} &#183; {{ interval }} &#183; {{ exchange }}
                span.legend-secondary.legend-group
                    span.legend-group-item
                        | O
                        span(:style="{color: color}") {{ open }}
                    span.legend-group-item
                        | H
                        span(:style="{color: color}") {{ high }}
                    span.legend-group-item
                        | L
                        span(:style="{color: color}") {{ low }}
                    span.legend-group-item
                        | C
                        span(:style="{color: color}") {{ close }}
        .legend
            span.legend-inner
                span.legend-primary Top Ask
                span.legend-secondary.legend-group(:style="{color: top.asks.color}")
                    span.legend-group-item {{ top.asks.totalText }}
                    span.legend-group-item {{ top.asks.quantityText }}
                    span.legend-group-item {{ top.asks.priceText }}
        .legend
            span.legend-inner
                span.legend-primary Top Bid
                span.legend-secondary.legend-group(:style="{color: top.bids.color}")
                    span.legend-group-item {{ top.bids.totalText }}
                    span.legend-group-item {{ top.bids.quantityText }}
                    span.legend-group-item {{ top.bids.priceText }}
        .legend
            span.legend-inner
                span.legend-primary Largest Ask
                span.legend-secondary.legend-group(:style="{color: largest.asks.color}")
                    span.legend-group-item {{ largest.asks.totalText }}
                    span.legend-group-item {{ largest.asks.quantityText }}
                    span.legend-group-item {{ largest.asks.priceText }}
        .legend
            span.legend-inner
                span.legend-primary Largest Bid
                span.legend-secondary.legend-group(:style="{color: largest.bids.color}")
                    span.legend-group-item {{ largest.bids.totalText }}
                    span.legend-group-item {{ largest.bids.quantityText }}
                    span.legend-group-item {{ largest.bids.priceText }}
    .chart-container.vw-100.vh-100(ref="chartContainer")
#reloadModal.modal.fade(tabindex="-1" data-bs-backdrop="static")
    .modal-dialog
        .modal-content
            .modal-body.text-center
                | Welcome back.
                br
                br
                | Page is being reload to fetch fresh data...
</template>

<script>
import {createChart, CrosshairMode} from 'lightweight-charts'
import {num} from '@/app/support/helpers'
import {DataHubFactory} from '@/app/support/crypto-services/data-hub-factory'
import formfactor from 'platform-detect/formfactor.mjs'

let chart, priceSeries, dataHub, heatBookSeries = {asks: {}, bids: {}}

export default {
    // eslint-disable-next-line
    name: 'Chart',
    data() {
        return {
            head: {
                title: 'Heatmap',
            },

            type: 'Candlestick',
            exchange: this.$route.params.exchange.toUpperCase(),
            baseSymbol: this.$route.params.baseSymbol.toUpperCase(),
            quoteSymbol: this.$route.params.quoteSymbol.toUpperCase(),
            interval: this.$route.params.interval,

            open: '0',
            low: '0',
            high: '0',
            close: '0',
            color: '#26a69a',

            top: {
                asks: {
                    priceText: '0',
                    color: '#ffffff',
                    totalText: '0',
                    quantityText: '0',
                },
                bids: {
                    priceText: '0',
                    color: '#ffffff',
                    totalText: '0',
                    quantityText: '0',
                },
            },
            largest: {
                asks: {
                    priceText: '0',
                    color: '#ffffff',
                    totalText: '0',
                    quantityText: '0',
                },
                bids: {
                    priceText: '0',
                    color: '#ffffff',
                    totalText: '0',
                    quantityText: '0',
                },
            },

            crosshairMovingInTime: false,
        }
    },
    head() {
        return {
            title: this.head.title,
        }
    },
    mounted() {
        if (!['USDT', 'USD', 'BUSD', 'TUSD'].includes(this.quoteSymbol)) {
            this.$router.push({name: 'not_found'})
            return
        }

        this.$bus.on('pageVisible', this.reload)

        this.construct()
    },
    unmounted() {
        this.$bus.off('pageVisible', this.reload)

        this.destruct()
    },
    methods: {
        reload() {
            if (['phone', 'tablet'].includes(formfactor.formfactor)) {
                // On mobile devices, data streams will be disrupted while the page goes inactive.
                // We need to reload page when users get back to make sure everything works normally.
                const reloadModal = window.bootstrap.Modal.getOrCreateInstance('#reloadModal')
                if (!reloadModal._isShown) {
                    reloadModal._element.addEventListener('shown.bs.modal', () => setTimeout(() => window.location.reload(), 1000))
                    reloadModal.show()
                }
            }
        },
        async construct() {
            await this.createDataHub()
            this.createChart()
            await this.createSeries()
        },
        destruct() {
            this.removeDataHub()
            this.removeSeries()
            this.removeChart()
        },
        async createDataHub() {
            dataHub = await DataHubFactory.create(this.exchange, this.baseSymbol, this.quoteSymbol, this.interval)
        },
        removeDataHub() {
            if (dataHub) {
                dataHub.off()
                dataHub = null
            }
        },
        createChart() {
            chart = createChart(this.$refs.chartContainer, {
                autoSize: true,
                layout: {
                    background: {
                        color: 'rgb(21, 25, 36)',
                    },
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
                    autoScale: true,
                },
                crosshair: {
                    mode: CrosshairMode.Normal,
                },
                timeScale: {
                    timeVisible: true,
                    borderColor: 'rgb(34, 38, 49)',
                    rightOffset: 20,
                },
            })
            chart.subscribeCrosshairMove(this.listenToCrosshairMove)
        },
        listenToCrosshairMove(param) {
            if (param.time && param.time <= dataHub.latestCandle.candle.time) {
                this.crosshairMovingInTime = true
                this.updateCandleOnLegend(param.seriesData.get(priceSeries))
            }
            else {
                this.crosshairMovingInTime = false
                this.updateLatestCandleToLegend()
            }
        },
        removeChart() {
            if (chart) {
                chart.unsubscribeCrosshairMove(this.listenToCrosshairMove)
                chart.remove()
                chart = null
            }
        },
        updateCandleOnLegend(candle) {
            if (candle) {
                const precision = num.precision(dataHub.tickerSize)
                this.open = candle.open.toFixed(precision)
                this.high = candle.high.toFixed(precision)
                this.low = candle.low.toFixed(precision)
                this.close = candle.close.toFixed(precision)
                this.color = candle.close >= candle.open ? '#26a69a' : '#ef5350'
                return true
            }
            return false
        },
        updateLatestCandleToLegend() {
            if (!this.crosshairMovingInTime) {
                return this.updateCandleOnLegend(dataHub?.latestCandle.candle)
            }
            return false
        },
        createSeries() {
            const numFormatter = new Intl.NumberFormat('en-US', {
                maximumFractionDigits: num.precision(dataHub.tickerSize),
                minimumFractionDigits: num.precision(dataHub.tickerSize),
            })
            const updateTitle = () => {
                this.head.title = `${numFormatter.format(dataHub.latestCandle.candle.close)} ${this.baseSymbol}/${this.quoteSymbol}`
            }
            dataHub.on(
                startingCandles => {
                    updateTitle()
                    this.updateLatestCandleToLegend()

                    priceSeries = chart.addCandlestickSeries({
                        priceFormat: {
                            precision: num.precision(dataHub.tickerSize),
                            minMove: dataHub.tickerSize,
                        },
                    })
                    priceSeries.setData(startingCandles)
                    chart.applyOptions({
                        rightPriceScale: {
                            autoScale: false,
                        },
                    })
                },
                updatingCandle => {
                    updateTitle()
                    this.updateLatestCandleToLegend()

                    priceSeries.update(updatingCandle)
                },
                heatBook => {
                    this.createHeatSideSeries(heatBook.asks, 'asks')
                    this.createHeatSideSeries(heatBook.bids, 'bids')
                },
            )
        },
        createHeatSideSeries(heatSideCollection, side = 'bids') {
            const oldHeatPrices = Object.keys(heatBookSeries[side])

            const topHeat = {
                price: -1,

                priceText: '0',
                color: '#ffffff',
                totalText: '0',
                quantityText: '0',
            }
            const largestHeat = {
                total: 0,

                priceText: '0',
                color: '#ffffff',
                totalText: '0',
                quantityText: '0',
            }
            Object.keys(heatSideCollection).forEach(
                heatPrice => {
                    const heatSideItem = heatSideCollection[heatPrice]

                    const price = heatSideItem.data[0].price
                    if (topHeat.price === -1
                        || ((side === 'asks' && price < topHeat.price)
                            || (side === 'bids' && price > topHeat.price))
                    ) {
                        topHeat.price = price

                        topHeat.priceText = heatSideItem.data[0].priceText
                        topHeat.color = heatSideItem.data[0].color
                        topHeat.totalText = heatSideItem.data[0].totalText
                        topHeat.quantityText = heatSideItem.data[0].quantityText
                    }
                    const total = heatSideItem.data[0].total
                    if (total > largestHeat.total) {
                        largestHeat.total = total

                        largestHeat.priceText = heatSideItem.data[0].priceText
                        largestHeat.color = heatSideItem.data[0].color
                        largestHeat.totalText = heatSideItem.data[0].totalText
                        largestHeat.quantityText = heatSideItem.data[0].quantityText
                    }

                    const found = oldHeatPrices.indexOf(heatPrice)
                    if (found === -1) { // not found - create new
                        const heatSeries = chart.addCandlestickSeries({
                            priceLineVisible: false,
                            lastValueVisible: false,
                        })
                        heatSeries.setData(heatSideItem.candles)
                        heatSeries.setMarkers(heatSideItem.markers)
                        heatBookSeries[side][heatPrice] = heatSeries
                    }
                    else { // found - update
                        const heatSeries = heatBookSeries[side][heatPrice]
                        heatSeries.setData(heatSideItem.candles)
                        heatSeries.setMarkers(heatSideItem.markers)
                        heatSeries.applyOptions({
                            visible: true,
                        })

                        oldHeatPrices.splice(found, 1)
                    }
                },
            )
            this.top[side].priceText = topHeat.priceText
            this.top[side].color = topHeat.color
            this.top[side].totalText = topHeat.totalText
            this.top[side].quantityText = topHeat.quantityText
            this.largest[side].priceText = largestHeat.priceText
            this.largest[side].color = largestHeat.color
            this.largest[side].totalText = largestHeat.totalText
            this.largest[side].quantityText = largestHeat.quantityText

            // hide old which not updated
            oldHeatPrices.forEach(heatPrice => {
                heatBookSeries[side][heatPrice].applyOptions({
                    visible: false,
                })
            })
        },
        removeHeatSideSeries(heatSideSeries) {
            Object.keys(heatSideSeries).forEach(heatPrice => {
                chart.removeSeries(heatSideSeries[heatPrice])
                delete heatBookSeries[heatPrice]
            })
        },
        removeHeatBookSeries() {
            this.removeHeatSideSeries(heatBookSeries.asks)
            this.removeHeatSideSeries(heatBookSeries.bids)
        },
        removeSeries() {
            if (priceSeries) {
                chart.removeSeries(priceSeries)
                priceSeries = null
            }
            this.removeHeatBookSeries()
        },
    },
}
</script>

<style lang="scss" scoped>
.chart-wrapper {
    background: rgb(21, 25, 36);
    color: rgb(172, 175, 184);
}

.chart-container {
    cursor: crosshair;
}

.legend-container {
    position: absolute;
    z-index: 3;
    pointer-events: none;
    user-select: none;
    color: #ecececff;
    padding: .5rem;
}

.legend {
    &:not(:first-child) {
        margin-top: .5rem;
        font-size: .85rem;

        .legend-secondary {
            font-size: .85rem;
        }
    }
}

.legend-inner {
    display: inline-block;
    cursor: default;
    pointer-events: auto;
    background: rgba(19, 23, 34, .7);
}

.legend-primary {
    display: inline-block;
    padding: 0 .3rem;
    border: 1px solid transparent;
    border-radius: .375rem;

    &:hover {
        background: rgb(19, 23, 34);
        border-color: rgb(54, 58, 69);
    }
}

.legend-secondary {
    display: inline-block;
    padding: 0 .3rem;
    font-size: .875rem;
}

.legend-group-item {
    &:not(:first-child) {
        margin-left: .3rem;
    }
}

@media (max-width: 767px) {
    .legend-secondary {
        display: block;
    }
}
</style>
