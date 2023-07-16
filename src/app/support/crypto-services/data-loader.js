export class DataLoader
{
    constructor(symbol = 'BTCUSDT', interval = '1d') {
        this.symbol = symbol
        this.interval = interval
        this.info = {
            tickSize: 1,
            latestCandle: 0,
            heatSize: 0,
        }
        this.socket = null
        this.heatBookSocket = null
    }

    async init() {
        const info = await new Promise(resolve => resolve({
            tickSize: 1,
        }))
        this.info.tickSize = info.tickSize
    }

    updateLatestCandle(latestCandle) {
        this.info.latestCandle = latestCandle
        this.info.heatSize =
            (heatSize => (heatSize <= 1000 ? 10 : heatSize / 100) * this.info.tickSize)(Math.pow(10, Math.floor(Math.log10(this.info.latestCandle.close / this.info.tickSize))))
    }

    async fetchCandles() {
        const candles = await new Promise(resolve => resolve([{
            time: '',
            open: 0,
            high: 0,
            low: 0,
            close: 0,
        }]))

        this.updateLatestCandle(candles[candles.length - 1])
        return candles
    }

    startCandleStream() {

    }

    endCandleStream() {

    }
}