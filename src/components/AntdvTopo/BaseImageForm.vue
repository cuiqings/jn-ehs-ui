<template>
  <div class="bf-wrap">
    <a-form :labelCol='labelCol' :wrapperCol='wrapperCol'>
      <a-form-item label='导入图片'>
        <JImageUpload 
          text="上传"
          v-model:value="value.xlinkHref"
          accept="image/png, image/jpeg, image/jpg"
          @change="changeImageNode('xlinkHref', value.xlinkHref)"
        />
      </a-form-item>
      <a-form-item label='宽度W'>
        <a-input-number
          :min="10" :max="10000" :step="1"
          :precision="0"
          :formatter="numFormatter"
          v-model:value="value.width" 
          @change="changeImageNode('width', value.width)"
        />
      </a-form-item>
      <a-form-item label='高度H'>
        <a-input-number
          :min="10" :max="10000" :step="1"
          :precision="0"
          :formatter="numFormatter"
          v-model:value="value.height" 
          @change="changeImageNode('height', value.height)"
        />
      </a-form-item>
      <a-form-item label='位置X'>
        <a-input-number
          :min="0" :max="10000" :step="1"
          :precision="0"
          :formatter="numFormatter"
          v-model:value="value.x" 
          @change="changeImageNode('x', value.x)"
        />
      </a-form-item>
      <a-form-item label='位置Y'>
        <a-input-number
          :min="0" :max="10000" :step="1"
          :precision="0"
          :formatter="numFormatter"
          v-model:value="value.y" 
          @change="changeImageNode('y', value.y)"
        />
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import JImageUpload from './JImageUpload.vue';
export default {
  name: 'BaseImageForm',
  props: {
    value: {
      type: Object,
      default: {}
    }
  },
  components: {JImageUpload},
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
    changeImageNode(type, value){
      this.$emit('changeBaseImage', {type,value})
    },
    numFormatter(value){
      if(value === ''){
        return '10'
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
  /deep/ .ant-form-item{
    margin-bottom: 10px;
  }
</style>