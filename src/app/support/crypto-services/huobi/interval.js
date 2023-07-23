import {Interval as BaseInterval} from '../interval'

export class Interval extends BaseInterval
{
    maps() {
        return {
            '1m': '1min',
            '5m': '5min',
            '15m': '15min',
            '30m': '30min',
            '1h': '60min',
            '4h': '4hour',
            '1d': '1day',
            '1w': '1week',
            '1M': '1mon',
            // TODO: 1year support
        }
    }
}