/*  {OPTIONS}               | [type]        | (default), values         | Explanation
 *  ------------------------| --------------| ------------------------- | -----------
 *  @container              | [String]      | (#DragProgress)           | 插入组件的位置
 *  @dataType               | [Number]      | (1), OR 2                 | 显示的进度条区间是否是均分，1为均分，2为非均分，业务紧急，非均分只做了显示
 *  @interval               | [Array]       | ([])                      | 要展示的价格区间如：[100,200,400,500,'无限']
 *  @initInterval           | [Array]       | ([])                      | 初始化在哪个区间：[0,4]
 *  @dragprogressTpl        | [String]      | ('')                      | 插件的模板，具体规则参照默认模板
 *  @priceTipTpl            | [String]      | ('')                      | 拖动价格柄的时候显示的tip的模板
 *  @isShowTip              | [Boolean]     | (true)                    | 在移动价格手柄时时候展示出tip，需要price请用 `{{price}}`括起来
 *  @isSetItemNameCenter    | [Boolean]     | (true)                    | 价格显示往往不会居中，这个是对默认模板的居中处理
 *  @renderCallback         | [Function]    | ()                        | 如果自己提供的模板，render后可能需要居中处理
 *  @choosePriceCallback    | [Function]    | ()                        | 单击确定按钮的回溯
 *  @changePriceCallback    | [Function]    | ()                        | 价格选择完毕后的回调函数
 *  getPrice 				| [Function]	| ()						| 获取价格的方法
 */

require('zepto');
require('Hoganjs');

var defaults = require('./defaults.js');

/**
 * [DragProgress 用于拖拽价格区间]
 * @param {[Object]} opt [传入参数，具体参数请参考参数表]
 */
function DragProgress(opt){
	this.opts = $.extend(defaults,opt);
	this.config();
	this.render();
	this.bindEvent();
}

DragProgress.prototype = {
	/**
	 * [config 初始化并预处理出入参数]
	 */
	config : function(){
		this.config = {
    		eventTag: false
    	};
		this._interval2accounting();
		if(this.opts.dataType === 1){
            var _index = this._getIndex(this.opts.initInterval);
			this.config.progressBarLeft = this.config.interval[_index[0]] || 0;
			this.config.progressBarRight = this.config.interval[_index[1]] || 100;
		}else{
			this.config.progressBarLeft = this._getBestAccount(this.opts.initInterval[0]) || 0;
			this.config.progressBarRight = this._getBestAccount(this.opts.initInterval[1]) || 100;
		}
        this.config.initProgressPrice = [this.config.progressBarLeft, this.config.progressBarRight];
        this.config.dragprogressTpl = Hogan.compile(this.opts.dragprogressTpl);
        this._getMainElement();
	},

	/**
     * [render 用于渲染模板，渲染完成后取出一些必要的数据]
     * @return {[Object]} [this]
     */
    render: function(){
        var prices = this._setItemName();
        this.widgetEl.append(this.config.dragprogressTpl.render({
        	width: this.config.progressBarRight - this.config.progressBarLeft,
        	left: this.config.progressBarLeft,
            right: this.config.progressBarRight,
        	prices: prices,
        	priceLeft: function(){
        		return this.left;
        	},
        	priceName: function(){
        		return this.name
        	}
        }));
        var progressBarDom = $('[data-role="dp-progress"]');
        this.config.progressOffset = progressBarDom.position();
        if(this.opts.isSetItemNameCenter){
            this._setItemNameStyle();
        }
        return this;
    },

	/**
     * private
     * [_interval2accounting 将用户传入的价格数组转换成百分占比]
     * @return {[Array]} [生成价格对于每个的占比]
     */
    _interval2accounting: function(){
    	if(this.opts.dataType === 1){
			var interval = this.opts.interval,
				count = (interval.length - 1) / 100,
                _this = this;
			this.config.averageDiff = parseInt(1 / count, 10);
            this.config.itemName = [];
            this.config.interval = [];

            interval.map(function(item, index, array){
                _this.config.interval.push(parseInt(index / count, 10));
                _this.config.itemName.push(item['name']);
            });
		}else{
			this.opts.interval.sort(function(a,b){
				return a - b;
			});
			var interval = this.opts.interval,
				intervalLen = interval.length,
				accounting = [],
				min = interval[0],
				max = interval[intervalLen-1],
				diff = max - min;
			for(var i = intervalLen; i--; ){
				accounting.push((interval[i] - min) / diff * 100);
			}
			var initIntervalLen = this.opts.initInterval.length;
			for(var i = initIntervalLen; i--; ){
				this.opts.initInterval[i] = (this.opts.initInterval[i] - min) / diff * 100;
			}
		}
    },

	/**
     * [_setPriceNamePosition 设置文字描述的位置]
     */
    _setItemName: function(){
        var result = [],
            _this = this;
        this.config.itemName.map(function(item, index, array){
            var itemName = {
                name: item,
                left: _this.config.interval[index]
            };
            result.push(itemName);
        })
        return result;
    },

    /**
     * [_setItemNameStyle 设置itemName的marginLeft值]
     */
    _setItemNameStyle: function(){
        var itemNames = $('[data-role="dp-item-name"]');
        itemNames.each(function(index, item){
            var item = $(item);
            item.css('marginLeft', item.width() / -2 + 'px');
        });
    },

    /**
     * [_getIndex 根据数值返回，inArray]
     * @param  {[Number]} value [传入对应value的值]
     * @return {[Number]}       [该value对应的位置]
     */
    _getIndex: function(values){
        if(!Array.isArray(values)){
            return [];
        }
        var _values = [],
            _this = this;
        values.map(function(item, index, array){
            _this.opts.interval.some(function(_item, _index, _array){
                if(item === _item['value']){
                    _values.push(_index);
                    return true;
                }
            });
        });
        return _values;
    },

    /**
     * private
     * [_getBestAccount 获取移动后的最恰当的位置]
     * @param  {[type]} accounting [当前拖动柄所占位置]
     * @return {[type]}            [最恰当的位置]
     */
    _getBestAccount: function(accounting){
    	var accounting = parseInt(accounting,10);
        this.config.interval.some(function(item, index, array){
            if(item === accounting){
                return true;
            }
            if(item - accounting > 0){
                var diff1 = Math.abs(item - accounting),
                    diff2 = Math.abs(array[index-1] - accounting);
                accounting = diff1 > diff2 ? array[index-1] : item;
                return true;
            }
        });
        return accounting;
    },

    /**
     * public
     * [getPrice 获取当前价格区间，此方法对外暴露，调用该方法可获得当前 price 的数据]
     * @return {[Array]} [返回的是当前的价格区间]
     */
    getPrice : function(accounting){
		var price = [],
            _this = this;

        if(accounting === 0 || accounting){
            this.config.interval.some(function(item, index, array){
                if(accounting === item){
                    price = _this.config.itemName[index];
                    return true;
                }
            });
        }else{
            this.config.interval.some(function(item, index, array){
                if(_this.config.progressBarLeft === item || _this.config.progressBarRight === item){
                    price.push(_this.opts.interval[index]);
                }
                if(price.length === 2){
                    return true;
                }
            });
        }

        return price;
	},

    /**
     * public
     * [clearPrice 将价格置为初始值]
     */
    clearPrice : function(){
        this.config.progressBarLeft = this.config.initProgressPrice[0];
        this.config.progressBarRight = this.config.initProgressPrice[1];
        this._transition('add');
        this._setStyle();
    },

	/**
	 * private
     * [transition 在由移动位置调到恰当位置的动画]
     * @param  {[String]} type ['add' or 'remove']
     */
    _transition: function(type){
    	var progressBarDom = $('[data-role="dp-progress-bar"]'),
    		scrubberDom = $('[data-role="dp-scrubber"]');
    	if(type === 'add'){
			progressBarDom.addClass('progress-transition');
            scrubberDom.each(function(index, item){
                $(item).addClass('progress-transition');
            });
		}else{
			progressBarDom.removeClass('progress-transition');
            scrubberDom.each(function(index, item){
                $(item).removeClass('progress-transition');
            });
		}
    },

    /**
     * private
     * [setStyle 设置样式，控制进度条和拖动柄的移动]
     */
    _setStyle : function(){
		var width = this.config.progressBarRight - this.config.progressBarLeft,
			scrubberDom = $('[data-role="dp-scrubber"]'),
            progressBarDom = $('[data-role="dp-progress-bar"]');
		progressBarDom.css({
			width : width + '%',
			left : this.config.progressBarLeft + '%'
		});

		scrubberDom.eq(0).css({
			'left' : this.config.progressBarLeft + '%'
		});
		scrubberDom.eq(1).css({
			'left' : this.config.progressBarRight + '%'
		});
	},


	/**
	 * private
	 * [_priceTip 用于价格柄移动时展示tip]
	 * @param  {[String]} type [增加 or 删除]
	 * @param  {[String]} tag  [增加柄的位置]
	 */
    _priceTip: function(type, tag){
    	$('[data-role="dp-price-tip"]').remove();
		if(type === 'add'){
			if(tag === 'left'){
				var price = this.getPrice(this._getBestAccount(this.config.progressBarLeft)),
                    priceTip = this.opts.priceTipTpl.replace(/{{price}}/,price);
				$('[data-role="dp-scrubber"]').eq(0).append(priceTip);
			}else{
				var price = this.getPrice(this._getBestAccount(this.config.progressBarRight)),
                    priceTip = this.opts.priceTipTpl.replace(/{{price}}/,price);
				$('[data-role="dp-scrubber"]').eq(1).append(priceTip);
			}
		}
    },

    /**
     * [_getMainElement 覆盖widget的，李璇添加]
     * @param  {[type]} config [description]
     * @return {[type]}        [description]
     */
    _getMainElement: function (config) {
        this.widgetEl = null;
        var container = this.opts.container;
        this.container = $(container);
        this.widgetEl = this.container;
    },

	/**
	 * [bindEvent 绑定事件]
	 */
	bindEvent : function(){
		var _this = this,
			tag = false,
			min,max;
		this.widgetEl.on("touchstart", '[data-role="dp-scrubber"]', function(e){
			e.preventDefault();
			if(e.target.setCapture) {
				e.target.setCapture();
			}
			var tagDom = $(e.target);
	        if(!_this.config.progressWidth){
	            _this.config.progressWidth = parseInt($('[data-role="dp-progress-bar"]').width(), 10) * 100 / (_this.config.progressBarRight - _this.config.progressBarLeft);
	        }
			if(!_this.config.eventTag && tagDom && tagDom.data('left')){
				_this.config.eventTag = 'left';
			}else{
				_this.config.eventTag = 'right';
			}
		});

		this.widgetEl.on("touchmove", function(e){
			var min,max;

	        if(_this.config.eventTag){
	            _this._transition('remove');
	            var _width = e.targetTouches[0].clientX - _this.config.progressOffset.left,
	                _accounting = _width / _this.config.progressWidth * 100,
	                _accounting = _accounting > 100 ? 100 : _accounting;
	            if(_this.config.eventTag === 'left'){
	                min = 0;
	                max = _this.config.progressBarRight - _this.config.averageDiff;
	                _this.config.progressBarLeft = _accounting;
	                if(min >= _accounting){
	                    _this.config.progressBarLeft = min;
	                }else if(_accounting >= max){
	                    _this.config.progressBarRight = _accounting + _this.config.averageDiff;
	                    if(_this.config.progressBarRight >= 100){
	                        _this.config.progressBarRight = 100;
	                        _this.config.progressBarLeft = _this.config.progressBarRight - _this.config.averageDiff;
	                    }
	                }
	            }else{
	                min = _this.config.progressBarLeft + _this.config.averageDiff;
	                max = 100;
	                _this.config.progressBarRight = _accounting;
	                if(max <= _accounting){
	                    _this.config.progressBarRight = 100;
	                }else if(min >= _accounting){
	                    _this.config.progressBarLeft = _accounting - _this.config.averageDiff;
	                    if(_this.config.progressBarLeft <= 0){
	                        _this.config.progressBarLeft = 0;
	                        _this.config.progressBarRight = _this.config.progressBarLeft + _this.config.averageDiff;
	                    }
	                }
	            }
	            if(_this.opts.isShowTip){
	                _this._priceTip('add', _this.config.eventTag);
	            }
	            _this._setStyle();
	        }
		});

		this.widgetEl.on("touchend", function(e){
			if(_this.config.eventTag){
	            _this._transition('add');
	            _this.config.progressBarLeft = _this._getBestAccount(_this.config.progressBarLeft);
	            _this.config.progressBarRight = _this._getBestAccount(_this.config.progressBarRight);
	            if(_this.config.progressBarLeft === _this.config.progressBarRight){
	                if(_this.config.progressBarLeft === 0){
	                    _this.config.progressBarRight = _this.config.progressBarLeft + _this.config.averageDiff;
	                }else{
	                   _this.config.progressBarLeft = _this.config.progressBarRight - _this.config.averageDiff;
	                }
	            }
	            if(_this.opts.isShowTip){
	                _this._priceTip('remove', _this.config.eventTag);
	            }
	            _this._setStyle();
	            _this.config.eventTag = false;
	        }
		});
	}
}

new DragProgress({
	type : 1,       // 均分
	interval : [{
        value: 0,
        name: '￥0'
    },{
        value: 100,
        name: '￥100'
    },{
        value: 200,
        name: '￥200'
    },{
        value: 300,
        name: '￥300'
    },{
        value: 500,
        name: '￥500'
    },{
        value: '无限',
        name: '无限'
    }]
});
