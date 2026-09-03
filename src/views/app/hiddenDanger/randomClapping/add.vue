<!-- 随手拍新增 -->
<template>
  <div class="hd-add">
    <van-form @submit="onSubmit" label-width="76px">
      <van-field required name="yhPicture" label="隐患照片" :rules="[{ validator: picValid, message: '请上传隐患照片' }]">
        <template #input>
          <AppUpload :watermarkText="watermarkText" v-model:fileList="formData.yhPicture" />
        </template>
      </van-field>
      <van-field
        required
        v-model="formData.yhDescription"
        name="yhDescription"
        autosize
        type="textarea"
        label=" 隐患描述"
        :maxlength="200"
        placeholder="请输入"
        :rules="[{ required: true, message: '请填写隐患描述' }]"
      />
      <van-field name="repairPicture" label="整改后照片">
        <template #input>
          <AppUpload :watermarkText="watermarkText" v-model:fileList="formData.repairPicture" />
        </template>
      </van-field>
      <van-field
        v-model="formData.repairExplain"
        :maxlength="200"
        name="repairExplain"
        autosize
        type="textarea"
        label="整改说明"
        placeholder=" 请输入"
      />
      <van-field
        required
        v-model="formData.departName"
        is-link
        readonly
        name="depart"
        label="隐患地点"
        placeholder="请选择隐患地点"
        @click="showArea = true"
        :rules="[{ required: true, message: '请选择隐患地点' }]"
      />

      <van-field
        v-if="showDate == true"
        v-model="formData.repairDate"
        is-link
        readonly
        label-width="100"
        name="repairDate"
        label="限定整改日期"
        placeholder="点击选择日期"
        @click="showCalendar = true"
      >
        <template #input>
          <div style="width: 100%;display: flex; justify-content: space-between; align-items: center;">
            <span v-if="formData.repairDate">{{formData.repairDate}}</span>
            <span v-else style="color: #c8c9cc;">请选择</span>
            <van-icon style="padding-right: 10px; opacity: 0.4;" v-if="formData.repairDate" @click.stop="formData.repairDate = ''" name="cross" />
          </div>
        </template>
      </van-field>
      <van-calendar :min-date="minDate" v-model:show="showCalendar" @confirm="endDtConfirm($event)" />

      <van-popup v-model:show="showArea" position="bottom">
        <van-picker :columns-field-names="customFieldName" :columns="deptTree" @confirm="onConfirm" @cancel="showArea = false" />
      </van-popup>
      <van-field readonly v-model="formData.reporterName" name="reporterName" label="提报人" placeholder="提报人" />
      <van-field
        v-model="formData.reporterPhone"
        type="number"
        name="reporterPhone"
        label="提报人电话"
        placeholder="请输入"
        :rules="[{ validator: asyncValidator, message: '手机号格式不正确' }]"
      />
      <div style="margin: 16px">
        <van-button round block type="primary" :loading="submiting" native-type="submit"> 提交 </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
  import AppUpload from '../../../../components/App/AppUpload.vue';
  import { jnYhSspSubmit, getDepartTreeBy23, ifSecurityByOrg } from '../index.api';
  import { showSuccessToast, showFailToast } from 'vant';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user';
  import { useRouter } from 'vue-router';
  import { ref, reactive } from 'vue';
  import { truncateSync } from 'fs';

  const router = useRouter();
  const showArea = ref(false);
  let deptTree = reactive([]);
  const submiting = ref(false);
  const userStore: any = useUserStore();

  const watermarkText = ref(
    `${userStore.getUserInfo.realname} ${userStore.getUserInfo.workNo} ${dateFormat(new Date(), 'yyyy-MM-dd  hh:mm:ss')} 上传`
  );
  const showCalendar = ref(false);

  const formData = reactive<{
    yhPicture: string;
    repairPicture: string;
    yhDescription: string;
    repairExplain: string;
    reporterName: string;
    reporter: string;
    reporterPhone: string;
    depart?: string;
    departName?: string;
    org: string;
    orgName: string;
    repairDate: string;
  }>({
    yhPicture: '',
    repairPicture: '',
    yhDescription: '',
    repairExplain: '',
    reporterName: userStore.userInfo.realname,
    reporter: userStore.userInfo.realname,
    reporterPhone: userStore.userInfo.phone,
    departName: '',
    orgName: '',
    depart: '',
    org: '',
    repairDate: dateFormat(new Date(), 'yyyy-MM-dd'),
  });
  const minDate = ref(new Date(dateFormat(new Date(), 'yyyy-MM-dd')));
  // 图片校验
  const picValid = () => !!formData.yhPicture;
  const customFieldName = {
    text: 'title',
    value: 'orgCode',
    children: 'children',
  };
  const getDepartTree = () => {
    getDepartTreeBy23().then((res) => {
      res.forEach((item) => {
        if (item.children && item.children.length > 0) {
          item.children.unshift({ title: '全部', value: 'all' });
        }
      });
      deptTree = res;
    });
  };
  getDepartTree();

  const onConfirm = (value) => {
    showArea.value = false;
    let len = value.selectedOptions.length - 1;
    if (value.selectedOptions[len].value == 'all') {
      formData.org = value.selectedOptions[0].orgCode;
      formData.orgName = value.selectedOptions[0].title;
      formData.departName = formData.orgName;
      formData.depart = '';
    } else {
      formData.depart = value.selectedOptions[len].orgCode;
      formData.departName = value.selectedOptions[len].title;
      formData.org = '';
      formData.orgName = '';
    }
  };
  const endDtConfirm = (value) => {
    formData.repairDate = dateFormat(value, 'yyyy-MM-dd');
    showCalendar.value = false;
  };

  const asyncValidator = (val) => {
    if (val) {
      return /^1[3-9][0-9]{9}$/.test(val);
    }
    return true;
  };

  const showDate = ref(false);
  // 判断当前用户所属二级是否是安全主管部门
  const ifSecurity = () => {
    ifSecurityByOrg().then((res) => {
      showDate.value = res;
    });
  };
  ifSecurity();
  const onSubmit = (values) => {
    submiting.value = true;
    let params = { ...formData };
    if (!formData.depart) delete params.departName;
    if (!showDate.value) delete params.repairDate;
    jnYhSspSubmit(params)
      .then((res) => {
        submiting.value = false;
        // showSuccessToast(res);
        setTimeout(() => {
          router.back();
        }, 300);
      })
      .catch((err) => {
        console.log(err);
        showFailToast('新增失败，请联系管理员');
        submiting.value = false;
      });
  };
</script>
