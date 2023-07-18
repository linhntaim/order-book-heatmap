export class Obj
{
    sortByKey(obj, direction = 'asc', as = 'string') {
        const func = (() => {
            switch (as) {
                case 'number':
                    return direction === 'asc'
                        ? (a, b) => {
                            const sa = Number(a)
                            const sb = Number(b)
                            if (sa < sb) {
                                return -1
                            }
                            if (sa > sb) {
                                return 1
                            }
                            return 0
                        }
                        : (a, b) => {
                            const sa = Number(a)
                            const sb = Number(b)
                            if (sa < sb) {
                                return 1
                            }
                            if (sa > sb) {
                                return -1
                            }
                            return 0
                        }
                case 'string':
                default:
                    return direction === 'asc'
                        ? (a, b) => {
                            const sa = a.toString()
                            const sb = b.toString()
                            if (sa.length < sb.length || sa < sb) {
                                return -1
                            }
                            if (sa.length > sb.length || sa > sb) {
                                return 1
                            }
                            return 0
                        }
                        : (a, b) => {
                            const sa = a.toString()
                            const sb = b.toString()
                            if (sa.length < sb.length || sa < sb) {
                                return 1
                            }
                            if (sa.length > sb.length || sa > sb) {
                                return -1
                            }
                            return 0
                        }
            }
        })()
        return Object.keys(obj).sort(func).reduce((entries, key) => {
            entries[key] = obj[key]
            return entries
        }, {})
    }
}