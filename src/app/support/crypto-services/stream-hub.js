export class StreamHub
{
    /**
     *
     * @param {Ticker} ticker
     * @param {Interval} interval
     */
    constructor(ticker, interval) {
        this.ticker = ticker.useInStream()
        this.interval = interval.useInStream()
        this.stream = null
    }

    url() {
        return 'ws://localhost'
    }

    /**
     *
     * @returns {Promise<StreamHub>}
     */
    connect() {
        return new Promise((resolve, reject) => {
            this.stream = new WebSocket(this.url())
            this.stream.onerror = event => {
                this.disconnect()
                reject(event)
            }
            this.stream.onopen = () => {
                this.stream.onerror = event => {
                    console.log('Stream error: ', event)
                    throw 'Error while streaming'
                }
                resolve(this)
            }
        })
    }

    // eslint-disable-next-line no-unused-vars
    listen(onCandle, onOrderBook) {
        this.subscribe()

        this.stream.onmessage = async event => {
            const data = await this.parseData(event.data)
            switch (true) {
                case this.isCandle(data):
                    onCandle(this.transformCandle(data))
                    break
                case this.isOrderBook(data):
                    onOrderBook(this.transformOrderBook(data))
                    break
            }
        }
    }

    async parseData(data) {
        return JSON.parse(data)
    }

    subscribe() {
        this.stream.send(JSON.stringify(this.subscriptionRequest()))
    }

    subscriptionRequest() {
        return {}
    }

    // eslint-disable-next-line no-unused-vars
    isCandle(data) {
        return false
    }

    // eslint-disable-next-line no-unused-vars
    transformCandle(data) {
        return {
            time: 0,
            open: 0,
            high: 0,
            low: 0,
            close: 0,
        }
    }

    // eslint-disable-next-line no-unused-vars
    isOrderBook(data) {
        return false
    }

    // eslint-disable-next-line no-unused-vars
    transformOrderBook(data) {
        return {
            asks: [],
            bids: [],
        }
    }

    disconnect() {
        if (this.stream) {
            this.stream.close()
            this.stream = null
        }
    }
}