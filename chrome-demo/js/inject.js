// 通过postMessage调用content-script
function invokeContentScript(code)
{
	window.postMessage({cmd: 'invoke', code: code}, '*');
}
// 发送普通消息到content-script
function sendMessageToContentScriptByPostMessage(data)
{
	window.postMessage({cmd: 'message', data: data}, '*');
}

// 通过DOM事件发送消息给content-script
(function() {
	// 创建一个自定义事件
	let customEvent = new CustomEvent('myCustomEvent');
	// 通过事件发送消息给content-script
	function sendMessageToContentScriptByEvent(data) {
		data = data || '你好，我是injected-script!';
		var hiddenDiv = document.getElementById('myCustomEventDiv');
		hiddenDiv.innerText = data
		/* 触发自定义事件 */
		hiddenDiv.dispatchEvent(customEvent);
	}
	window.sendMessageToContentScriptByEvent = sendMessageToContentScriptByEvent;
})();