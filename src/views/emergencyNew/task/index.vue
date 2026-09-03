<template>
  <div style="height: 100%">
    <div class="head">
      <BasicForm style="background-color: #ffffff" @register="registerForm" @submit="onSubmit" @reset="resetForm">
        <template #orgCode="{ model, field }">
          <a-tree-select
            v-model:value="model[field]"
            :tree-data="departList"
            :field-names="{ label: 'title', value: 'key' }"
            :treeDefaultExpandedKeys="treeExpandedKeys"

            :show-search="true"
            allowClear
            placeholder="请选择"
          />
        </template>
      </BasicForm>
    </div>
    <div class="panel-content" v-loading="loading">
      <a-row :span="24" :gutter="[10, 10]">
        <a-col :span="6" v-for="item in dataList" :key="item.id">
          <div class="card">
            <h1>{{ item.planName }}</h1>
            <span class="delaytag" v-if="item.approvalStatus == 2">审批退回</span>
            <span class="delaytag" v-if="item.status == 1">超期</span>
            <p><span>演练单位:</span> {{ item.orgName }}</p>
            <p><span>演练地点:</span> {{ item.drillPlace }}</p>
            <p class="drill-plan"
              ><span>演练应急预案:</span>
              <span style="color: #1890ff;padding-left: 10px;cursor: pointer;" @click="previewFn(item.drillEmergencyPlan)">{{ item.drillEmergencyPlan }}</span></p
            >
            <p><span>实施时间:</span> {{ item.drillTime }}</p>
            <div class="foot">
              <a-space :size="10" wrap>
                <a-button v-if="!item.startDrill && item.startDrill !== '0'" type="primary" @click="approveClick(item, '演练方案')"
                  >演练方案</a-button
                >
                <a-button v-if="!item.startDrill && item.startDrill !== '0'" type="primary" @click="approveClick(item, '开始演练')"
                  >开始演练</a-button
                >
                <a-button v-if="item.startDrill === '0'" type="primary" @click="approveClick(item, '影像资料')">影像资料</a-button>
                <a-button v-if="item.startDrill === '0' && item.trainContentFlag" type="primary" @click="approveClick(item, '动员培训')"
                  >动员培训</a-button
                >
                <a-button
                  v-if="item.startDrill === '0' && !item.approvalStatus && !item.trainContentFlag"
                  type="primary"
                  @click="approveClick(item, '签到二维码')"
                  >签到二维码</a-button
                >
                <a-button
                  v-if="(item.startDrill === '0' && !item.approvalStatus && !item.trainContentFlag) || item.approvalStatus == 2"
                  type="primary"
                  @click="approveClick(item, '演练记录')"
                  >演练记录</a-button
                >
                <a-button v-if="item.approvalStatus === '1'" type="primary" @click="approveClick(item, '演练总结')">演练总结</a-button>
                <a-button type="primary" @click="viewDetail(item)">查看详情</a-button>
              </a-space>
            </div>
          </div>
        </a-col>
      </a-row>
    </div>
    <div style="margin: 10px; text-align: right">
      <pagination
        v-model:current="pageNo"
        v-model:page-size="pageSize"
        :total="total"
        show-quick-jumper
        showSizeChanger
        :pageSizeOptions="['12', '24', '36', '48', '60']"
        @change="pageSizeChange"
        :defaultPageSize="pageSize"
        :show-total="(total: number) => `共${total}条记录  第${pageNo}/${Math.ceil(total / pageSize)}页`"
      />
    </div>
    <a-modal v-model:visible="signShow" title="扫码签到" @ok="handleOk" style="text-align: center">
      <div class="sign-body">
        <img class="sign-img" :src="'data:image/png;base64,' + signSrc" alt="" />
      </div>
      <template #footer>
        <a-button key="back" @click="handleOk">取消</a-button>
      </template>
    </a-modal>
  </div>

  <PlanDrawer @register="registerDrawer" @success="handleSuccess" />
  <DetailDrawer @register="registerDetailDrawer" />
</template>
<script setup name="emergency-task" lang="ts">
  import { previewFile, getEduOrgList } from '/@/api/common/api';
  import { signInQrCode, getDrillPersonNum } from '../api';
  import { Pagination } from 'ant-design-vue';
  import { taskList, startDrill } from '../api';
  import { BasicForm } from '/@/components/Form';
  import { useContent } from './hooks/useContent';
  import DetailDrawer from './detailDrawer.vue';
  import { Modal } from 'ant-design-vue';
  import PlanDrawer from './drawer.vue';
  import dayjs from 'dayjs';
  import { ref, onMounted, nextTick } from 'vue';
  const { status } = defineProps({
    status: {
      type: String,
      default: '1',
    },
  });

  const queryParams = ref({
    pageNo: 1,
    pageSize: 12,
    total: 0,
    totalPage: 0,
    loading: false,
  });
  const { registerForm, getFieldsValue, registerDrawer, setFieldsValue, openDrawer, openDetailDrawer, registerDetailDrawer } = useContent();

  onMounted(() => {
    pageInit();
  });
  // 总条数
  const total = ref(0);
  // 页数
  const pageNo = ref<number>(1);
  // 页数和条数
  const pageSize = ref<number>(12);
  const dataList = ref<any[]>([]);
  const signShow = ref(false);
  const signSrc = ref('');
  const loading = ref(false);
  const resetForm = async () => {
    pageNo.value = 1;
    await setFieldsValue({ orgCode: departList.value[0].key });
    pageInit();
  };
  // 页数和条数变化
  const pageSizeChange = (page: any, pageS: any) => {
    pageNo.value = page;
    pageSize.value = pageS;
    getTaskList();
  };

  const departList = ref<any[]>([]);
  const treeExpandedKeys = ref<string[]>([]);
  async function pageInit() {
    let orgres = await getEduOrgList({ level: 4, permission: 1 });
    SelectItem(orgres, orgres[0].title);
    departList.value = orgres;
    console.log(orgres, orgres[0].key, 9999);
    await setFieldsValue({ orgCode: orgres[0].key });
    getTaskList();
  }
  function SelectItem(arr, title) {
    arr.forEach((item) => {
      if (item.key.length < 9) {
        item.selectable = false;
        treeExpandedKeys.value.push(item.key);
      }
      if (item.key.length == 12) {
        item.title = title + '-' + item.title;
      }
      if (item.children) {
        SelectItem(item.children, item.title);
      }
    });
  }

  async function getTaskList() {
    loading.value = true;
    if(!queryParams.value.orgCode) {
      await setFieldsValue({ orgCode: departList.value[0].key });
    }
    Object.assign(queryParams.value, getFieldsValue());
    let res = await taskList({ ...queryParams.value, status: status, pageNo: pageNo.value, pageSize: pageSize.value }).finally(() => {
      loading.value = false;
    });
    total.value = res.total;
    dataList.value = res.records;
  }

  const onSubmit = (value) => {
    pageNo.value = 1;
    Object.assign(queryParams.value, value);
    getTaskList();
  };

  const handleSuccess = () => {
    getTaskList();
  };

  const approveClick = (item, type) => {
    if (type === '签到二维码') {
      signInQrCode(item.id).then((res) => {
        console.log(res);
        signSrc.value = res;
        nextTick(() => {
          signShow.value = true;
        });
      });
      return;
    }
    if (type === '开始演练') {
      Modal.confirm({
        title: '是否确认开始演练?',
        onOk() {
          startDrill(item.id).then((res) => {
            pageInit();
          });
        },
      });
      return;
    }
    if (type === '演练记录') {
      getDrillPersonNum({
        id: item.id,
      }).then((res) => {
        Modal.confirm({
          title: `当前有 ${res} 人参加动员培训签到，请确认已全部签到后，再上传演练记录!`,
          onOk() {
            openDrawer(true, { ...item, title: type });
          },
        });
      });
      return;
    }
    openDrawer(true, { ...item, title: type });
  };

  const handleOk = () => {
    signShow.value = false;
  };

  const viewDetail = (item) => {
    openDetailDrawer(true, { ...item, title: '详情' });
  };

  const previewFn = (src) => {
    previewFile(src).then((res) => {
      window.open(res, '_blank');
    });
  };
</script>

<style lang="less" scoped>
  .head {
    padding-top: 16px;
    padding-right: 16px;
    margin-bottom: 16px;
    background-color: #ffffff;
  }

  .panel-content {
    background-color: #ffffff;
    padding: 16px;
  }

  .card {
    padding: 16px;
    border-radius: 7px;
    position: relative;
    box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.3);
    .delaytag{
      font-size: 12px;
      padding: 2px 5px;
      border-radius: 3px;
      position: absolute;
      top: 16px;
      right: 6px;
      color: #ffffff;
      background-color: #ee0a24;
    }
    h1 {
      font-size: 16px;
      word-break: break-all;
      // 两行省略号
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      line-height: 1.5;
    }

    span {
      color: #666;
    }

    .foot {
      display: flex;
      justify-content: flex-end;
    }
  }

  .sign-body {
    width: 100%;
    text-align: center;
    display: flex;
    justify-content: center;
  }

  .sign-img {
    width: 380px;
    height: 380px;
  }
  .drill-plan {
    word-break: break-all;
    // 单行省略号
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    line-height: 1.5;
  }
</style>
