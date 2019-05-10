var father_html = "<div> \n"
+"                <el-input id=\"sname\" v-model.trim=\"addForm.sname\" type=\"text\"\n"
+"                          @input=\"placeAutoInput('sname')\" @keyup.delete.native=\"deletePlace('sname')\"\n"
+"                          :placeholder=\"placeholder\">\n"
+"                    <i class=\"el-icon-location-outline el-input__icon\"\n"
+"                       slot=\"suffix\" title=\"地址\">\n"
+"                    </i>\n"
+"                </el-input>\n"
+"                <div v-show=\"snameMapShow\" class=\"map-wrapper\">\n"
+"                    <div>\n"
+"                        <el-button type=\"text\" size=\"mini\" @click.stop=\"snameMapShow = false\">收起<i\n"
+"                                class=\"el-icon-caret-top\"></i></el-button>\n"
+"                    </div>\n"
+"                    <div id=\"sNameMap\" class=\"map-self\"></div>\n"
+"                </div>\n"
+"        <!--地址模糊搜索子组件-->\n"
+"        <map-select-son class=\"place-wrap\" ref=\"place-search\"  v-if=\"resultVisible\"\n"
+"        	:result=\"result\" :left=\"offsetLeft\"  :top=\"offsetTop\"\n"
+"            :width=\"inputWidth\" :height=\"inputHeight\" @get-location=\"getPlaceLocation\"></map-select-son>\n"
+"    </div>\n"
 
var son_html=" <div class=\"result-list-wrapper\" ref=\"resultWrapper\">\n"
+"				       <ul class=\"result-list address\" :data=\"result\">\n"
+"				           <li class=\"result-item address\"\n"
+"				               v-for=\"(item, index) in result\"\n"
+"				               :key=\"item.index\"\n"
+"				               @click=\"setLocation(item)\"\n"
+"				               ref=\"resultItem\">\n"
+"				               <p class=\"result-name address\" :class=\"{'active': index === activeIndex}\">{{item.name}}</p>\n"
+"					            <template v-if=\"item.address instanceof Array\"><p class=\"result-adress address\">{{item.district}}</p></template>\n"
+"					           <template v-else><p class=\"result-adress address\">{{item.address}}</p></template>\n"
+"					        </li>\n"
+"					    </ul>\n"
+"					</div>\n"


Vue.component('map-select-son', {
	template :son_html,
	data : function() {
		return {
			activeIndex: 0 // 激活项
		}
	},
	props: {
        result: {
            type: Array,
            default: null
        },
        left: { // 输入框的offsetLeft
            type: Number,
            default: 0
        },
        top: { // 输入框的offsetTop
            type: Number,
            default: 0
        },
        width: { // 输入框的宽
            type: Number,
            default: 0
        },
        height: { // 输入框的高
            type: Number,
            default: 0
        }
    },
	methods: {
		 // 选择下拉的地址
        setLocation: function(item) {
            console.log("set:"+item);
            this.$emit('get-location', item)
        },
        // 初始化地址搜索下拉框位置
        initPos:function() {
            let dom = this.$refs['resultWrapper'];
            let body = document.getElementsByTagName("body");
            if(body) {
                body[0].appendChild(dom);
                let clientHeight = document.documentElement.clientHeight;
                let wrapHeight = 0;
                if(this.result && this.result.length>5) {
                    wrapHeight = 250;
                } else if(this.result && this.result.length<=5) {
                    wrapHeight = this.result.length * 50;
                }
                if(clientHeight - this.top < wrapHeight) {
                    // 如果div高度超出底部，div往上移（减去div高度+input高度）
                    dom.style.top = this.top - wrapHeight - this.height + 'px';
                } else {
                    dom.style.top = this.top + 'px';
                }
                dom.style.left = this.left + 'px';
                dom.style.width = this.width + 'px'
            }
        },
        // 窗口resize时改变下拉框的位置
        changePost:function(left, top, width, height) {
            let dom = this.$refs['resultWrapper'];
            let clientHeight = document.documentElement.clientHeight;
            let wrapHeight = 0;
            if(this.result && this.result.length>5) {
                wrapHeight = 250;
            } else if(this.result && this.result.length<=5) {
                wrapHeight = this.result.length * 50;
            }
            if(clientHeight - top < wrapHeight) {
                // 如果div高度超出底部，div往上移（减去div高度+input高度）
                dom.style.top = top - wrapHeight - height + 'px';
            } else {
                dom.style.top = top + 'px';
            }
            dom.style.left = left + 'px';
            dom.style.width = width + 'px'
        },
        // 监听键盘上下方向键并激活当前选项
        keydownSelect:function(event) {
            let e = event || window.event || arguments.callee.caller.arguments[0];
            if(e && e.keyCode === 38){//上
                if(this.$refs['resultWrapper']) {
                    let items = this.$refs['resultWrapper'].querySelectorAll(".result-item");
                    if(items && items.length>0) {
                        this.activeIndex--;
                        // 滚动条往上滚动
                        if(this.activeIndex < 5) {
                            this.$refs['resultWrapper'].scrollTop = 0
                        }
                        if(this.activeIndex === 5) {
                            this.$refs['resultWrapper'].scrollTop = 250
                        }
                        if(this.activeIndex === -1) {
                            this.activeIndex = 0;
                        }
                    }
                }
            } else if(e && e.keyCode === 40) {//下
                if(this.$refs['resultWrapper']) {
                    let items = this.$refs['resultWrapper'].querySelectorAll(".result-item");
                    if(items && items.length>0) {
                        this.activeIndex++;
                        // 滚动条往下滚动
                        if(this.activeIndex === 5) {
                            this.$refs['resultWrapper'].scrollTop = 250
                        }
                        if(this.activeIndex === 9) { // 防止最后一条数据显示不全
                            this.$refs['resultWrapper'].scrollTop = 300
                        }
                        if(this.activeIndex === items.length) {
                            this.activeIndex = 0;
                            this.$refs['resultWrapper'].scrollTop = 0
                        }
                    }
                } 
            } else if(e && e.keyCode === 13) { // 监听回车事件，并获取当前选中的地址的经纬度等信息
                if(this.result && this.result.length > this.activeIndex) {
                    this.setLocation(this.result[this.activeIndex]);
                }
            }
        }
    },
    mounted:function() {
        this.initPos();
        document.addEventListener("keydown", this.keydownSelect, false);
    },
    beforeDestroy:function() {
        document.removeEventListener("keydown", this.keydownSelect, false);
    }
})


Vue.component('map-select', {
		template :father_html,
		props: {
			placeholder:{
				type: String,
				default: null
			},
			address: {
	            type: String,
	            default: null
	        }, 
	        lat: {
	            type: Number,
	            default: null
	        },
	        lng: {
	            type: Number,
	            default: null
	        },
	    }, 
        data:function(){
            return {
            	position:{},
                addForm: {
                    sname: '', // 上车地点
                    slat: 0, // 上车地点纬度
                    slon: 0 // 上车地点经度
                },
                inputId: '', // 地址搜索input对应的id
                result: [], // 地址搜索结果
                resultVisible: false, // 地址搜索结果显示标识
                inputWidth: 0, // 搜索框宽度
                inputHeight: 0, // 搜索框高度
                offsetLeft: 0, // 搜索框的左偏移值
                offsetTop: 0, // 搜索框的上偏移值
                snameMap: null,  // 上车地点地图选址
                snameMapShow: false,  // 上车地点地图选址显示
            }
        },
        watch:{
        	address: function (val) { 
        		 if (this.lng && this.lat && this.address) {
        			if (this.addForm.sname != this.address|| this.lng != this.addForm.slon || this.lat != this.addForm.slat) {
        				this.addForm.sname = this.address;
        				this.pickAddress("sname",this.lng,this.lat); //初始赋值
        			}
                 }  else { //
                	 this.defaultInit();
                 }
            }
          },
          created:function(){
        	//获取当前位置
        	var _self = this;
        	var position = {};
        	var map = new AMap.Map('sNameMap', {
        	    resizeEnable: true
        	});
        	AMap.plugin('AMap.Geolocation', function() {
        	    var geolocation = new AMap.Geolocation({
        	        enableHighAccuracy: true,//是否使用高精度定位，默认:true
        	        buttonPosition:'RB',    //定位按钮的停靠位置
        	        buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
        	    });
        	    map.addControl(geolocation);
        	    geolocation.getCurrentPosition(function(status,result){
        	        if(status=='complete'){
        	        	position =  result.position;
        	        }else{
        	        }
        	    });
        	});
        	this.position = position;
        },
        mounted: function () {
        	 this.defaultInit();
            // document添加onclick监听，点击时隐藏地址下拉浮窗
            document.addEventListener("click", this.hidePlaces, false);
            // window添加onresize监听，当改变窗口大小时同时修改地址下拉浮窗的位置
            window.addEventListener("resize", this.changePos, false)
        },
        methods: {
        	defaultInit:function() {
        		var lng = "117.24102";
        		var lat = "31.854874";
        		if ( this.position.lat &&  this.position.lng) { 
        			lat = this.position.lat;
        			lng = this.position.lng;
        		}
        		AMap.plugin('AMap.Autocomplete', function () { 
                    // 实例化Autocomplete
                    let autoOptions = {
                        city: '合肥'
                };
                    let autoComplete = new AMap.Autocomplete(autoOptions); // 初始化autocomplete
        		})
                this.pickAddress("sname", lng, lat,1);
        		this.addForm.slat = "";
        		this.addForm.slon = "";
        		this.addForm.sname = "";
        	},
            placeAutoInput:function(inputId) {
                let currentDom = document.getElementById(inputId);// 获取input对象
                let keywords = currentDom.value;
                if(keywords.trim().length === 0) {
                    this.resultVisible = false;
                }
                var _self = this;
                AMap.plugin('AMap.Autocomplete', function () {
                    // 实例化Autocomplete
                    let autoOptions = {
                        city: '合肥'
                    };
                let autoComplete = new AMap.Autocomplete(autoOptions); // 初始化autocomplete
                // 开始搜索 
                autoComplete.search(keywords, function (status, result) {
                    // 搜索成功时，result即是对应的匹配数据
                    if(result.info === 'OK') {
                    	//过滤没有经纬度的结果
                       	var tips = result.tips;
                       	var newTips = [];
                       	for (var i=0;i<tips.length;i++) {
                       		if (tips[i].location) {
                       			newTips.push(tips[i]);
                       		}
                       	}
                       	result.tips = newTips;
	                    let sizeObj = currentDom.getBoundingClientRect(); // 取得元素距离窗口的绝对位置
	                    _self.inputWidth = currentDom.clientWidth;// input的宽度
	                    _self.inputHeight = currentDom.clientHeight + 2;// input的高度，2是上下border的宽
	                    // input元素相对于页面的绝对位置 = 元素相对于窗口的绝对位置
	                    _self.offsetTop = sizeObj.top + _self.inputHeight; // 距顶部
	                    _self.offsetLeft = sizeObj.left; // 距左侧
	                    _self.result = result.tips;
	                    _self.inputId = inputId;
	                    _self.resultVisible = true;
                }
            })
            })
            },
            // 隐藏搜索地址下拉框
            hidePlaces:function(event) {
                let target = event.target;
                // 排除点击地址搜索下拉框
                if(target.classList.contains("address")) {
                    return;
                }
                this.resultVisible = false;
            },
            // 修改搜索地址下拉框的位置
            changePos:function() {
                if(this.inputId && this.$refs['place-search']) {
                    let currentDom = document.getElementById(this.inputId);
                    let sizeObj = currentDom.getBoundingClientRect(); // 取得元素距离窗口的绝对位置
                    // 元素相对于页面的绝对位置 = 元素相对于窗口的绝对位置
                    let inputWidth = currentDom.clientWidth;// input的宽度
                    let inputHeight = currentDom.clientHeight + 2;// input的高度，2是上下border的宽
                    let offsetTop = sizeObj.top + inputHeight; // 距顶部
                    let offsetLeft = sizeObj.left; // 距左侧
                    this.$refs['place-search'].changePost(offsetLeft, offsetTop, inputWidth, inputHeight);
                }
            },
            // 获取子组件返回的位置信息
            getPlaceLocation:function(item) { 
                console.log(item);
                if(item) {
                    this.resultVisible = false;
                    if(item.location && item.location.getLat()) {
                        this.pickAddress(this.inputId, item.location.getLng(), item.location.getLat());
                    } else {
                        this.geocoder(item.name, this.inputId);
                    }
                }
            },
            // 地图选址
            pickAddress:function(inputId, lon, lat, index) {
            	if (!index) {
            		index = 2;
            	}
            	 if(inputId === "sname") {
                    this.snameMapShow = true;
                    var _self = this;
                    AMapUI.loadUI(['misc/PositionPicker'], function(PositionPicker) {
                    	_self.snameMap = new AMap.Map('sNameMap', {
                        zoom: 16,
                        scrollWheel: false,
                        center: [lon,lat]
                    });
                    let positionPicker = new PositionPicker({
                        mode: 'dragMap',
                        map: _self.snameMap
                    }); 
                    positionPicker.on('success', function(positionResult)  {
                    		if (index != 1) { //初始加载不同步至父组件 
                    			_self.addForm.slat = positionResult.position.lat;
                             	_self.addForm.slon = positionResult.position.lng;
                             	_self.addForm.sname = positionResult.address;
                             	_self.$emit('select-address', _self.addForm.sname,_self.addForm.slat,_self.addForm.slon);
                    		}
                    		index ++;
                    });
                    positionPicker.on('fail', function(positionResult)  {
                    	_self.$message.error("地址选取失败");
                    });
                    positionPicker.start();
                    
                    AMap.plugin([
                        'AMap.ToolBar',
                    ], function(){ 
                        // 在图面添加工具条控件，工具条控件集成了缩放、平移、定位等功能按钮在内的组合控件
                    	_self.snameMap.addControl(new AMap.ToolBar({ 
                             liteStyle: true
                         }));
                    });
                });
            	 }
            },
            // 地理编码
            geocoder:function(keyword, inputValue) {
            	var _self = this;
                let geocoder = new AMap.Geocoder({
                    city: "合肥", //城市，默认：“全国”
                    radius: 1000 //范围，默认：500
                });
                //地理编码,返回地理编码结果
                geocoder.getLocation(keyword, function (status, result)  {
                    if (status === 'complete' && result.info === 'OK') {
                    let geocode = result.geocodes;
                    if (geocode && geocode.length > 0) {
                        if (inputValue === "sname") {
                        	_self.addForm.slat = geocode[0].location.getLat();
                        	_self.addForm.slon = geocode[0].location.getLng();
                        	_self.addForm.sname = keyword;
                        	_self.$emit('select-address', _self.addForm.sname,_self.addForm.slat,_self.addForm.slon);
                            // 如果地理编码返回的粗略经纬度数据不需要在地图上显示，就不需要调用地图选址，且要隐藏地图
                            // this.pickAddress("sname", geocode[0].location.getLng(), geocode[0].location.getLat());
                        	_self.snameMapShow = false; 
                        }
                    }
                }
            });
            },
            // 做删除操作时还原经纬度并验证字段
            deletePlace:function(inputId) {
                if (inputId === "sname") {
                    this.addForm.slat = 0;
                    this.addForm.slon = 0;
                }
            }
        },
        beforeDestroy: function() {
            document.removeEventListener("click", this.hidePlaces, false);
        }
    })
