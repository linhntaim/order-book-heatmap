import {Ticker as BaseTicker} from '../ticker'

export class Ticker extends BaseTicker
{
    useInApi() {
        return `${this.base}${this.quote}`.toLowerCase()
    }

    useInStream() {
        return `${this.base}${this.quote}`.toLowerCase()
    }

    toString() {
        return `${this.base}_${this.quote}`.toLowerCase()
    }
}