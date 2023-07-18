import {Interval} from '@/app/support/crypto-services/interval'

export class DataHub
{
    constructor(symbol = 'BTCUSDT', interval = '1d') {
        this.symbol = symbol
        this.interval = new Interval(interval)
        this.info = {
            tickSize: 1,
            latestCandle: 0,
            heatSize: 0,
        }
    }

    async init() {
        this.info.tickSize = await new Promise(resolve => resolve(1))
    }

    updateLatestCandle(latestCandle) {
        this.info.latestCandle = latestCandle
        this.info.heatSize =
            (heatSize => (heatSize <= 1000 ? 10 : heatSize / 100) * this.info.tickSize)(Math.pow(10, Math.floor(Math.log10(this.info.latestCandle.close / this.info.tickSize))))
    }

    // eslint-disable-next-line no-unused-vars
    async startCandleStream(startCallback, streamCallback) {

    }

    endCandleStream() {

    }

    // eslint-disable-next-line no-unused-vars
    async startHeatStream(startCallback, streamCallback) {
    }

    endHeatStream() {
    }
}