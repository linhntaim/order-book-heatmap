export class Num
{
    precision(num) {
        if (Number.isInteger(num)) {
            return 0
        }
        const numStr = num.toString()
        switch (true) {
            case numStr.includes('e-'):
                return Number.parseInt(numStr.split('e-')[1])
            case numStr.includes('.'):
                return numStr.split('.')[1].length
            default:
                return 0
        }
    }
}