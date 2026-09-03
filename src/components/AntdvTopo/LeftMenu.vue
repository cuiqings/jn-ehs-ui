<template>
  <a-collapse default-active-key="1" :bordered="false">
    <a-collapse-panel key="1" header="基础组件" :style="customStyle">
      <ul class="menu-list">
        <li draggable="true" @drag="menuDrag('baseImage')">
          <a-icon type="picture" /><strong>基础图片</strong>
        </li>
        <li draggable="true" @drag="menuDrag('pathImage')">
          <a-icon type="heart" /><strong>矢量图片</strong>
        </li>
        <li draggable="true" @drag="menuDrag('textBlock')">
          <a-icon type="font-colors"></a-icon><strong>文字</strong>
        </li>
        <li draggable="true" @drag="menuDrag('textField')">
          <a-icon type="number"></a-icon><strong>变量</strong>
        </li>
      </ul>
    </a-collapse-panel>
    <a-collapse-panel key="2" header="图形组件" :style="customStyle">
      <ul class="menu-list">
        <li draggable="true" @drag="menuDrag('defaultOval')">
          <i class="c-icon icon-oval" /><strong>椭圆形</strong>
        </li>
        <li draggable="true" @drag="menuDrag('defaultSquare')">
          <i class="c-icon icon-square" /><strong>矩形</strong>
        </li>
        <li draggable="true" @drag="menuDrag('defaultYSquare')">
          <i class="c-icon icon-ysquare" /><strong>圆角矩形</strong>
        </li>
        <li draggable="true" @drag="menuDrag('defaultRhombus')">
          <i class="c-icon icon-rhombus" /><strong>菱形</strong>
        </li>
        <li draggable="true" @drag="menuDrag('defaultRhomboid')">
          <i class="c-icon icon-rhomboid" /><strong>平行四边形</strong>
        </li>
        <li draggable="true" @drag="menuDrag('defaultCircle')">
          <i class="c-icon icon-circle" /><strong>圆形</strong>
        </li>
      </ul>
    </a-collapse-panel>
  </a-collapse>
  
</template>

<script>
export default {
  name: 'LeftMenu',
  // props: {
  //   value: {
  //     type: Object,
  //     default: {}
  //   },
  // },
  components: {
    
  },
  data() {
    return {
      customStyle: 'background: #fff;'
    }
  },
  created() {
  },
  methods: {
    menuDrag(type){
      this.$emit('menuDrag', type)
    }
    
  }
}
</script>

<style scoped lang="less">
  .menu-list{
    padding: 0;
    li{
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #555;
      background: #fff;
      margin: 10px 0px;
      font-size: 12px;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all 0.5s ease;
      &:hover{
        box-shadow: 0 0 5px rgba(0,0,0,.3);
      }
      i{
        font-size: 18px;
        margin-right: 10px;
      }
      .c-icon{
        display: inline-block;
        width: 18px;
        height: 14px;
        border: 2px solid #555;
        &.icon-oval{
          border-radius: 10px;
        }
        &.icon-ysquare{
          border-radius: 4px;
        }
        &.icon-rhombus{
          width: 14px;
          transform: rotate(45deg);
        }
        &.icon-rhomboid{
          width: 14px;
          transform: skew(-30deg);
        }
        &.icon-circle{
          height: 18px;
          border-radius: 18px;
        }
      }
      strong{
        flex: 1;
      }
    }
  }
    
</style>