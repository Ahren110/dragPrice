kType = require('./kType')
kMakeArray = require('./kMakeArray');

module.exports = (elements, type, fn) ->
    if kType.is(elements, 'NodeList')
        elements = kMakeArray(elements)
    else
        elements = [].concat(elements)

    elements.forEach((el) ->
        el.addEventListener(type, fn, false);
    )

    return true;
