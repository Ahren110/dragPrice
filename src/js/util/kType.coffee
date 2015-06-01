__object__ = Object::

class2type =
    '[object HTMLDocument]': 'Document'
    '[object HTMLCollection]': 'NodeList'
    '[object StaticNodeList]': 'NodeList'
    '[object IXMLDOMNodeList]': 'NodeList'
    '[object DOMWindow]': 'Window'
    '[object global]': 'Window'
    'null': 'Null'
    'NaN': 'NaN'
    'undefined': 'Undefined'

'Boolean,Number,String,Function,Array,Date,RegExp,Window,Document,Arguments,NodeList,Null,Undefined'
    .replace(/\w+/ig, (value) ->
        class2type['[object ' + value + ']'] = value)

getType = (obj, match) ->
    rs = class2type[(obj is null or obj isnt obj) ? obj : Object::toString.call(obj)] or (obj and obj.nodeName) or '#'
    if obj is undefined
        rs = 'Undefined'
    else if rs.charAt(0) is '#'
        if obj is obj.document and obj.document isnt obj
            rs = 'Window'
        else if obj.nodeType is 9
            rs = 'Document'
        else if obj.callee
            rs = 'Arguments'
        else if isFinite(obj.length) and obj.item
            rs = 'NodeList'
        else
            rs = __object__.toString.call(obj).slice(8, -1)

    if match
        return match is rs

    return rs

keys = (obj) ->
    ret = []
    for key of obj
        ret.push(key);

    return ret

module.exports =
    get: (source) ->
        return getType source

    is: (source, match) ->
        return getType(source, match)

    isArray: (source) ->
        return getType(source, 'Array')

    isString: (source) ->
        return getType(source, 'String')

    isFunction: (source) ->
        return getType(source, 'Function')

    isElement: (source) ->
        return !!source and source.nodeType is 1

    isNumber: (source) ->
        return getType(source, 'Number')

    # 判断是不是简单对象
    isPlainObject: (source) ->
        if !getType(source, 'Object') or source.nodeType or getType(source, 'Window')
            return false;

        try
            if source.constructor and !__object__.hasOwnProperty.call(
                source.constructor::, 'isPrototypeOf')
                return false;
        catch e
            return false;

        return true;

    # 判断是不是空对象
    isEmptyObject: (source) ->
        if getType(source, 'Object') and !keys(source).length
            return true;

        return false;
