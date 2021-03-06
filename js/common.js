/**
 * Created with JetBrains PhpStorm.
 * User: Administrator
 * Date: 13-4-28
 * Time: 上午10:18
 * To change this template use File | Settings | File Templates.
 */
// 继承
function Class(parent) {
    var kclass = function () {
        if (parent) {
            parent.apply(this, arguments);
        }
        this.init.apply(this, arguments);
    }
    if (parent) {
        kclass.prototype = new parent;
    }
    kclass.prototype.init = function () {
    };
    kclass.fn = kclass.prototype;
    kclass.fn.parent = kclass;
    kclass.extend = function (obj) {
        var extended = obj.extended;
        for (i in obj) {
            if (!kclass[i]) {
                kclass[i] = obj[i];
            }
        }
        if (extended) extended(kclass);
    }
    kclass.include = function (obj) {
        var included = obj.included;
        for (i in obj) {
            kclass.fn[i] = obj[i];
        }
        if (included) {
            included(kclass);
        }
        return kclass;
    }
    kclass.proxy = function (func) {
        var self = this;
        return(function () {
            return func.apply(self, arguments);
        });
    }
    return kclass;
}

// Add Class Drag
var Drag = Class();
// 初始化类
Drag.fn.init = function(dragEle){
    this.dragEle = dragEle;
    this.tar =  null;
    this.sL = 0;
    this.sT = 0;
    this.disX = 0;
    this.disY = 0;
    this.start();
};
// 扩展原型
Drag.include({
    start:function(){
        var _this = this;
        this.dragEle.mousedown(function(e){
            _this.downHandler(e);
        });
    },
    downHandler:function(e){
        var _this = this;
        function moveHandler(e){
            _this.moveHandler(e);
        }
        function upHandler(e){
            $(document).unbind('mousemove',moveHandler);
            $(document).unbind('mouseup',upHandler);
        }
        var offset = this.dragEle.offset();
        this.sL = $(window).scrollLeft();
        this.sT = $(window).scrollTop();
        this.disX = e.clientX + this.sL - offset.left;
        this.disY = e.clientY + this.sT - offset.top;
        $(document).mousemove(moveHandler);
        $(document).mouseup(upHandler);
        if(e.stopPropagation){
            e.stopPropagation();
        }
        e.cancelable = true;
    },
    moveHandler:function(e){
        var x, y,ele = this.dragEle,offset = ele.offset();
        this.tar = ele.parent();
        this.sL = $(window).scrollLeft();
        this.sT = $(window).scrollTop();
        x = e.clientX + this.sL - this.disX;
        y = e.clientY + this.sT - this.disY;
        this.tar.css('left',x);
        this.tar.css('top',y);
    }
});

// add Tab Class
var Tab = Class();
// 初始化类
Tab.fn.init = function(options){
    this.elem = null;
    this.navs = null;
    this.cons = null;
    this.type = 'click';
    this.firstDisplay = 0;
    this.onClass = '';
    this.callback = null;
    $.extend(this,options);
    this.start();
};
// 扩展原型
Tab.include({
    start:function(){
        this.navs = this.ele.find('ul:first li');
        this.cons = this.ele.children('div');
        this.navs.eq(this.firstDisplay).addClass(this.onClass);
        this.cons.hide();
        this.cons.eq(this.firstDisplay).show();
        this.bindEvent();
    },
    bindEvent:function(){
        _this = this;
        this.navs.bind(this.type,function(){
            var index = this.index;
            _this.navs.removeClass(_this.onClass);
            _this.navs.eq(index).addClass(_this.onClass);
            _this.cons.hide();
            _this.cons.eq(index).show();
            if(typeof _this.callback === 'function'){
                _this.callback();
            }
        })
    }
});

// add Class from the value to the other value
var Animate = Class();
Animate.fn.init = function(options){
    this.ele = null;
    this.value = 0;
    this.tar = 0;
    this.time = null;
    this.speed = 5;
    this.speed2 = 30;
    this.attr = '';
    $.extend(this,options);
    this.start();
}
Animate.include({
    start:function(){
        var _this = this;
        this.time = setInterval(function(){
            _this.doIt(_this.attr);
        },this.speed2)
    },
    getValue:function(attr){
        if(attr === 'opacity'){
           return this.ele.css(attr)*100;
        }
        return parseInt(this.ele.css(attr));
    },
    setValue:function(attr,value){
        if(attr == 'opacity'){
            return this.ele.css(attr,value/100);
        }
        this.ele.css(attr,value);
    },
    doIt:function(attr){
        var iSpeed;
        this.value = this.getValue(attr);
        iSpeed = (this.tar - this.value) > 0 ? Math.ceil((this.tar - this.value) / this.speed ) : Math.floor((this.tar - this.value) / this.speed);
        this.value += iSpeed;

        if(this.value === this.tar){
            clearInterval(this.time);
        }
        this.setValue(attr,this.value);
    }
});
// add slide Class
var Slide = Class();
Slide.fn.init = function(options){
    this.ele = null;
    this.time1 = null;
    this.time2 = null;
    this.cons = null;
    this.tits = null;
    this.nums = null;
    this.speed1 = 3000;
    this.speed2 = 5;
    this.nowIndex = 1;
    this.cacheIndex = 0;
    $.extend(this,options);
    this.start();
};
Slide.include({
    start:function(){
        var ele = this.ele,
            _this = this;
        this.cons = ele.find('ul').eq(0).find('li');
        this.tits = ele.find('ul').eq(1).find('li');
        this.nums = ele.find('ul').eq(2).find('li');
        this.time1 = setInterval(function(){_this.doIt(_this.nowIndex,_this.cacheIndex);},this.speed1);
        this.bindEvent();
    },
    doIt:function(now,last){
        this.cons.eq(last).animate({'opacity':0,'zIndex':0},1000);
        this.cons.eq(now).animate({'opacity':1,'zIndex':1},1000);
        this.tits.eq(last).animate({'opacity':0,'zIndex':0},0);
        this.tits.eq(now).animate({'opacity':1,'zIndex':1},0);
        this.nums.eq(last).removeClass('onNum');
        this.nums.eq(now).addClass('onNum');
        this.cacheIndex = now;
        this.nowIndex++;
        if(now === 3 ){
            this.nowIndex = 0;
        }
    },
    bindEvent:function(){
        var _this = this;
        this.ele.hover(function(){clearInterval(_this.time1)},function(){
            _this.time1 = setInterval(function(){_this.doIt(_this.nowIndex,_this.cacheIndex);},_this.speed1);
        });
        this.nums.bind('mouseover',function(e){
            _this.cons.stop(true,true);
            _this.nowIndex = $(this).index();
            _this.doIt(_this.nowIndex,_this.cacheIndex);
        });
        this.nums.find('a').bind('click',function(e){
            if(e.preventDefault) e.preventDefault();
            e.returnValue = true;
        });
    }
});



