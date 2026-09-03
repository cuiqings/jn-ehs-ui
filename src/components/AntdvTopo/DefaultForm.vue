<template>
  <div class="bf-wrap">
    <a-form :labelCol='labelCol' :wrapperCol='wrapperCol'>
      <a-form-item label='宽度W'>
        <a-input-number
          :min="10" :max="10000" :step="1"
          :precision="0"
          :formatter="numFormatter"
          v-model:value="value.width" 
          @change="changeNode('width', value.width)"
        />
      </a-form-item>
      <a-form-item label='高度H'>
        <a-input-number
          :min="10" :max="10000" :step="1"
          :precision="0"
          :formatter="numFormatter"
          v-model:value="value.height" 
          @change="changeNode('height', value.height)"
        />
      </a-form-item>
      <a-form-item label='位置X'>
        <a-input-number
          :min="10" :max="10000" :step="1"
          :precision="0"
          :formatter="numFormatter"
          v-model:value="value.x" 
          @change="changeNode('x', value.x)"
        />
      </a-form-item>
      <a-form-item label='位置Y'>
        <a-input-number
          :min="10" :max="10000" :step="1"
          :precision="0"
          :formatter="numFormatter"
          v-model:value="value.y" 
          @change="changeNode('y', value.y)"
        />
      </a-form-item>
      <a-form-item label='文本'>
        <a-input
          placeholder='请输入'
          :maxLength="100"
          v-model:value="value.labelText" 
          @change="changeNode('labelText', value.labelText)"
        />
      </a-form-item>
      <a-form-item label='字号'>
        <a-input-number
          :min="10" :max="10000" :step="1"
          :precision="0"
          :formatter="fontFormatter"
          v-model:value="value.fontSize"
          @change="changeNode('fontSize', value.fontSize)"
        />
      </a-form-item>
      <a-form-item label='字色'>
        <color-picker 
          v-model:hex="value.fontFill" 
          @change="changeNode('fontFill', value.fontFill)" 
        />
      </a-form-item>
      <a-form-item label='背景色'>
        <color-picker 
          v-model:hex="value.fill" 
          @change="changeNode('fill', value.fill)" 
        />
      </a-form-item>
      <a-form-item label='边框色'>
        <color-picker 
          v-model:hex="value.stroke" 
          @change="changeNode('stroke', value.stroke)" 
        />
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import ColorPicker from 'colorpicker-v3'  // 注册组件
import 'colorpicker-v3/style.css' // 引入样式文件

export default {
  name: 'DefaultForm',
  components: {
    ColorPicker
  },
  props: {
    value: {
      type: Object,
      default: {}
    }
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
      
    }
  },
  created() {
    // console.log(this.value,'-----000')
  },
  // watch:{
  //   value:{
  //     handler: function(val){
  //       console.log(val,'09900909')
  //     },
  //     deep: true,
  //     immediate: true
  //   }
  // },
  methods: {
    // 修改基础图片节点
    changeNode(type, value){
      this.$emit('changeDefault', {type,value})
    },
    numFormatter(value){
      if(value === ''){
        return '10'
      } else {
        return value
      }
    },
    fontFormatter(value){
      if(value === ''){
        return '13'
      } else {
        return value
      }
    }
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
</style>