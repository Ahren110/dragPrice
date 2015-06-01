module.exports = (obj, fn) ->
    for key of obj
        fn.call(obj, key, obj[key])
