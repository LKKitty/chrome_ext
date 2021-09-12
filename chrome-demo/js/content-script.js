console.log('这是content script!');
// 注意，必须设置了run_at=document_start 此段代码才会生效
document.addEventListener('DOMContentLoaded', function()
{
	// 注入自定义JS
	injectCustomJs();
	if(location.host == 'www.baidu.com')
	{
		function fuckBaiduAD()
		{
			if(document.getElementById('my_custom_css')) return;
			let temp = document.createElement('style');
			temp.id = 'my_custom_css';
			(document.head || document.body).appendChild(temp);
			let css = `
			/* 移除百度顶部广告 */
			#content_left .div:not(.result){display:none;!important}
			/* 移除百度右侧广告热搜 */
			#content_right{display:none;}
			`;
			temp.innerHTML = css;
			console.log('已注入自定义CSS！');
			// 屏蔽百度推广信息
			removeAdByJs();
			// 这种必须用JS移除的广告一般会有延迟，干脆每隔一段时间清楚一次
			interval = setInterval(removeAdByJs, 2000);
			
			// 重新搜索时页面不会刷新，但是被注入的style会被移除，所以需要重新执行
			temp.addEventListener('DOMNodeRemoved', function(e)
			{
				console.log('自定义CSS被移除，重新注入！');
				if(interval) clearInterval(interval);
				fuckBaiduAD();
			});
		}
		let interval = 0;
		function removeAdByJs()
		{
			$('[data-tuiguang]').parents('[data-click]').remove();
		}
		fuckBaiduAD();
		initCustomPanel();
		initCustomEventListen();
	}
});


function initCustomPanel()
{
	let panel = document.createElement('div');
	panel.className = 'chrome-plugin-demo-panel';
	panel.innerHTML = `
		<h2>injected-script操作content-script演示区：</h2>
		<div class="btn-area">
			<a href="javascript:sendMessageToContentScriptByPostMessage('你好，我是普通页面！')">通过postMessage发送消息给content-script</a><br>
			<a href="javascript:sendMessageToContentScriptByEvent('你好啊！我是通过DOM事件发送的消息！')">通过DOM事件发送消息给content-script</a><br>
			<a href="javascript:invokeContentScript('sendMessageToBackground()')">发送消息到后台或者popup</a><br>
		</div>
		<div id="my_custom_log">
		</div>
	`;
	document.body.appendChild(panel);
}

// 向页面注入JS
function injectCustomJs(jsPath)
{
	jsPath = jsPath || 'js/inject.js';
	let temp = document.createElement('script');
	temp.setAttribute('type', 'text/javascript');
	// 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
	temp.src = chrome.extension.getURL(jsPath);
	temp.onload = function()
	{
		// 放在页面不好看，执行完后移除掉
		this.parentNode.removeChild(this);
	};
	document.body.appendChild(temp);
}
// 主动发送消息给后台
// 要演示此功能，请打开控制台主动执行sendMessageToBackground()
function sendMessageToBackground(message) {
	chrome.runtime.sendMessage({greeting: message || '你好，我是content-script呀，我主动发消息给后台！'}, function(response) {
		tip('收到来自后台的回复：' + response);
	});
}
// 接收来自后台的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	console.log('收到来自 ' + (sender.tab ? "content-script(" + sender.tab.url + ")" : "popup或者background") + ' 的消息：', request);
	if(request.cmd == 'update_font_size') {
		var ele = document.createElement('style');
		ele.innerHTML = `* {font-size: ${request.size}px !important;}`;
		document.head.appendChild(ele);
	}
	else {
		tip(JSON.stringify(request));
		sendResponse('我收到你的消息了：'+JSON.stringify(request));
	}
});

//初始化监听事件
function initCustomEventListen() {
	let hiddenDiv = document.getElementById('myCustomEventDiv');
	if(!hiddenDiv) {
		hiddenDiv = document.createElement('div');
		hiddenDiv.style.display = 'none';
		hiddenDiv.id = 'myCustomEventDiv';
		document.body.appendChild(hiddenDiv);
	}
	hiddenDiv.addEventListener('myCustomEvent', function() {
		let eventData = document.getElementById('myCustomEventDiv').innerText;
		tip('收到自定义事件：' + eventData);
	});
}

// 监听postMessage
window.addEventListener("message", function(e)
{
	console.log('收到消息：', e.data);
	if(e.data && e.data.cmd == 'invoke') {
		eval('('+e.data.code+')');
	}
	else if(e.data && e.data.cmd == 'message') {
		tip(e.data.data);
	}
}, false);

let tipCount = 0;
// 简单的消息通知
function tip(info) {
	info = info || '';
	let ele = document.createElement('div');
	ele.className = 'chrome-plugin-simple-tip slideInLeft';
	ele.style.top = tipCount * 70 + 100 + 'px';
	ele.innerHTML = `<div>${info}</div>`;
	document.body.appendChild(ele);
	ele.classList.add('animated');
	tipCount++;
	console.log("执行消息通知")
	setTimeout(() => {
		ele.style.top = '-200px';
		setTimeout(() => {
			ele.remove();
			tipCount--;
		}, 400);
	}, 3000);
}