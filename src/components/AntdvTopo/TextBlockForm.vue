<template>
  <a-collapse default-active-key="1" :bordered="false">
    <a-collapse-panel key="1" header="基本属性" :style="customStyle">
      <a-form :labelCol='labelCol' :wrapperCol='wrapperCol'>
        <a-form-item label='文字内容'>
          <a-input
            placeholder="请输入"
            v-model:value="value.text"
            @blur="blurTextNode('text', value.text)"
            @change="changeNode('text', value.text)"
          />
        </a-form-item>
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
        <a-form-item label='字体'>
          <a-select
            show-search
            placeholder="字体"
            option-filter-prop="children"
            style="width: 168px"
            :filter-option="filterOption"
            v-model:value="value.fontFamily"
            @change="changeNode('fontFamily', value.fontFamily)"
          >
            <a-select-option 
              v-for="(item,index) in fontFamilyOpts" 
              :value="item"
              :key="index"
            >
              {{ item }}
            </a-select-option>
          </a-select>
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
            v-model:hex="value.color" 
            @change="changeNode('color', value.color)"
          />
        </a-form-item>
      </a-form>
    </a-collapse-panel>
    <a-collapse-panel v-if="showAnimation" key="2" header="动画属性" :style="customStyle">
      <a-form :labelCol='labelCol' :wrapperCol='wrapperCol'>
        <div class="f-text">字色</div>
        <a-form-item label='关联设备'>
          <a-select
            allowClear
            show-search
            placeholder='请选择'
            :disabled="!!apiUrl || value.deviceDisabled"
            option-filter-prop="children"
            :filter-option="filterOption"
            v-model:value="value.device"
            @change="changeDevice"
          >
            <a-select-option 
              v-for="(item,index) in deviceOpts" 
              :value="item.id"
              :key="index"
            >
              {{ item.deviceName || item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label='关联属性'>
          <a-select
            allowClear
            show-search
            placeholder='请选择'
            :disabled="!!apiUrl"
            option-filter-prop="children"
            :filter-option="filterOption"
            v-model:value="value.field"
            @change="changeNode('field', value.field)"
          >
            <a-select-option 
              v-for="(item,index) in fieldOpts" 
              :value="item.pointId"
              :key="index"
            >
              {{ item.pointName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <!-- <a-form-item label='API接口'>
          <a-input
            :maxLength="500"
            :disabled="!!value.device"
            v-model:value="value.apiUrl"
            @change="changeNode('apiUrl', value.apiUrl)"
          />
        </a-form-item> -->
        <a-form-item label='设定值'>
          <a-input-number
            :min="-10000" :max="10000" :step="1"
            :precision="2"
            :formatter="value => `${value}`===''?0:`${value}`"
            v-model:value="value.limit"
            placeholder='请输入'
            @change="changeNode('limit', value.limit)"
          />
        </a-form-item>
        <a-form-item label='上偏差'>
          <a-input-number
            :min="0" :max="10000" :step="1"
            :precision="2"
            :formatter="value => `${value}`===''?5:`${value}`"
            v-model:value="value.maxLimit"
            placeholder='请输入'
            @change="changeNode('maxLimit', value.maxLimit)"
          />
        </a-form-item>
        <a-form-item label='下偏差'>
          <a-input-number
            :min="0" :max="10000" :step="1"
            :precision="2"
            :formatter="value => `${value}`===''?5:`${value}`"
            v-model:value="value.minLimit"
            placeholder='请输入'
            @change="changeNode('minLimit', value.minLimit)"
          />
        </a-form-item>
        <a-form-item label='区间内颜色'>
          <color-picker 
            v-model:hex="value.lessLimit" 
            @change="changeNode('lessLimit', value.lessLimit)" 
          />
        </a-form-item>
        <a-form-item label='区间外颜色'>
          <color-picker 
            v-model:hex="value.moreLimit" 
            @change="changeNode('moreLimit', value.moreLimit)" 
          />
       </a-form-item>
        <a-form-item label='组件Id'>
          <a-input
            :maxLength="100"
            :disabled="true"
            v-model:value="value.compId"
          />
        </a-form-item>
      </a-form>
    </a-collapse-panel>
  </a-collapse>
  
</template>

<script>
import { defHttp } from '/@/utils/http/axios';
import ColorPicker from 'colorpicker-v3'  // 注册组件
import 'colorpicker-v3/style.css' // 引入样式文件

export default {
  name: 'TextBlockForm',
  props: {
    value: {
      type: Object,
      default: {}
    },
    apiUrl: {
      type: String,
      default: ''
    },
    showAnimation: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    ColorPicker
  },
  data() {
    return {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      deviceOpts: [],
      fieldOpts: [],
      fontFamilyOpts: ['宋体','Microsoft YaHei','Arial','helvetica'],
      customStyle: 'background: #f7f7f7;'
    }
  },
  created() {
    this.getDevice()
    if(this.value.device){
      this.getField(this.value.device)
    }
  },
  methods: {
    getDevice(){
      // 森罗url: /slDeviceConfiguration/getDeviceAll
      // 底座url: /deviceConfiguration/getDeviceAll
      defHttp.get({url: '/deviceConfiguration/getDeviceAll'}).then(res => {
        this.deviceOpts = res || [];
      })
    },
    getField(deviceId){
      // 森罗url: /slDeviceConfiguration/getDeviceVariable
      // 底座url: /deviceConfiguration/getDevicePoint
      // getAction('/deviceConfiguration/getDevicePoint', {deviceId}).then(res => {
      //   if (res.success) {
      //     this.fieldOpts = res.result || []
      //   }
      // })
      defHttp.get({ url: '/deviceConfiguration/getDevicePoint', params: { deviceId } }).then((res) => {
        this.fieldOpts = res || [];
        this.fieldOpts.forEach((item) => {
          // 获取字符串中的最后一个-或者_
          let index =
            item.pointName.lastIndexOf('-') > item.pointName.lastIndexOf('_') ? item.pointName.lastIndexOf('-') : item.pointName.lastIndexOf('_');
          // 截取字符串
          item.pointName = item.pointName.substring(index + 1);
        });
      });
    },
    changeDevice(val){
      if(val){
        this.getField(val)
      } else {
        this.fieldOpts=[]
      }
      this.changeNode('device', val)
    },
    // 修改path节点
    changeNode(type, value){
      this.$emit('changeTextBlock', {type,value})
    },
    blurTextNode(type, value){
      this.$emit('blurTextBlock', {type,value})
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
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
    },
    textFormatter(value){
      if(value === ''){
        return 'Text'
      } else {
        return value
      }
    },
  }
}
</script>

<style scoped lang="less">
  .f-text{
    line-height: 30px;
    background: #eee;
    margin-bottom: 10px;
    padding-left: 10px;
    color: #000;
    font-size: 14px;
    font-weight: bold;
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