import {DataHub as BinanceDataHub} from '@/app/support/crypto-services/binance/data-hub'

export class DataHubFactory
{
    /**
     *
     * @param {String} exchange
     * @param {String} baseSymbol
     * @param {String} quoteSymbol
     * @param {String} interval
     * @returns {Promise<DataHub|null>}
     */
    static async create(exchange = 'binance', baseSymbol = 'BTC', quoteSymbol = 'USDT', interval = '1d') {
        const hub = (() => {
            switch (exchange) {
                case 'binance':
                    return new BinanceDataHub(baseSymbol, quoteSymbol, interval)
                default:
                    throw `Exchange ${exchange} not supported`
            }
        })()
        await hub.init()
        return hub
    }
}