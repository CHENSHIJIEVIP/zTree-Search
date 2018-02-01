	/*----------  add by chenshijie  on 2018/1/27 树形菜单初始化 开始  ----------*/
	var zTreeObj    		//ztree对象
	var hiddenNodes=[]; 	//用于存储被隐藏的结点

	$(function(){
		init();
	})

	function init(){
		// zTree 的数据属性，测试数据，也可以从数据库拉取
    	var zNodes = [
    		{	
	    		tId:"1",
	            name: "所有可选择机构",
	            open: true,
	            isParent:true
     	  	}	
    	];

    	var setting = {
    		async: {
    			enable: true,
			},
			data: {
				simpleData: {
					enable: true,
					idKey: "id",
					pIdKey: "pId",
					rootPId: 0
				}
			},
	    	callback:{
	    		onExpand:zTreeOnExpand,
	    		onClick: zTreeOnClick,
	    		beforeAsync:beforeAsyncData
	    	}
	    };

	    zTreeObj = $.fn.zTree.init($("#treeDemo"), setting, zNodes);

	    /*初始化加载option数据*/
        queryOrganizationName();
	}
	/*----------  add by chenshijie  on 2018/1/27 树形菜单初始化 结束  ----------*/

	/*----------  add by chenshijie  on 2018/1/27 树形菜单处理方法 开始  ----------*/

	/*默认初始化节点*/
	function beforeAsyncData(treeId, treeNode){
		if(treeNode!=undefined && treeNode.level >= 0){
			getTreeData(1);
        }
	}

	/*获取对应树形数据*/
	function getTreeData(id){
		$.ajax({
			type:'get',
			url:'./data/treeDate'+id+'.json',
			dataType:'text',
			success:function(data){
				var setting = zTreeObj.setting;
				// console.log(data);
				var zNodes = eval(data);
				// console.log(zNodes);
				zTreeObj.destroy();
				zTreeObj = $.fn.zTree.init($("#treeDemo"), setting, zNodes);
			}
		})
	}

	/*异步加载树结构*/
    function zTreeOnExpand(event, treeId, treeNode){
		var zTree = $.fn.zTree.getZTreeObj("treeDemo");
		treeNode.icon = "./css/zTreeStyle/img/loading.gif";
		zTree.updateNode(treeNode);
	  	setTimeout(function() {
			treeNode.icon = "";
			zTree.updateNode(treeNode);
	  	}, 300);
	};

	/*点击子节点添加到div*/
    function zTreeOnClick(event, treeId, treeNode) {
    	if(!treeNode.isParent){
    		/*console.log(treeNode.id+","+treeNode.name);
    		console.log(event+'---'+treeId+'---'+treeNode);*/
    		// 请求组织机构节点对应的人员
    		var userUIL = './data/userData/userData'+treeNode.id+'.json';
    		$.ajax({
    			type:'get',
    			url:userUIL,
    			dataType:'json',
    			success:function(data){
	    				var str = '<ul>';
    				$.each(data.personnels,function(i,n){
    					str+='<li Uid='+n['user_id'] +'>'+n['user_name']+'</li>';
    				})
    				str+='</ul>';
    				var nodeId = $('.rightUser #'+treeNode.id);
    				if(nodeId == null || nodeId.length == 0){
    					$("#Selectable").empty();
    					$('#Selectable').append(str);
    				}
    			}
    		})
    	}
	};
    /*----------  add by chenshijie  on 2018/1/27 树形菜单处理方法 结束  ----------*/

    /*----------  add by chenshijie  on 2018/1/27 查询方法 开始  ----------*/

    /*关键字查询人员*/
	$('#searchBtn').click(function(){
		var _kwSelect = $('#kwSelect').val();
		$.ajax({
			type:'get',
			url:'./data/userData/userData3.json',
			dataType:'json',	
			success:function(data){
				$.each(data.personnels,function(i,n){
					// console.log(n.user_id+','+n.user_name);
					var uname = n.user_name;
					// console.log(uname);
					if(_kwSelect == uname){
						var str = '<ul>';
						str += '<li uid='+n['user_id'] +'>'+uname+'</li>';
						str += '</ul>';
						$("#Selectable").empty();
    					$('#Selectable').append(str);
					}
				})
			},error:function(res){
				console.log(res);
			}
		})
		$('#kwSelect').val("");
	})

	/*查询机构名称*/
	function queryOrganizationName(){
		var rootTreeUIL = './data/mechanismData.json';
		$.ajax({
			type:'get',
			url:rootTreeUIL,
			dataType:'json',
			success:function(data){
				// console.log(typeof data);
				var optionObj = '';
				$.each(data.mechanism,function(i,n){
					optionObj += '<option value='+n.id+'>'+n.name+'</option>'
				})
				// console.log(optionObj);
				$('#mechanismID').append(optionObj);
			},
			error:function(res){
				console.log(res.status);
			}
		});
		changeSelect()
	}

	/*选中机构名称*/
	function changeSelect(){
		$("#mechanismID").change(function(){
		    optvalue = $("#mechanismID").val();
			getTreeData(optvalue);
		});
	}
 	/*----------  add by chenshijie  on 2018/1/27 查询方法 开始  ----------*/

    /*----------  add by chenshijie  on 2018/1/27 主体功能按钮 开始  ----------*/

	/*点击当前名称变色*/
	$('.userBox').on('click', 'li', function(){
		// console.log(this);
		$("li").removeClass("selected");
		$(this).addClass('selected');
	});

	/*添加所选人员*/
	$('#addNode').click(function(){
		var selNode = $("#Selectable .selected");
		if(selNode.attr('class') == undefined){
			$.alert({
			    title: '提示!',
			    content: '请选中相关人员',
		    	confirm: function(){
		       		alert('Confirmed!');
		    	}
			})
		}
		var chooseNode = $('#Choose ul');
		var selId = selNode.attr("uid")
		var flag = true;
		for(var i = 0; i < chooseNode.children().length; i++){
			var chooseId = chooseNode.children().eq(i).attr('uid');
			if (selId == chooseId) {
				flag = false;
			}
		}
		if (flag) {
			chooseNode.prepend(selNode.clone());
		}
		selNode.removeClass("selected");
	});

	/*添加全部人员*/
	$('#addNodeAll').click(function(){
		var selNode = $("#Selectable ul");
		var chooseNode = $('#Choose ul');
		for(var i = selNode.children().length; i >= 0; i--){
			var flag = true;
			var selId = selNode.children().eq(i).attr('uid');
			for(var j = 0; j < chooseNode.children().length; j++){
				var chooseId = chooseNode.children().eq(j).attr('uid');
				if(selId == chooseId){
					flag = false;
				}
			}
			var a = selNode.children().eq(i)
			if(flag){
				chooseNode.prepend(a.clone());
			}
		}
		$("#Selectable .selected").removeClass("selected");
	})

	/*上移所选人员*/
	$('#moveNode').click(function(){
		var chooseNode = $("#Choose .selected");
		var prevNode = chooseNode.prev();
		prevNode.before(chooseNode);
	});

	/*下移所选人员*/
	$('#downNode').click(function(){
		var chooseNode = $("#Choose .selected");
		var prevNode = chooseNode.next();
		prevNode.after(chooseNode);
	});

	/*删除所选人员*/
	$('#deleteNode').click(function(){
		var chooseNode = $("#Choose .selected");
		// console.log(chooseNode);
		if(chooseNode == null || chooseNode.length == 0){
			$.alert({
			    title: '提示!',
			    content: '请选中相关人员',
		    	confirm: function(){
		       		alert('Confirmed!');
		    	}
			})
			return false;
		}
		$.confirm({
		    title: '提示!',
		    content: '确定要删除吗？',
		    buttons: {
		        确定: function () {
		           	chooseNode.remove();
		        },
		        取消: function () {
		            // $.alert('Canceled!');
		        }
		    }
		})
	});

	/*删除全部人员*/
	$('#deleteNodeAll').click(function(){
		var selNode = $("#Choose ul>li");
		$.confirm({
		    title: '提示!',
		    content: '确定要全部删除吗？',
		    buttons: {
		        确定: function () {
		           	selNode.remove();
		        },
		        取消: function () {
		            // $.alert('Canceled!');
		        }
		    }
		})
	});

	/*确认提交*/
	$('#Determine').click(function(){
		/*var selNode = $('#Choose .selected');
		window.location.href='ztree.html?id=' + selNode.attr('id') + '&name=' + encodeURI(encodeURI(selNode.text()));*/

		var selid = $('#Choose ul li');
		for(var i = 0; i <selid.length; i++){
			console.log(selid.eq(i).attr('uid')+':'+selid.eq(i).text());
		}
		// console.log(selname);

	});
	/*----------  add by chenshijie  on 2018/1/27 index主体功能按钮 结束  ----------*/