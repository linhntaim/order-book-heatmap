import {Ticker as BaseTicker} from '../ticker'

export class Ticker extends BaseTicker
{
    useInApi() {
        return `${this.base}-${this.quote}`.toUpperCase()
    }

    useInStream() {
        return `${this.base}-${this.quote}`.toUpperCase()
    }

    toString() {
        return `${this.base}-${this.quote}`.toLowerCase()
    }
}