// 打开后台页
$('#open_background').click(e => {
    // 获取后台页面路径
	window.open(chrome.extension.getURL('background.html'));
});

// 调用后台JS
$('#invoke_background_js').click(e => {
    // 获取background对象
	var bg = chrome.extension.getBackgroundPage();
    // 调用其方法
	bg.testBackground();
});