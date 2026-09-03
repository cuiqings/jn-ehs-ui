<template>
  <div class="bf-wrap">
    <a-form ref="formRef" :model="value" :labelCol='labelCol' :wrapperCol='wrapperCol'>
      <a-form-item label='背景图片'>
        <JImageUpload 
          text="上传"
          v-model:value="value.bgImg"
          accept="image/png, image/jpeg, image/jpg"
          @change="changeNode('bgImg', value.bgImg)"
        />
      </a-form-item>
      <a-form-item label='页面宽度'>
        <a-input-number
          v-model:value="value.width" 
          :min="10" :max="10000" :step="1"
          :precision="0"
          :formatter="numFormatter"
          @change="changeNode('width', value.width)"
        /> px
      </a-form-item>
      <a-form-item label='页面高度'>
        <a-input-number
          v-model:value="value.height" 
          :min="10" :max="10000" :step="1"
          :precision="0"
          :formatter="numFormatter"
          @change="changeNode('height', value.height)"
        /> px
      </a-form-item>
      <!-- <a-form-item label='轮询频次'>
        <a-input-number
          v-model:value="value.loopStep" 
          :min="3" :max="10000" :step="1"
          :precision="0"
          @change="changeNode('loopStep', value.loopStep)"
        /> 秒
      </a-form-item> -->
      <!-- <a-form-item label='API接口'>
        <a-input
          placeholder='请输入'
          :maxLength="500"
          v-model="value.apiUrl"
          @change="changeNode('apiUrl', value.apiUrl)"
        />
      </a-form-item>
      <div class="remind">
        若填写API接口，本页面所有动态组件的设备属性将失效，请谨慎填写。
      </div> -->
    </a-form>
    <div class="pf-btn">
      <a-button 
        type="danger"
        style="width:100%"
        @click="changeNode('background', value.background)"
      >清除背景</a-button>
    </div>
  </div>
</template>

<script>
import JImageUpload from './JImageUpload.vue';
export default {
  name: 'PageForm',
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
    // console.log(this.value, 'vvvvv')
  },
  methods: {
    // 修改节点
    changeNode(type, value){
      this.$emit('changePage', {type,value})
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
    .remind{
      color: red;
      font-size: 12px;
      padding: 0 0 10px 10px;
    }
    .ant-btn-danger {
      background-color: #ff4d4f;
    }
  }
  /deep/ .ant-form-item{
    margin-bottom: 10px;
  }
</style>