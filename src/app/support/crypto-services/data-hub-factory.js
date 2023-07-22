import {DataHub as BinanceDataHub} from '@/app/support/crypto-services/binance/data-hub'
import {DataHub as CoinbaseDataHub} from '@/app/support/crypto-services/coinbase/data-hub'
import {DataHub as OkxDataHub} from '@/app/support/crypto-services/okx/data-hub'

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
    static async create(exchange = 'BINANCE', baseSymbol = 'BTC', quoteSymbol = 'USDT', interval = '1d') {
        const hub = (() => {
            switch (exchange) {
                case 'OKX':
                    return new OkxDataHub(baseSymbol, quoteSymbol, interval)
                case 'COINBASE':
                    return new CoinbaseDataHub(baseSymbol, quoteSymbol, interval)
                case 'BINANCE':
                    return new BinanceDataHub(baseSymbol, quoteSymbol, interval)
                default:
                    throw `Exchange ${exchange} not supported`
            }
        })()
        await hub.init()
        return hub
    }
}