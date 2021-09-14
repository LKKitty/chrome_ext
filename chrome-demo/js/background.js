//-------------------- 右键菜单演示 ------------------------//
// chrome.contextMenus.create 方法用于向菜单中注入菜单，第一个参数是传入一个对象，对象中针对不同的场景，也需要传入不同的配置项
chrome.contextMenus.create({
	title: "测试右键菜单",
	onclick: function(){
     alert("您刚才点击了自定义右键菜单！")
	}
});
chrome.contextMenus.create({
	title: '使用度娘搜索：%s', // %s表示选中的文字
	contexts: ['selection'], // 只有当选中文字时才会出现此右键菜单
	onclick: function(params)
	{
		// 注意不能使用location.href，因为location是属于background的window对象
		chrome.tabs.create({url: 'https://www.baidu.com/s?ie=utf-8&wd=' + encodeURI(params.selectionText)});
	}
});

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	console.log('收到来自content-script的消息：');
	sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request));
});

$('#test_cors').click((e) => {
	$.get('https://www.baidu.com', function(html){
		console.log( html);
		alert('跨域调用成功！');
	});
});


// 获取当前选项卡ID
function getCurrentTabId(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0].id: null);
	});
}

// 预留一个方法给popup调用
function testBackground() {
	alert('你好，我是background！');
}