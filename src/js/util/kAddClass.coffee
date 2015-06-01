whiteSpace = ' '
unique = (arr) ->
    ret = []
    while arr.length
        item = arr.pop();
        if !~ret.indexOf(item)
            ret.unshift(item);

    return ret;

module.exports = (node, className) ->
    node.className = unique((node.className + whiteSpace + className).split(/\s+/)).join(whiteSpace);
