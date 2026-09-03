<template>
  <div class="review-page">
    <van-form ref="form" @submit="onSubmit">
      <template v-if="status === '1'">
        <van-field required name="checkResult" label="检查结果" :rules="[{ required: true, message: '请选择检查结果' }]">
          <template #input>
            <van-radio-group v-model="info.checkResult" direction="horizontal">
              <van-radio name="1">合格</van-radio>
              <van-radio name="2">不合格</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field
          v-if="info.checkResult === '2'"
          required
          v-model="info.checkComment"
          name="checkComment"
          label="不合格原因"
          type="textarea"
          rows="4"
          placeholder="请输入"
          :rules="[{ required: true, message: '请输入不合格原因' }]"
        />
        <van-field name="checkImg" label="相关图片">
          <template #input>
            <AppUpload
              :maxCount="10 - (info.checkFile === '' && !info.checkFile ? 0 : info.checkFile?.split(',').length)"
              :watermark="false"
              bizPath="sm"
              v-model:fileList="info.checkImg"
            />
          </template>
        </van-field>
        <van-field name="checkFile" label="相关文件">
          <template #input>
            <AppCustomizeUpload
              v-model:fileList="info.checkFile"
              :max-count="10 - (info.checkImg === '' && !info.checkImg ? 0 : info.checkImg?.split(',').length)"
              accept="pdf,doc,docx,xls,xlsx"
            />
          </template>
        </van-field>
      </template>

      <template v-else-if="status === '2'">
        <van-field
          required
          v-model="info.repairMsr"
          name="repairMsr"
          label="整改措施"
          type="textarea"
          rows="4"
          placeholder="请输入"
          :rules="[{ required: true, message: '请输入整改措施' }]"
        />
        <van-field required name="repairPicture" label="整改后照片" :rules="[{ required: true, message: '请选择整改后照片' }]">
          <template #input>
            <AppUpload :maxCount="10" :watermark="false" bizPath="sm" v-model:fileList="info.repairPicture" />
          </template>
        </van-field>
      </template>

      <template v-else-if="status === '3'">
        <van-field required name="checkResult" label="验收结果" :rules="[{ required: true, message: '请选择检查结果' }]">
          <template #input>
            <van-radio-group v-model="info.checkResult" direction="horizontal">
              <van-radio name="1">合格</van-radio>
              <van-radio name="2">不合格</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field
          v-if="info.checkResult === '2'"
          required
          v-model="info.checkReason"
          name="checkReason"
          label="不合格原因"
          type="textarea"
          rows="4"
          placeholder="请输入"
          :rules="[{ required: true, message: '请输入不合格原因' }]"
        />
      </template>

      <div style="margin: 16px">
        <van-button round block type="primary" :loading="loading" native-type="submit">提交</van-button>
      </div>
    </van-form>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { showToast } from 'vant';
  import { edit, repair, check } from '../../autonomous/url/index';
  import AppUpload from '/@/components/App/AppUpload.vue';
  import AppCustomizeUpload from '../components/AppCustomizeUpload.vue';
  import uni from '@dcloudio/uni-webview-js';
  import { setAppTitle } from '/@/utils/index';
  const route = useRoute();
  const loading = ref(false);
  const status: any = ref('');
  const info: any = ref({});
  const form = ref();
  const initByStatus = (id: string, status: string | number) => {
    if (status === '1') {
      info.value = {
        id,
        checkResult: '1',
        checkComment: '',
        checkImg: '',
        checkFile: '',
      };
    } else if (status === '2') {
      info.value = {
        busId: id,
        repairMsr: '',
        repairPicture: '',
      };
    } else if (status === '3') {
      info.value = {
        busId: id,
        checkResult: '1',
        checkReason: '',
      };
    }
  };
  onMounted(() => {
    const id = route.query.id as string | undefined;
    const _status = route.query.status as string | number | undefined;
    if (!id || !_status) {
      showToast('缺少必要的路由参数');
      return;
    }
    status.value = _status;
    if (_status === '1') {
      setAppTitle('自主管理检查');
    } else if (_status === '2') {
      setAppTitle('自主管理整改');
    } else if (_status === '3') {
      setAppTitle('自主管理验收');
    }
    initByStatus(id, _status);
  });
  const onSubmit = async () => {
    await form.value.validate();
    const data = JSON.parse(JSON.stringify(info.value));
    loading.value = true;
    try {
      let res: any = null;
      if (status.value === '1') {
        res = await edit(data);
      } else if (status.value === '2') {
        res = await repair(data);
      } else if (status.value === '3') {
        res = await check(data);
      }
      if (res) {
        uni.switchTab({
          url: '/pages/index/index',
        });
      }
    } finally {
      loading.value = false;
    }
  };
</script>

<style lang="less">
  .review-page {
    padding: 12px 16px;
  }
</style>
