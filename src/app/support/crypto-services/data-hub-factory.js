import {DataHub as BinanceDataHub} from '@/app/support/crypto-services/binance/data-hub'
import {DataHub as CoinbaseDataHub} from '@/app/support/crypto-services/coinbase/data-hub'
import {DataHub as OkxDataHub} from '@/app/support/crypto-services/okx/data-hub'
import {DataHub as HuobiDataHub} from '@/app/support/crypto-services/huobi/data-hub'
import {DataHub as BybitDataHub} from '@/app/support/crypto-services/bybit/data-hub'
// import {DataHub as GateDataHub} from '@/app/support/crypto-services/gate/data-hub'

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
                // case 'GATE':
                //     return new GateDataHub(baseSymbol, quoteSymbol, interval)
                case 'BYBIT':
                    return new BybitDataHub(baseSymbol, quoteSymbol, interval)
                case 'HUOBI':
                    return new HuobiDataHub(baseSymbol, quoteSymbol, interval)
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