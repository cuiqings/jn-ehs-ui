<template>
  <div class="app-periodic-wrap">
    <div class="title-box">
      <h1>{{props.item.clearPosition}}</h1>
      <p>
        {{dataObj.type==='0' ? '方法：' : '方式：'}}
        {{ dataObj.type==='0' ? filterMultiDictText(dictOptionsQlmethod, props.item.clearMethod) : filterMultiDictText(dictOptionsWbmethod, props.item.clearMethod) }}
      </p>
    </div>
    <div class="form-box">
      <van-cell-group>
        <van-field
          v-if="dataObj.type==='1' && dataObj.hcghsl !== '2'"
          v-model="formObj.hcghslName"
          label="耗材更换数量"
          placeholder="请输入"
          :required="dataObj.hcghsl === '0'"
          :disabled="props.item.biaoShi==='1'"
          maxlength="30"
          :label-width="100"
          input-align="right"
        />
        <van-field
          v-if="dataObj.csfpzl !== '2'"
          v-model="formObj.csfpzlName"
          label="产生废品重量"
          placeholder="请输入"
          :required="dataObj.csfpzl === '0'"
          :disabled="props.item.biaoShi==='1'"
          maxlength="30"
          :label-width="100"
          input-align="right"
        />
        <van-field
          v-if="dataObj.csfpqx !== '2'"
          readonly
          clickable
          label="产生废品去向"
          v-model="formObj.csfpqxName"
          placeholder="请选择"
          :required="dataObj.csfpqx === '0'"
          :disabled="props.item.biaoShi==='1'"
          :label-width="100"
          input-align="right"
          is-link
          @click="props.item.biaoShi !== '1' ? showPicker = true : showPicker = false"
        />

        <div 
          class="upload-box" 
          v-if="dataObj.type==='0' && dataObj.qlqzp !== '2'"
        >
          <div class="fb-cell">
            <i class="star" v-if="dataObj.qlqzp === '0'">*</i>清理前照片
          </div>
          <AppUpload 
            v-model:fileList="formObj.qlqzpName" 
            :disabled="props.item.biaoShi==='1'"
            :multiple="true"
          />
        </div>

        <div 
          class="upload-box" 
          v-if="dataObj.type==='0' && dataObj.qlhzp !== '2'"
        >
          <div class="fb-cell">
            <i class="star" v-if="dataObj.qlhzp === '0'">*</i>清理后照片
          </div>
          <AppUpload 
            v-model:fileList="formObj.qlhzpName" 
            :disabled="props.item.biaoShi==='1'"
            :multiple="true"
          />
        </div>

        <div 
          class="upload-box" 
          v-if="dataObj.type==='1' && dataObj.wbzp !== '2'"
        >
          <div class="fb-cell">
            <i class="star" v-if="dataObj.wbzp === '0'">*</i>维保照片
          </div>
          <AppUpload 
            v-model:fileList="formObj.wbzpName"
            :disabled="props.item.biaoShi==='1'"
            :multiple="true"
          />
        </div>

        <van-field
          v-if="dataObj.type==='0' && dataObj.qlsm !== '2'"
          v-model="formObj.qlsmName"
          rows="2"
          autosize
          label="清理说明"
          type="textarea"
          :required="dataObj.qlsm === '0'"
          :disabled="props.item.biaoShi==='1'"
          maxlength="50"
          placeholder="请输入"
          show-word-limit
        />
      </van-cell-group>

      <van-popup v-model:show="showPicker" position="bottom">
        <van-picker
          show-toolbar
          :columns="columns"
          @cancel="showPicker = false"
          @confirm="onConfirm"
        />
      </van-popup>
    </div>
    <div class="btn-box">
      <van-button 
        plain 
        type="primary" 
        block 
        :disabled="props.item.biaoShi==='1'"
        @click="handleSave"
      >保存</van-button>
      <van-button 
        v-if="isLast" 
        type="primary" 
        block 
        :disabled="isSubmit"
        @click="handleSubmit"
      >提交</van-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue';
import { showToast } from 'vant';
import { executeSubmit } from '../app.api';
import { initDictOptions } from '/@/utils/dict';
import { filterMultiDictText } from '/@/utils/dict/JDictSelectUtil.js';
import AppUpload from "/@/components/App/AppUpload.vue"
import { useRouter } from 'vue-router';
const router = useRouter();
const props = defineProps({
  index: { type: Number, default: null },
  item: { type: Object, default: {} },
  data: { type: Object, default: {} },
  isLast: { type: Boolean, default: false }
});
const emit = defineEmits(['save', 'submit']);

const dictOptionsQlmethod = ref<any>([]);
const dictOptionsWbmethod = ref<any>([]);
const dataObj:any = ref({})
const formObj:any = ref({})
const showPicker = ref(false)
const submitPass = ref(true)
// const disabled = ref(false)
const columns = ref<any[]>([{
  text:'污水站',
  value: '1'
}, {
  text:'危废库',
  value: '2'
}])

/**
 * 初始化字典选项
 */
 async function initDictConfig() {
  dictOptionsQlmethod.value = await initDictOptions('ql_method');
  dictOptionsWbmethod.value = await initDictOptions('wb_method');
}
// loadData();
onMounted(() => {
  //初始化字典选项
  initDictConfig();
  // dataObj.value = props.data

});
const isSubmit = computed(() => {
  return props.data.jnClearPositionVoList.filter(v => v.biaoShi === '0').length > 0 ? true : false
});

watch(
  () => props.data,
  (val:any) => {
    dataObj.value = val
  },{deep: true, immediate: true}
);

watch(
  () => props.item,
  (val:any) => {
    if(val.biaoShi === '1'){
      formObj.value = {
        hcghslName: val.hcghslName,
        csfpzlName: val.csfpzlName,
        csfpqxName: val.csfpqxName,
        qlhzpName: val.qlhzpName,
        qlqzpName: val.qlqzpName,
        qlsmName: val.qlsmName,
        wbzpName: val.wbzpName
      }
    }
  },{deep: true, immediate: true}
);

function onConfirm(value:any) {
  // console.log(value.selectedOptions,'---eee')
  formObj.value.csfpqxName = value.selectedOptions[0].text;
  showPicker.value = false;
}

// 校验
function validate(){
  let pass = true
  const {type,hcghsl,csfpzl,csfpqx,qlqzp,qlhzp,qlsm,wbzp} = dataObj.value
  if(type === '0'){
    // 清理
    if(csfpzl==='0'){
      if(!formObj.value.csfpzlName){
        showToast('请输入产生废品重量')
        pass = false
        return
      }
    }
    if(csfpqx==='0'){
      if(!formObj.value.csfpqxName){
        showToast('请选择产生废品去向')
        pass = false
        return
      }
    }
    if(qlqzp==='0'){
      if(!formObj.value.qlqzpName){
        showToast('请上传清理前照片')
        pass = false
        return
      }
    }
    if(qlhzp==='0'){
      if(!formObj.value.qlhzpName){
        showToast('请上传清理后照片')
        pass = false
        return
      }
    }
    if(qlsm==='0'){
      if(!formObj.value.qlsmName){
        showToast('请输入清理说明')
        pass = false
        return
      }
    }
  } else {
    // 维保
    if(hcghsl==='0'){
      if(!formObj.value.hcghslName){
        showToast('请输入耗材更换数量')
        pass = false
        return
      }
    }
    if(csfpzl==='0'){
      if(!formObj.value.csfpzlName){
        showToast('请输入产生废品重量')
        pass = false
        return
      }
    }
    if(csfpqx==='0'){
      if(!formObj.value.csfpqxName){
        showToast('请选择产生废品去向')
        pass = false
        return
      }
    }
    if(wbzp==='0'){
      if(!formObj.value.wbzpName){
        showToast('请上传维保照片')
        pass = false
        return
      }
    }
  }
  return pass
}
// 保存
function handleSave(){
  console.log(formObj.value,'formObj------00')
  if(validate()){
    emit('save', formObj.value);
  }
}
// 提交
function handleSubmit(){
  // console.log(formObj.value,'formObj------00')
  if(!submitPass.value) {
    return
  }
  submitPass.value = false
  executeSubmit({id: dataObj.value.jlId}).then(() => {
    router.push({ path: '/app/periodicMaintain'})
  }).finally(() => {
    submitPass.value = true
  })
}

</script>

<style lang="less" scoped>
.app-periodic-wrap {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #eff1f5;
  padding-top: 12px;
  padding-bottom: 20px;
  .title-box{
    background-color: #fff;
    padding: 16px;
    h1{
      font-size: 17px;
      margin-bottom: 4px;
    }
    p{
      font-size: 14px;
      color: rgba(0,0,0,0.38);
      margin-bottom: 0px;
    }
  }
  .form-box{
    background-color: #fff;
    margin-top: 8px;
    padding-bottom: 10px;
  }
  .btn-box{
    padding: 13px;
    display: flex;
    button{
      margin: 0 5px;
    }
  }
  .upload-box{
    margin: 0px 16px;
    border-bottom: #eff0f3 1px solid;
    padding-bottom: 10px;
    .fb-cell{
      padding: 10px 0px;
      font-size: 14px;
      .star{
        font-style: normal;
        color: #ee0a24;
        margin-right: 2px;
      }
    }
  }
}

</style>