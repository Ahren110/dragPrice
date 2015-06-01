slice = Array::slice
kType = require('./kType')

extend = (target, source, deep) ->
    for key of source
        if deep and (kType.isPlainObject(source[key]) or kType.isArray(source[key]))
            if kType.isPlainObject(source[key]) and !kType.isPlainObject(target[key])
                target[key] = {}
            if kType.isArray(source[key]) and !kType.isArray(target[key])
                target[key] = []
            extend(target[key], source[key], deep)
        else if source[key] isnt undefined
            target[key] = source[key];

module.exports = (target) ->
    args = slice.call arguments,1
    if typeof target is 'boolean'
        deep = target;
        target = args.shift()

    args.forEach((arg) ->
        extend target, arg, deep)
    return target
