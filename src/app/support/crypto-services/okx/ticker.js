import {Ticker as BaseTicker} from '../ticker'

export class Ticker extends BaseTicker
{
    toString() {
        return `${this.base}-${this.quote}`.toUpperCase()
    }
}