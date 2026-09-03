<template>
  <div class="antv-wrapper">
    <div class="wrapper-canvas" :id="'wrapper'+index"></div>
  </div>
</template>
<script>
  import { Graph, Shape, DataUri } from '@antv/x6'
  import { configNodePorts } from './antvSetting'

  export default {
    name: "TopoPreview",
    props: {
      graphData: {
        type: Object,
        default: {}
      },
      index: {
        type: String,
        default: ''
      },
      // 点击组件 是否显示动画详情
      showApv: {
        type: Boolean,
        default: true
      },
    },
    data() {
      return {
        graph: null,
        curData: {},
        showDialog: false
      }
    },
    created() {
    },
    mounted () {
      // console.log(this.graphData,'graphData======-----')
      // this.initGraph()

    },
    beforeDestroy() {
      this.graph = null
    },
    watch:{
      graphData:{
        handler: function(){
          this.$nextTick(() => {
            console.log(this.graphData,'graphData======-----')
            this.initGraph()
          })
        },
        deep: true,
        immediate: true
      }
    },
    methods: {
      // 初始化渲染画布
      initGraph(val){
        const that = this
        if(!this.graph){
          const el = document.querySelector('.slick-current').getElementsByClassName('wrapper-canvas')[0]
          const graph = new Graph({
            container: el,
            width: 1920,
            height: 1080,
            grid: false,
            autoResize: true,
            interacting: false,
            connecting: {
              router: {
                name: 'manhattan',
                args: {
                  // padding: 1,
                },
              },
              connector: {
                name: 'rounded',
                args: {
                  radius: 8,
                },
              },
              anchor: 'center',
              connectionPoint: 'anchor',
              allowBlank: false,
              snap: {
                radius: 20,
              },
              createEdge() {
                return new Shape.Edge({
                  attrs: {
                    line: {
                      stroke: '#A2B1C3',
                      strokeWidth: 2,
                      targetMarker: {
                        name: 'block',
                        width: 12,
                        height: 8
                      },
                    },
                  },
                  zIndex: 0,
                })
              }
            },
          })
          // 点击事件
          // graph.on('cell:click', ({ cell, e }) => {
          //   // e.stopPropagation()
          //   this.handleCell(cell)
          // })
          // 赋值
          this.graph = graph
        }
        this.renderGraph()
      },
      // 返现方法
      renderGraph(){
        const portsGroups = configNodePorts().groups
        const {graphOpts = {},cellsOpts=[]} = this.graphData
        // 渲染画布
        this.graph.drawBackground({
          image: graphOpts.background,
          position: {x:0,y:0}
        })
        this.graph.resize(graphOpts.width, graphOpts.height)
        // 渲染组件
        if(cellsOpts.length){
          const jsonTemp = cellsOpts.map(item=>{
            if(item.ports) item.ports.groups = portsGroups
            return item
          })
          this.graph.fromJSON(jsonTemp)
        }
        // graph.centerContent()
      },
      // 点击 cell
      handleCell(cell){
        console.log(cell,'0099-------')
        const {apiData = ''} = cell.data || {}
        // 如果有动态数据 说明是动态节点
        if(apiData){
          this.showDialog = true
          this.curData = {
            ...apiData,
            ...cell.store.data.position
          }

        }

      },
      closed(){
        this.showDialog = false
      },
      wrapClick(){
        // this.closed()
      },
      goDetail(id){
        this.$router.push('/dataMonitoring/history?id='+id)
      },
      cellClick(e){
        // e.stopPropagation()
      },
      // 导出图片
      handleExport(){
        this.graph.toPNG((dataUri) => {
          console.log(dataUri,'00----')
          // 下载
          DataUri.downloadDataUri(dataUri, 'chart.png')
        })
      }

    }
  }
</script>
<style lang="less">
@keyframes ant-line {
  to {
      stroke-dashoffset: -1000
  }
}
</style>
<style lang="less" scoped="scoped">
.node-apv{
  position: absolute;
  left: 0px;
  top: 0px;
  min-width: 200px;
  border: 1px solid #eee;
  padding: 10px;
  background-color: #fff;
  box-shadow: 3px 3px 3px #999;
  .n-title{
    display: flex;
    justify-content: space-between;
    padding-bottom: 6px;
    border-bottom: 1px solid #eee;
  }
  .n-list{
    display: flex;
    justify-content: left;
    padding-top:5px;
    margin: 0;
    dd{
      margin: 0;
    }
  }
  .n-go{
    padding-top:5px;
    text-align: right;
    color: blue;
    cursor: pointer;
  }
}
.antv-wrapper{
  flex: 1;
  position: relative;
  // overflow: auto;
  height: 100%;
  .wrapper-canvas{
    position: relative;
    height: 100%;
    width: 100%;
  }
  .wrapper-tips{
    padding: 10px;
    display: flex;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    .wrapper-tips-item{
      span{
        padding-left: 10px;
        font-size: 12px;
      }
    }
  }
  .click-box{
    cursor: pointer;
  }
  /deep/ .x6-edge{
    >path{
      cursor: default;
    }
  }
}
</style>
