<template lang="pug">
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

let chart, priceSeries, dataHub, heatBookSeries = []

export default {
    // eslint-disable-next-line
    name: 'Chart',
    data() {
        return {
            type: 'Candlestick',
            exchange: this.$route.params.exchange,
            baseSymbol: this.$route.params.baseSymbol.toUpperCase(),
            quoteSymbol: this.$route.params.quoteSymbol.toUpperCase(),
            interval: this.$route.params.interval,

            orderBook: {
                asks: {},
                bids: {},
            },
        }
    },
    mounted() {
        if (this.quoteSymbol !== 'USDT') {
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
                    rightOffset: 20,
                },
            })
        },
        removeChart() {
            if (chart) {
                chart.remove()
                chart = null
            }
        },
        createSeries() {
            dataHub.on(
                startingCandles => {
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
                    priceSeries.update(updatingCandle)
                },
                heatBook => {
                    this.removeHeatBookSeries()
                    this.createHeatSideSeries(heatBook.asks)
                    this.createHeatSideSeries(heatBook.bids)
                },
            )
        },
        createHeatSideSeries(heatSideCollection) {
            Object.keys(heatSideCollection).forEach(
                heatPrice => {
                    const heatSideItem = heatSideCollection[heatPrice]
                    const heatSeries = chart.addCandlestickSeries({
                        priceLineVisible: false,
                        lastValueVisible: false,
                    })
                    heatSeries.setData(heatSideItem.candles)
                    heatSeries.setMarkers(heatSideItem.markers)
                    heatBookSeries.push(heatSeries)
                },
            )
        },
        removeHeatBookSeries() {
            heatBookSeries.forEach(heatSeries => {
                chart.removeSeries(heatSeries)
            })
            heatBookSeries = []
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
.chart-container {
    background: rgb(22, 26, 30);
}
</style>
