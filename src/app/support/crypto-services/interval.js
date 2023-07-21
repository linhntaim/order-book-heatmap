import {substr} from 'locutus/php/strings'
import moment from 'moment'

export class Interval
{
    constructor(interval) {
        this.interval = interval
        this.unit = substr(this.interval, -1)
        this.number = Number.parseInt(this.interval)
        const maps = this.maps()
        if (!(this.interval in maps)) {
            throw `Interval ${this.interval} not supported`
        }
        this.mappedInterval = maps[this.interval]
    }

    maps() {
        return {}
    }

    findOpenTimeOf(time = null, directionIndex = 0, asInt = true) {
        const m = (() => {
            switch (true) {
                case time === null:
                    return moment()
                case moment.isMoment(time):
                    return time
                case moment.isDate(time):
                    return moment(time.getTime())
                default:
                    return moment(time)
            }
        })()

        const timestamp = m.unix() + 62135596800 // full timestamp from 01/01/0001 00:00:00
        const openTime = (() => {
            switch (this.unit) {
                case 's':
                    return m.subtract(timestamp % this.number, 's')
                        .add(this.number * directionIndex, 's')
                        .millisecond(0)
                case 'm':
                    return m.subtract(Math.floor(timestamp / 60) % this.number, 'm')
                        .add(this.number * directionIndex, 'm')
                        .second(0)
                        .millisecond(0)
                case 'h':
                    return m.subtract(Math.floor(timestamp / 3600) % this.number, 'h')
                        .add(this.number * directionIndex, 'h')
                        .minute(0)
                        .second(0)
                        .millisecond(0)
                case 'd':
                    return m.subtract(Math.floor(timestamp / (24 * 3600)) % this.number, 'd')
                        .add(this.number * directionIndex, 'd')
                        .hour(0)
                        .minute(0)
                        .second(0)
                        .millisecond(0)
                case 'w':
                    return m.subtract(Math.floor(timestamp / (24 * 3600)) % (this.number * 7), 'd')
                        .add(this.number * directionIndex * 7, 'd')
                        .hour(0)
                        .minute(0)
                        .second(0)
                        .millisecond(0)
                case 'M':
                    return m.subtract(((m.year() - 1) * 12 + m.month()) % this.number, 'M')
                        .add(this.number * directionIndex, 'M')
                        .day(1)
                        .hour(0)
                        .minute(0)
                        .second(0)
                        .millisecond(0)
                default:
                    throw 'Interval was not supported.'
            }
        })()

        return asInt ? openTime.unix() : openTime
    }

    useInApi() {
        return this.toString()
    }

    useInStream() {
        return this.toString()
    }

    toString() {
        return this.mappedInterval
    }
}