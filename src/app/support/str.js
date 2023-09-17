export class Str
{
    constructor() {
        this.snakeCache = {}
        this.camelCache = {}
        this.studlyCache = {}
    }

    ctypeLower(str) {
        return /^[a-z]+$/.test(str)
    }

    /**
     *
     * @param {String} str
     * @returns {String}
     */
    lcfirst(str) {
        return str.charAt(0).toLowerCase() + str.slice(1)
    }

    /**
     *
     * @param {String} str1
     * @param {String} str2
     * @param {Number} length
     * @returns {Number}
     */
    strncmp(str1, str2, length) {
        str1 = str1.substring(0, length)
        str2 = str2.substring(0, length)
        return str1 === str2 ? 0 : (str1 > str2 ? 1 : -1)
    }

    /**
     *
     * @param {String} str
     * @param {String} delimiters
     * @returns {String}
     */
    ucwords(str, delimiters = '\\s\\t\\r\\n\\f\\v') {
        return str.replace(new RegExp('(^(.)|[' + delimiters + ']+(.))', 'g'), $1 => $1.toUpperCase())
    }

    /**
     *
     * @param {String} subject
     * @param {String} search
     * @returns {String}
     */
    after(subject, search) {
        if (search === '') {
            return subject
        }
        const position = subject.indexOf(search)
        if (position === -1) {
            return subject
        }
        return subject.slice(position + search.length)
    }

    /**
     *
     * @param {String} subject
     * @param {String} search
     * @returns {String}
     */
    afterLast(subject, search) {
        if (search === '') {
            return subject
        }

        const position = subject.lastIndexOf(search)
        if (position === -1) {
            return subject
        }
        return subject.slice(position + search.length)
    }

    /**
     *
     * @param {String} subject
     * @param {String} search
     * @returns {String}
     */
    before(subject, search) {
        return search === '' ? subject : subject.split(search)[0]
    }

    /**
     *
     * @param {String} subject
     * @param {String} search
     * @returns {String}
     */
    beforeLast(subject, search) {
        if (search === '') {
            return subject
        }

        const position = subject.lastIndexOf(search)
        if (position === -1) {
            return subject
        }
        return subject.slice(0, position)
    }

    /**
     *
     * @param {String} subject
     * @param {String} from
     * @param {String} to
     * @returns {String}
     */
    between(subject, from, to) {
        if (from === '' || to === '') {
            return subject
        }

        return this.beforeLast(this.after(subject, from), to)
    }

    /**
     *
     * @param {String} value
     * @returns {String}
     */
    camel(value) {
        if (value in this.camelCache) {
            return this.camelCache[value]
        }

        return this.camelCache[value] = this.lcfirst(this.studly(value))
    }

    /**
     *
     * @param {String} haystack
     * @param {String[]|String} needles
     * @returns {boolean}
     */
    contains(haystack, needles) {
        if (typeof needles === 'string') {
            needles = [needles]
        }
        return needles.some(needle => needle !== '' && haystack.indexOf(needle) !== -1)
    }

    /**
     *
     * @param {String} haystack
     * @param {String[]} needles
     * @returns {boolean}
     */
    containsAll(haystack, needles) {
        return needles.every(needle => this.contains(haystack, needle))
    }

    /**
     *
     * @param {String} haystack
     * @param {String[]|String} needles
     * @returns {boolean}
     */
    endsWith(haystack, needles) {
        if (typeof needles === 'string') {
            needles = [needles]
        }
        return needles.some(
            needle => needle !== '' && needle !== null
                && haystack.slice(-needle.length) === needle,
        )
    }

    snake(value, delimiter = '_') {
        const key = value

        if (key in this.snakeCache) {
            if (delimiter in this.snakeCache[key]) {
                return this.snakeCache[key][delimiter]
            }
        }
        else {
            this.snakeCache[key] = {}
        }

        if (!this.ctypeLower(value)) {
            value = this.ucwords(value).replace(/\s+/u, '')

            value = value.replace(/(.)(?=[A-Z])/u, '$1' + delimiter).toLowerCase()
        }

        return this.snakeCache[key][delimiter] = value
    }

    /**
     *
     * @param {String} haystack
     * @param {String[]|String} needles
     * @returns {boolean}
     */
    startsWith(haystack, needles) {
        if (typeof needles === 'string') {
            needles = [needles]
        }
        return needles.some(
            needle => needle !== '' && needle !== null
                && this.strncmp(haystack, needle, needle.length) === 0,
        )
    }

    /**
     *
     * @param {String} value
     * @returns {String}
     */
    studly(value) {
        const key = value

        if (key in this.studlyCache) {
            return this.studlyCache[key]
        }

        value = this.ucwords(value.replace(/[-_]/g, ' '))

        return this.studlyCache[key] = value.replace(/\s+/g, '')
    }

    trim(str, charlist) {
        //  discuss at: https://locutus.io/php/trim/
        // original by: Kevin van Zonneveld (https://kvz.io)
        // improved by: mdsjack (https://www.mdsjack.bo.it)
        // improved by: Alexander Ermolaev (https://snippets.dzone.com/user/AlexanderErmolaev)
        // improved by: Kevin van Zonneveld (https://kvz.io)
        // improved by: Steven Levithan (https://blog.stevenlevithan.com)
        // improved by: Jack
        //    input by: Erkekjetter
        //    input by: DxGx
        // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
        //   example 1: trim('    Kevin van Zonneveld    ')
        //   returns 1: 'Kevin van Zonneveld'
        //   example 2: trim('Hello World', 'Hdle')
        //   returns 2: 'o Wor'
        //   example 3: trim(16, 1)
        //   returns 3: '6'

        let whitespace = [' ', '\n', '\r', '\t', '\f', '\x0b', '\xa0', '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006', '\u2007', '\u2008', '\u2009', '\u200A', '\u200B', '\u2028', '\u2029', '\u3000'].join('')
        let l, i
        str += ''

        if (charlist) {
            whitespace = (charlist + '').replace(/([[\]().?/*{}+$^:])/g, '$1')
        }

        l = str.length
        for (i = 0; i < l; i++) {
            if (whitespace.indexOf(str.charAt(i)) === -1) {
                str = str.substring(i)
                break
            }
        }

        l = str.length
        for (i = l - 1; i >= 0; i--) {
            if (whitespace.indexOf(str.charAt(i)) === -1) {
                str = str.substring(0, i + 1)
                break
            }
        }

        return whitespace.indexOf(str.charAt(0)) === -1 ? str : ''
    }
}
