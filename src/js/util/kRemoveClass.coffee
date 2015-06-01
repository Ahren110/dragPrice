whiteSpace = ' '

module.exports = (node, className) ->
    className  = whiteSpace + className.replace(/\s+/g, whiteSpace) + whiteSpace

    node.className = node.className.split(/\s+/).filter((originClassName) ->
        return !~className.indexOf(whiteSpace + originClassName + whiteSpace)
    ).join whiteSpace
