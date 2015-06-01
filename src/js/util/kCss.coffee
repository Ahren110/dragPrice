kType = require('./kType')
kEach = require('./kEach')

camelCase = (str) ->
    return str.replace(/[-_][^-_]/g, (match) ->
        return match.charAt(1).toUpperCase())

dasherize = (str) ->
    return str.replace(/([a-z\d])([A-Z])/g, '$1-$2')
        .replace(/\_/g, '-').toLowerCase()

module.exports = (node, property) ->
    if node and node.style
        if kType.isString(property)
            property = camelCase(property)
            if arguments.length > 2
                value = arguments[2]
                node.style[property] = value
            else
                styles = getComputedStyle(node, null)
                if styles
                    ret = styles[property]
                return ret
        else
            styleList = []
            kEach(property, (key, value) ->
                styleList.push(dasherize(key) + ':' + value))
            node.style.cssText += ';' + styleList.join(';') + ';'
