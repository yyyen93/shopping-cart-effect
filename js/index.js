/** 界面需要的一个商品对象
 * @param {原始商品数据} goods 
 * 
 * 这个函数的作用是干嘛？是不是在创建对象？
 * 什么东西是专门用来创建对象的？是不是构造函数(constructor)？是啊，他专门用来创建对象
 * 
 * First way
    function createUIGoods(goods){
        //返回新对象
        return{
            data: goods,
            choose: 0
        }
    }
    var cuig = createUIGoods(goods[0]);
    console.log(cuig)
 * 
 * Second way : 构造函数(constructor) (Use this way)
    function UIGoods(goods){
        this.data = goods;
        this.choose = 3;
        // 这些是作为属性出现还是作为方法出现？ 是属性
        //this.totalPrice = 0; 
        //这样出现数据冗余，那能不能找到一个不出现数据冗余的方法？ 可以，有的。把他变成‘函数’
    }
    // 函数:  调这个函数去算忠价。
    UIGoods.prototype.getTotalPrice = function(){
        return this.data.price * this.choose;
    }
    // 是否选中了此件商品
    UIGoods.prototype.isChoose = function(){
        return this.choose > 0;
    }
    var uig = new UIGoods(goods[0]);
    console.log(uig); 
 *
 */

/** ES6 way constructor : BETTER*/
/**  单件商品的数据 */
class UIGoods{
    constructor(goods){
        this.data = goods;
        this.choose = 0;
    }
    // 函数:  调这个函数去算忠价。
    getTotalPrice(){
        return this.data.price * this.choose;
    }
    // 是否选中了此件商品
    isChoose(){
        return this.choose > 0;
    }
    // 选择数量 +1
    increase(){
        this.choose++
    }
    //减少数量 -1
    decrease(){
        // 前提不能是负数
        if(this.choose === 0){
            return;
        }
        this.choose--;
    }
}

/** 整个界面的数据 */
class UIData{
    constructor(){
        // 这里需要循环原始对象，一个一个拿出来生成‘UIGoods’ 的对象。然后加入数组里边。
        var uiGoods = [];
        for(var i=0; i<goods.length; i++){
            // 拿到每个商品的对象传到‘uiGoods’ 里边去. 得到一个UIGoods的对象。
            var uig = new UIGoods(goods[i])
            // 把对象放进数组里边
            uiGoods.push(uig);
        }
        // 保存到属性里边去
        this.uiGoods = uiGoods;
        // 运送门槛 - 不同界面，都不一样。 具体到底是多少，我们还是根据网络来进行获取
        this.deliveryThreshold = 30;
        // 运送费
        this.deliveryPrice = 5;
    }
    
    /** 把这些数据写成函数
     * 1) 总价
     */
    getTotalPrice(){
        var sum = 0;
        for(var i=0; i<this.uiGoods.length; i++){
            // 每循环一次拿出一个商品。
            var g = this.uiGoods[i];
            // 把每件商品的总价加起来
            sum += g.getTotalPrice();
        }
        return sum;
    }

    /** 2) 增加某一件商品 的选中数量
     * 这些都是非常高级的事项.这是什么？ 这是面向对象的封装.面向对象最难的在于面向对象设计.
     * 增加某件商品的数量。
    */
    increase(index){
        this.uiGoods[index].increase();
    }

    /** 3) 减少某一件商品 的选中数量*/
    decrease(index){
        this.uiGoods[index].decrease();
    }

    /** 4) 得到总共的选择数量 */
    getTotalChooseNumber(){
        var sum = 0;
        for(var i=0; i < this.uiGoods.length; i++){
            sum += this.uiGoods[i].choose;
        }
        return sum;
    }

    /** 5) 购物车中有没有东西
     *  要知道购物车有没有商品，当有商品会有样式变化。 
    */
    hasGoodinCart(){
        return this.getTotalChooseNumber() > 0;
    }

    /** 6) 是否跨过了deliveryThreshold 配送标准
     * 目前选中的商品忠价是否超过配送标准
    */
    isCrossDeliveryThreshold(){
        return this.getTotalPrice() >= this.deliveryThreshold;
    }

    /** 7) 商品有没有选中
     * index 是下标意思
    */
    isChoose(index){
        return this.uiGoods[index].isChoose();
    }
}


/** 整个界面 */
class UI{
    constructor(){
        // 通过界面来管理UIData. 想要什么数据这里边全部有。
        this.uiData = new UIData();
        //  因为我们要做界面，所以有很多操作多姆元素。放到对象。
        this.doms = {
            goodsContainer: document.querySelector('.goods-list'),
            deliveryPrice: document.querySelector('.footer-car-tip'),
            footerPay: document.querySelector('.footer-pay'),
            footerPayInnerSpan: document.querySelector('.footer-pay span'),
            totalPrice: document.querySelector('.footer-car-total'),
            car: document.querySelector('.footer-car'),
            badge: document.querySelector('.footer-car-badge')
        };

        //  购物车坐标. 元素的矩形
        var carRect = this.doms.car.getBoundingClientRect();
        var jumpTarget = {
            x: carRect.left + carRect.width/2,
            y: carRect.top + carRect.height/5 //高度的5分之一
        };
        this.jumpTarget = jumpTarget;

        //避免构造函数里面的代码臃肿，所以把他单独提成一个函数。
        this.createHTML();
        // 更新页脚
        this.updateFooter();
        this.listenEvent();
    }

    // 监听各种事件。 一开始就做。动画完成把他去掉
    listenEvent(){
        this.doms.car.addEventListener('animationend', function(){
            this.classList.remove('animate');
            // 这个this不在指向外面的对象，这个this是指向当前注册事件的元素那就是这个 this.doms.car
        })
    }


    /** 1) 根据商品数据创建商品列表元素
     *  一个列表元素就是个div  
     *  实际上是有两种做法。
     * 1）生成html字符串 （在这情况，会选这个）。
     * 2）一个一个创建元素
     * */
    createHTML(){
        //生成html字符串 
        var html = '';
        for(var i=0; i<this.uiData.uiGoods.length; i++){
            var g = this.uiData.uiGoods[i];
            
            // 每件商品生成一个字符串,拼接到这里边
            html += 
            `<div class="goods-item">
                <img src="${g.data.pic}" alt="" class="goods-pic" />
                <div class="goods-info">
                    <h2 class="goods-title">${g.data.title}</h2>
                    <p class="goods-desc">
                        ${g.data.desc}
                    </p>
                    <p class="goods-sell">
                        <span>月售 ${g.data.sellNumber} </span>
                        <span>好评率 ${g.data.favorRate}%</span>
                    </p>
                    <div class="goods-confirm">
                        <p class="goods-price">
                            <span class="goods-price-unit">￥</span>
                            <span>${g.data.price}</span>
                        </p>
                        <div class="goods-btns">
                            <i index="${i}" class="iconfont i-jianhao"></i>
                            <span>${g.choose}</span>
                            <i index="${i}" class="iconfont i-jiajianzujianjiahao"></i>
                        </div>
                    </div>
                </div>
            </div>`
        }
        //返回doms container.
        this.doms.goodsContainer.innerHTML = html;
    };

    /** 2) 界面的增加减少
     * 他们两有一样的元素就是更新相应的元素 updateGoodsItem(){}
     */
    increase(index){
        // 增加第几个商品数量
        this.uiData.increase(index);
        this.updateGoodsItem(index);
        this.updateFooter();
        this.jump(index);
    }
    
    decrease(index){
        // 减少第几件商品的数量
        this.uiData.decrease(index);
        this.updateGoodsItem(index);
        this.updateFooter();
    }
    
    // 更新某个商品元素的显示状态
    updateGoodsItem(index){
        // 这里要做哪些事？ 首先第一件事儿， 就是这整个div.goods-items， 要不要加上内样式。首先要得到这个div.goods-items元素
        var goodsDom = this.doms.goodsContainer.children[index]
        // 看这商品有没有被选中
        if(this.uiData.isChoose(index)){
            // 加 active class 样式在选中的元素
            goodsDom.classList.add('active');
        }else{
            goodsDom.classList.remove('active');
        }

        // 改动数量
        var span = goodsDom.querySelector('.goods-btns span');
        span.textContent = this.uiData.uiGoods[index].choose; 
    }

    /** 更新页脚
     * 根据uiData数据来更新页脚
     */
    updateFooter(){
        // 得到总价数据
        var total = this.uiData.getTotalPrice();
        // 设置配送费
        this.doms.deliveryPrice.textContent = `配送费RM${this.uiData.deliveryPrice}`;

        // 设置起送费还差多少
        if(this.uiData.isCrossDeliveryThreshold()){
            //到达起送点
            this.doms.footerPay.classList.add('active');
        }else{
            this.doms.footerPay.classList.remove('active');
            // 更新还差多少钱,需要忠价和起送门槛
            var dis = this.uiData.deliveryThreshold - total;
            dis = Math.round(dis);
            this.doms.footerPayInnerSpan.textContent = `还差RM${dis}元起送`;
        }

        // 设置总价元素
        this.doms.totalPrice.textContent = total.toFixed(2);

        // 设置购物车的样式状态
        if(this.uiData.hasGoodinCart()){
            this.doms.car.classList.add('active');
        }else{
            this.doms.car.classList.remove('active')
        }

        // 设置购物车中的数量
        this.doms.badge.textContent = this.uiData.getTotalChooseNumber();
    };

    /** 购物车动画
     * 
     */
    carAnimate(){  
        this.doms.car.classList.add('animate');
    }

    /** 抛物线跳跃的元素动画
     * 需要拿到两个坐标。 一个是购物车， 一个是商品加号
     * 购物车位置没变，所以不需要在里边。可以一开始就做
     */
    jump(index){
        // 找到对应商品的加号
        var btnAdd = this.doms.goodsContainer.children[index].querySelector('.i-jiajianzujianjiahao');
        // 加号的坐标
        var rect = btnAdd.getBoundingClientRect();
        // 起始坐标
        var start = {
            x: rect.left,
            y: rect.top,
        };

        // 跳吧
        var div = document.createElement('div');
        div.className = 'add-to-car';
        var i = document.createElement('i');
        i.className = 'iconfont i-jiajianzujianjiahao';

        // 设置初始位置
        div.style.transform = `translateX(${start.x}px)`;
        i.style.transform = `translateY(${start.y}px)`;
        div.appendChild(i);
        document.body.appendChild(div);
        // console.log(start, this.jumpTarget)

        // 强行渲染: 读任何属性都会导致强行渲染。 另外方法是 requestAnimationFrame.
        div.clientWidth;

        // 设置结束位置
        div.style.transform = `translateX(${this.jumpTarget.x}px)`;
        i.style.transform = `translateY(${this.jumpTarget.y}px)`;


        // 添加事件。 当过度完成
        var that = this; //保持变量
        div.addEventListener('transitionend',function () {
            console.log('过度结束了');
            div.remove();
            // 删除购物车动画
            that.carAnimate();
        }, {
            once:true, //事件仅出发一次
        })
    }



};

var ui = new UI();


// 事件
ui.doms.goodsContainer.addEventListener('click', function(e){
    if(e.target.classList.contains('i-jiajianzujianjiahao')){
        console.log('加号');
        // 拿index元素,转成数字
        var index = +e.target.getAttribute('index');
        ui.increase(index);
    }else if(e.target.classList.contains('i-jianhao')){
        console.log('减号');
        var index = +e.target.getAttribute('index');
        ui.decrease(index);
    }
});

