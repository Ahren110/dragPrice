generalPosition = (el) ->
    box = el.getBoundingClientRect()
    body = el.ownerDocument.body
    docEl = el.ownerDocument.documentElement
    scrollTop = Math.max(global.pageYOffset or 0, docEl.scrollTop, body.scrollTop)
    scrollLeft = Math.max(global.pageXOffset or 0, docEl.scrollLeft, body.scrollLeft)
    clientTop = docEl.clientTop or body.clientTop  or 0
    clientLeft = docEl.clientLeft or body.clientLeft or 0

    return {
        left : box.left + scrollLeft - clientLeft
        top : box.top  + scrollTop - clientTop
    }

diff = (pos, bPos) ->
    return {
        left: pos.left - bPos.left
        top: pos.top - bPos.top
    }

_contains = (() ->
    if document.compareDocumentPosition
    then ((a, b) -> return !!(a.compareDocumentPosition(b) and 16))
    else ((a, b) -> return a isnt b and (if a.contains then a.contains(b) else true)))()

module.exports = (el) ->
    if !_contains(el.ownerDocument.body, el)
        return {
            top: NaN
            left: NaN
        }

    return (if arguments.length > 1
    then diff(generalPosition(el), generalPosition(arguments[1]))
    else generalPosition(el))
