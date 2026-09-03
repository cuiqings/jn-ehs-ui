<template>
  <div class="bf-wrap">
    <a-form :labelCol='labelCol' :wrapperCol='wrapperCol'>

      <a-form-item label='线条颜色'>
        <color-picker 
          v-model:hex="value.stroke" 
          @change="changeNode('stroke', value.stroke)" 
        />
      </a-form-item>
      <a-form-item label='线条样式'>
        <a-select
          placeholder="线条样式"
          style="width: 168px"
          v-model:value="value.connector"
          @change="changeNode('connector', value.connector)"
        >
          <a-select-option 
            v-for="(item,index) in connectorOpts" 
            :value="item.value"
            :key="index"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label='线条宽度'>
        <a-input-number
          :min="2" :step="2" :max="4"
          v-model:value="value.strokeWidth" 
          @change="changeNode('strokeWidth', value.strokeWidth)"
        />
      </a-form-item>
      <a-form-item label='双向箭头'>
        <a-switch 
          v-model:checked="value.isArrows" 
          @change="changeArrows" 
        />
      </a-form-item>
      <a-form-item label='流动线条'>
        <a-switch 
          v-model:checked="value.isAnit" 
          @change="changeAnit" 
        />
      </a-form-item>
      <a-form-item label='调整线条'>
        <a-switch 
          v-model:checked="value.isTools" 
          @change="changeTools" 
        />
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import ColorPicker from 'colorpicker-v3'  // 注册组件
import 'colorpicker-v3/style.css' // 引入样式文件

export default {
  name: 'EdgeForm',
  props: {
    value: {
      type: Object,
      default: {}
    }
  },
  components: {
    ColorPicker
  },
  data() {
    return {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 17 }
      },
      connectorOpts:[{
        label:'直角',
        value:'normal'
      },{
        label:'圆角',
        value:'rounded'
      },{
        label:'平滑',
        value:'smooth'
      },{
        label:'跳线(两线交叉)',
        value:'jumpover'
      }]
    }
  },
  methods: {
    // 修改节点
    changeNode(type, value){
      this.$emit('changeEdge', {type,value})
    },
    changeArrows(value){
      console.log(value, '---000')
      this.$emit('changeEdge', {type: 'isArrows',value})
    },
    changeAnit(value){
      this.$emit('changeEdge', {type: 'isAnit',value})
    },
    changeTools(value){
      this.$emit('changeEdge', {type: 'isTools',value})
    },
  }
}
</script>

<style scoped lang="less">
  .bf-wrap{
    padding: 16px 16px 0;
  }  
  :deep(.ant-form-item){
    margin-bottom: 10px;
  }
  :deep(.zs-color-picker-panel){
    left: -40px;
  }
  :deep(.zs-color-picker-btn){
    display: inline-block;
    vertical-align: middle;
  }
  :deep(.zs-color-picker-panel__visible){
    z-index: 3;
  }
</style>