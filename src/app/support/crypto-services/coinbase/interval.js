import {Interval as BaseInterval} from '../interval'

export class Interval extends BaseInterval
{
    maps() {
        return {
            '1m': 60,
            '5m': 300,
            '15m': 900,
            '1h': 3600,
            '6h': 21600,
            '1d': 86400,
        }
    }
}