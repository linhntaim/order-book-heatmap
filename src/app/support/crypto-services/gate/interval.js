import {Interval as BaseInterval} from '../interval'

export class Interval extends BaseInterval
{
    maps() {
        return {
            '10s': '10s',
            '1m': '1m',
            '5m': '5m',
            '15m': '15m',
            '30m': '30m',
            '1h': '1h',
            '4h': '4h',
            '8h': '8h',
            '1d': '1d',
            '1w': '7d',
            '1M': '30d',
        }
    }
}