<template>
  <div class="ht-wrap">
    <ul class="t-list">
      <li @click="goBack()">
        <a-icon type="rollback" />
        <span>返回</span>
      </li>
      <li @click="preview()">
        <a-icon type="eye" />
        <span>预览</span>
      </li>
      <li @click="save()">
        <a-icon type="save" />
        <span>保存</span>
      </li>
      <li @click="undo()" :class="{'no-open': !historyObj.canUndo}">
        <a-icon type="undo" />
        <span>撤销</span>
      </li>
      <li @click="redo()" :class="{'no-open': !historyObj.canRedo}">
        <a-icon type="redo" />
        <span>重做</span>
      </li>
      <li @click="fullScreen()">
        <a-icon v-if="isFullScreen" type="fullscreen-exit" />
        <a-icon v-else type="fullscreen" />
        <span>{{ isFullScreen ? '退出' : '全屏' }}</span>
      </li>
    </ul>
    <ul class="t-list">
      <li 
        @click="changeCellNode('arrowUp')" 
        :class="{'no-open': !isOpen || selectCells.length>1}"
      >
        <a-icon type="arrow-up" />
        <span>上移一层</span>
      </li>
      <li 
        @click="changeCellNode('topic')" 
        :class="{'no-open': !isOpen || selectCells.length>1}"
      >
        <a-icon type="vertical-align-top" />
        <span>置顶</span>
      </li>
      <li 
        @click="changeCellNode('arrowDown')" 
        :class="{'no-open': !isOpen || selectCells.length>1}"
      >
        <a-icon type="arrow-down" />
        <span>下移一层</span>
      </li>
      <li 
        @click="changeCellNode('tobot')" 
        :class="{'no-open': !isOpen || selectCells.length>1}"
      >
        <a-icon type="vertical-align-bottom" />
        <span>置底</span>
      </li>
      <li 
        @click="changeCellNode('copy')" 
        :class="{'no-open': !isOpen && !selectCells.length}"
      >
        <a-icon type="copy" />
        <span>复制</span>
      </li>
      <li @click="changeCellNode('paste')">
        <a-icon type="snippets" />
        <span>粘贴</span>
      </li>
      <li 
        @click="changeCellNode('del')" 
        :class="{'no-open': !isOpen && !selectCells.length}"
      >
        <a-icon type="delete" />
        <span>删除</span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'HeaderTools',
  components: {
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    selectCells: {
      type: Array,
      default: []
    },
    historyObj: {
      type: Object,
      default: {}
    },
  },
  data() {
    return {
      isFullScreen: false
    }
  },
  methods: {
    goBack(){
      this.$router.go(-1)
    },
    preview(){
      this.$emit('changePreview')
    },
    save(){
      this.$emit('changeSave')
    },
    undo(){
      this.$emit('changeUndo')
    },
    redo(){
      this.$emit('changeRedo')
    },
    changeCellNode(value){
      this.$emit('changeCellNode', value)
    },
    fullScreen(){
      this.isFullScreen = !this.isFullScreen
      this.$emit('fullScreen', this.isFullScreen)
    }
  }
}
</script>

<style scoped lang="less">
  .ht-wrap{
    height: 50px;
    background-color: #ffffff;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: center;
    .t-list{
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0;
      padding: 6px 16px;
      li{
        margin-right: 24px;
        list-style: none;
        text-align: center;
        cursor: pointer;
        >i{
          font-size: 20px;
        }
        >span{
          font-size: 13px;
          display: block !important;
          padding-bottom: 4px;
          line-height: 13px;
        }
        &.no-open{
          pointer-events: none;
          opacity: .5;
          cursor: not-allowed;
          >i,>span{
            width: 100%;
            cursor: not-allowed;
          }
        }
      }
    }
  } 
</style>