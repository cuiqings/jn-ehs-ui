<!-- 随手拍非隐患处理 -->
<template>
  <van-form ref="formRef" label-width="75px">
    <van-field required name="radio" label="整改情况" :rules="[{ validator: validRadio, message: '请选择整改情况' }]">
      <template #input>
        <van-radio-group v-model="formData.ifRepair" direction="horizontal">
          <van-radio name="1">整改完成</van-radio>
          <van-radio name="2">继续整改</van-radio>
        </van-radio-group>
      </template>
    </van-field>
    <div v-if="formData.ifRepair == '1'">
      <van-field v-model="formData.handleExplain" name="handleExplain" maxlength="200" autosize type="textarea" label="处理说明" placeholder="请填写处理说明" />
      <van-field name="handleExplain" label=" ">
        <template #input>
          <AppUpload :watermarkText="watermarkText" :maxCount="10" v-model:fileList="formData.handlePicture" />
        </template>
      </van-field>
    </div>
    <div v-if="formData.ifRepair == '2'">
      <van-field
        required
        v-model="formData.repairDate"
        is-link
        readonly
        name="repairDate"
        label="限定整改日期"
        placeholder="点击选择日期"
        @click="showCalendar = true"
        :rules="[{ required: true, message: '请选择' }]"
      />
      <van-calendar v-model:show="showCalendar" @confirm="onConfirm($event, 'repairDate')" />

      <van-field
        required
        v-model="formData.dutyDeptName"
        is-link
        readonly
        name="picker"
        label="责任部门"
        placeholder="点击选择部门"
        @click="showPicker1 = true"
        :rules="[{ required: true, message: '请选择责任部门' }]"
      />
      <van-popup v-model:show="showPicker1" position="bottom">
        <van-picker :columns-field-names="customFieldName" :columns="deptTree" @confirm="onConfirm($event, 'dutyDeptName')" @cancel="showPicker1 = false" />
      </van-popup>

      <van-field
        required
        v-model="formData.dutyPeopleName"
        is-link
        readonly
        name="picker"
        label="责任人"
        placeholder="点击选择责任人"
        @click="showPicker2 = true"
        :rules="[{ required: true, message: '请选择责任人' }]"
      />
      <van-popup v-model:show="showPicker2" position="bottom">
        <van-picker :columns-field-names="customFieldNameUser" :columns="userList" @confirm="onConfirm($event, 'dutyPeopleName')" @cancel="showPicker2 = false" />
      </van-popup>
    </div>
  </van-form>
</template>

<script setup lang="ts">
  import { reactive, ref, watch } from 'vue';
  import { getDepartTreeBy23, getUserInfo } from '../../index.api';
  import AppUpload from '../../../../../components/App/AppUpload.vue';
  import { showFailToast, FormInstance } from 'vant';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { useUserStore } from "/@/store/modules/user";
  import dayjs from 'dayjs';

  const props = withDefaults(
    defineProps<{
      formData: any;
    }>(),
    {
      formData: () => {}
    }
  );
  const userStore:any = useUserStore();
  const watermarkText = ref(`${userStore.getUserInfo.realname} ${userStore.getUserInfo.workNo} ${dateFormat(new Date(),'yyyy-MM-dd  hh:mm:ss')} 上传`)
  const showCalendar = ref(false);
  const deptTree = ref([]);
  const userList = ref([]);
  const formRef = ref<FormInstance>();
  const formData = reactive({
    ifRepair: '',
    repairDate: '',
    handleExplain: '',
    repairPicture: '',
    dutyDeptName: '',
    dutyDept: '',
    dutyPeopleName: '',
    dutyPeople: '',
    handlePicture: ''
  });

  if(props.formData){
    console.log(props.formData);
    
    formData.dutyDeptName = props.formData.departName;
    formData.dutyDept = props.formData.depart || props.formData.org;
    getUserInfoList();
  }

  const customFieldName = {
    text: 'title',
    value: 'orgCode',
    children: 'children',
  };

  const customFieldNameUser = {
    text: 'realname',
    value: 'id'
  };

  const getDepartTree = () => {
    getDepartTreeBy23().then((res) => {
      filterNull(res);
      deptTree.value = res;
    });
  };
  getDepartTree();

  function filterNull(data) {
    if(data.length == 0) return []
    data.map(val => {
      if(val.children && val.children.length == 0){
        delete val.children
      } else if(val.children) {
        filterNull(val.children)
      }
    })
  }

  function getUserInfoList (){
    getUserInfo(formData.dutyDept).then((res) => {
      console.log(res);
      userList.value = res;
    });
  };
  
  const showPicker1 = ref(false);
  const showPicker2 = ref(false);

  const onConfirm = (value, key) => {
    if(key == 'dutyDeptName'){
      let len = value.selectedOptions.length - 1;
      formData.dutyDept = value.selectedOptions[len].orgCode;
      formData.dutyDeptName = value.selectedOptions[len].title;
      showPicker1.value = false;
      getUserInfoList();
    } else if(key == 'repairDate') {
      formData.repairDate = dayjs(value).format('YYYY-MM-DD');
      showCalendar.value = false;
    } else {
      formData.dutyPeople = value.selectedOptions[0].id;
      formData.dutyPeopleName = value.selectedOptions[0].realname;
      showPicker2.value = false;
    }
  };

  const validRadio = () => !!formData.ifRepair

  // form值校验
  const submitForm = () => {
    return new Promise((resolve, reject) => {
      formRef.value?.validate()
        .then(() => {
          if(formData.ifRepair == '1' && !formData.handleExplain && !formData.handlePicture){
            showFailToast('处理说明或处理图片至少一个不为空！');
            reject(false);
          } else {
            resolve(formData);
          }
        })
        .catch(() => {
          reject(false);
        });
    });
  };
 
  defineExpose({submitForm})
</script>

<style lang="less" scoped></style>
