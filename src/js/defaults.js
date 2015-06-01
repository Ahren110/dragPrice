var tmp = require('./tmp');

var defaults = {
    container: '.content',
    type: 'dragprogress',
    dataType: 1,
    interval: [],
    initInterval: [],
    dragprogressTpl: tmp,
    isShowTip : true,
    isSetItemNameCenter: true,
    priceTipTpl: '<div class="price-tip" data-role="dp-price-tip">{{price}}<span class="arrow"><i class="yo-ico">&#xf033;</i></span></div>',
}

module.exports = defaults;
