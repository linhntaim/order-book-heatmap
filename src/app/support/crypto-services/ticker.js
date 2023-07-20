export class Ticker
{
    constructor(base = 'BTC', quote = 'USDT') {
        this.base = base
        this.quote = quote
    }

    useInApi() {
        return this.toString()
    }

    /**
     *
     * @returns {String}
     */
    useInStream() {
        return this.toString()
    }

    /**
     *
     * @returns {String}
     */
    toString() {
        return `${this.base}${this.quote}`.toUpperCase()
    }
}