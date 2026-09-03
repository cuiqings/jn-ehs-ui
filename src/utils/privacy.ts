import { consoleBlock } from './consoleBlock'
export const privacy = () => {
  if(import.meta.env.DEV) return;
  // 判断为移动端
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if(isMobile) return;
  const host = window.location.host;
  if(host && host.startsWith('192')) return;
  consoleBlock();
  // 1. 禁用F12按键
  document.addEventListener('keydown', function (e) {
    // F12键的keyCode是123
    if (e.keyCode === 123) {
      e.preventDefault(); // 阻止默认行为
      e.stopPropagation(); // 阻止事件冒泡
      return false;
    }
    // 禁用Ctrl+Shift+I (Chrome/Firefox等浏览器打开开发者工具的快捷键)
    if ((e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
      // 禁用Ctrl+Shift+C (检查元素)
      (e.ctrlKey && e.shiftKey && e.keyCode === 67) ||
      // 禁用Ctrl+Shift+J (控制台)
      (e.ctrlKey && e.shiftKey && e.keyCode === 74)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  });

  // 2. 禁用右键菜单 (防止右键"检查"选项)
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  });

  // 3. 检测开发者工具是否被打开 (进阶)
  function detectDevTools() {
    const threshold = 160;
    const width = window.outerWidth - window.innerWidth;
    const height = window.outerHeight - window.innerHeight;

    if (width > threshold || height > threshold) {
      // 开发者工具被打开，可以执行自定义操作
      alert('检测到开发者工具被打开，页面将刷新！');
      window.location.reload();
    }
  }

  // 定时检测
  setInterval(detectDevTools, 1000);

  // 4. 禁用鼠标拖动选择 (可选)
  // document.addEventListener('selectstart', function (e) {
  //   e.preventDefault();
  //   return false;
  // });
}
