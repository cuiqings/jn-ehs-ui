import type { App, Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '../store/modules/user'
import dayjs from 'dayjs'

interface WatermarkDirectiveOptions {
  text?: string | string[]
  color?: string
  fontSize?: number
  opacity?: number
  rotate?: number
  gapX?: number
  gapY?: number
  zIndex?: number
}

const defaultDirectiveOptions: WatermarkDirectiveOptions = {
  text: '系统水印',
  color: 'rgba(0, 0, 0, 0.15)',
  fontSize: 16,
  opacity: 0.15,
  rotate: -30,
  gapX: 100,
  gapY: 100,
  zIndex: 9999
}

const COUNT = 120;

// 创建水印Canvas
function createWatermarkCanvas(options: WatermarkDirectiveOptions): HTMLCanvasElement {
  const userStore = useUserStore();
  const text = [`${userStore.getUserInfo.realname}(${userStore.getUserInfo.username})`, dayjs().format('YYYY-MM-DD HH:mm:ss')];
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const dpr = window.devicePixelRatio || 1
  
  canvas.width = options.gapX! * 2 * dpr
  canvas.height = options.gapY! * 2 * dpr
  canvas.style.width = `${options.gapX! * 2}px`
  canvas.style.height = `${options.gapY! * 2}px`
  
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  ctx.fillStyle = options.color!
  ctx.globalAlpha = options.opacity!
  ctx.font = `${options.fontSize}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  ctx.translate(options.gapX!, options.gapY!)
  ctx.rotate((options.rotate! * Math.PI) / 180)
  
  const texts = text; // Array.isArray(options.text) ? options.text : [options.text]
  const lineHeight = options.fontSize! * 1.5
  
  texts.forEach((line, index) => {
    const y = index * lineHeight - ((texts.length - 1) * lineHeight) / 2
    ctx.fillText(line!, 0, y)
  })
  
  return canvas
}

// 水印指令
const watermarkDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<WatermarkDirectiveOptions | string>) {
    // const options = typeof binding.value === 'string' 
    //   ? { ...defaultDirectiveOptions, text: binding.value }
    //   : { ...defaultDirectiveOptions, ...binding.value }

    const options = { 
      ...defaultDirectiveOptions,
      color: 'rgba(0, 100, 255, 1)',
      gapX: COUNT,
      gapY: COUNT 
    }
    
    // 创建水印容器
    const watermarkContainer = document.createElement('div')
    watermarkContainer.className = 'v-watermark'
    
    // 设置水印样式
    const canvas = createWatermarkCanvas(options)
    watermarkContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: ${options.zIndex};
      background-image: url(${canvas.toDataURL()});
      background-repeat: repeat;
      background-size: ${options.gapX! * 2}px ${options.gapY! * 2}px;
    `
    
    // 设置原元素样式
    if (window.getComputedStyle(el).position === 'static') {
      el.style.position = 'relative'
    }
    
    // 添加水印
    el.appendChild(watermarkContainer)
    
    // 存储水印容器以便更新
    el._watermark = watermarkContainer
    el._watermarkOptions = options
  },
  
  updated(el: HTMLElement, binding: DirectiveBinding<WatermarkDirectiveOptions | string>) {
    // const options = typeof binding.value === 'string' 
    //   ? { ...defaultDirectiveOptions, text: binding.value }
    //   : { ...defaultDirectiveOptions, ...binding.value }
    const options = { 
      ...defaultDirectiveOptions,
      color: 'rgba(0, 100, 255, 1)',
      gapX: COUNT,
      gapY: COUNT 
    }
    
    if (el._watermark && JSON.stringify(el._watermarkOptions) !== JSON.stringify(options)) {
      const canvas = createWatermarkCanvas(options)
      el._watermark.style.backgroundImage = `url(${canvas.toDataURL()})`
      el._watermark.style.backgroundSize = `${options.gapX! * 2}px ${options.gapY! * 2}px`
      el._watermarkOptions = options
    }
  },
  
  unmounted(el: HTMLElement) {
    if (el._watermark && el._watermark.parentNode === el) {
      el.removeChild(el._watermark)
    }
  }
}

// 类型扩展
declare global {
  interface HTMLElement {
    _watermark?: HTMLDivElement
    _watermarkOptions?: WatermarkDirectiveOptions
  }
}

// 注册全局指令
export function setupWatermarkDirective(app: App) {
  app.directive('watermark', watermarkDirective)
}

export default watermarkDirective
