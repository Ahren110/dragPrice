kType = require('./kType')

module.exports = (iterable) ->
    rs = []
    if kType.isArray(iterable)
        return iterable
    else if kType.is(iterable, 'NodeList')
        len = iterable.length
        while len--
            rs[len] = iterable.item(len)
        return rs;
    else if iterable
        len = iterable.length
        if kType.is(len, 'Number') and len % 1 is 0 and len >= 0
            while len--
                rs[len] = iterable[len]
            return rs
        return false
    return false
