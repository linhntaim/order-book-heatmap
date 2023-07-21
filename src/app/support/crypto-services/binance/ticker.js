import {Ticker as BaseTicker} from '../ticker'

export class Ticker extends BaseTicker
{
    useInStream() {
        return super.toString().toLowerCase()
    }
}