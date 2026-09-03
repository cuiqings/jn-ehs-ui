<template>
  <div class="accidentInquiry accidentInquiry-form">
    <a-form
      ref="formRef"
      :model="queryParams"
      :label-col="{
        xs: { span: 12 },
        sm: { span: 5 },
      }"
      :wrapper-col="{
        xs: { span: 24 },
        sm: { span: 19 },
      }"
    >
      <a-row :gutter="24">
        <a-col :md="6" :sm="12">
          <a-form-item label="查询日期">
            <a-date-picker
              picker="year"
              v-model:value="queryParams.paramYear"
              :format="yearFormat"
              :defaultPickerValue="dayjs()"
              :disabled-date="disabledDate"
              placeholder="请选择"
            />
          </a-form-item>
        </a-col>
        <a-col :md="6" :sm="12">
          <a-button type="primary" preIcon="ant-design:search-outlined" @click="searchQuery">查询</a-button>
<!--          <a-button preIcon="ant-design:reload-outlined" @click="searchReset" style="margin-left: 8px">重置</a-button>-->
        </a-col>
      </a-row>
    </a-form>
  </div>
  <div class="accidentInquiry accidentInquiry-content">
      <div v-if="listData.length > 0" style="overflow-x: scroll">
        <div class="book-list">
          <div class="row-item" :data-index="index" v-for="(item, index) in listData" :key="item.id">
            <div>
              <span>{{ item }}</span>月 节能减排改造项目
            </div>
            <div>
              <a-button @click="handleDetail(item)">查看</a-button>
              <a-button v-show="hasPermission('deviceManage:report')" type="primary" @click="handleAdd(item)">汇报</a-button>
            </div>
          </div>
        </div>
      </div>
      <a-empty v-else description="暂无数据" style="position: relative; margin: 20px" />
  </div>
  <DeviceManageModal @register="registerModal"></DeviceManageModal>
  <DeviceManageDetail @register="registerDetail"></DeviceManageDetail>
</template>
<script setup name="deviceManage" lang="ts">
  import DeviceManageModal from './components/deviceManageModal.vue'
  import DeviceManageDetail from './components/deviceManageDetail.vue'
  import { ref, reactive, onMounted } from 'vue';
  import { useModal } from '/@/components/Modal';
  import { getLoginBackInfo } from '/@/utils/auth';
  import dayjs, {Dayjs} from "dayjs";
  import {defHttp} from "/@/utils/http/axios";
  import {deleteOne} from "/@/views/compliance/deviceManage/url/index";
  import {usePermission} from "/@/hooks/web/usePermission";

  const { hasPermission } = usePermission();
  const yearFormat = 'YYYY';
  // 添加
  const [registerModal, { openModal }] = useModal();
  // 查看
  const [registerDetail, {openModal: openDetail}] = useModal();

  const loginInfo: any = getLoginBackInfo();
  const orgCode = loginInfo.userInfo.orgCode;
  const isSecuritySector = loginInfo.departs[0]?.isSecuritySector;
  const orgCodeDisabled = ref(false);
  orgCodeDisabled.value = isSecuritySector !== '1' && orgCode.length >= 6;
  const queryParams = reactive({
    paramYear: dayjs(),
  });
  const listData = ref<any[]>([]);
  const year = ref([]);
  // let disabledDate;
  async function getYear() {
    await defHttp.get({ url: '/ecm/ehsEcmEs/years'}).then(res=>{
      year.value = res;
      // disabledDate = (current: Dayjs)=> {
      //   console.log(year.value);
      //   console.log(current);
      //   return current.startOf("year") < dayjs(year.value[0]).startOf("year") || current > dayjs(year.value[year.length-1]).endOf("year");
      // }
    })
  }
  getYear();
  const disabledDate = (current: Dayjs)=> {
    return current < dayjs(year.value[0].toString(),'YYYY').startOf("year") || current > dayjs(year.value[year.value.length-1].toString(),'YYYY').endOf("year");
  };
  const init = () => {
    defHttp.get({url: '/ecm/ehsEcmEs/months',params: {year: queryParams.paramYear.year()}}).then(res => {
      listData.value = res;
    })
    // if (queryParams.paramYear.year() < dayjs().year()) {
    //   listData.value = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    // } else if (queryParams.paramYear.year() == dayjs().year()) {
    //   listData.value = [];
    //   const curMonth = dayjs().month();
    //   console.log("==curMonth==", curMonth);
    //   for (let i = 1; i <= curMonth + 1; i++) {
    //     listData.value.push(i);
    //   }
    // } else {
    //   listData.value = [];
    // }
  };
  onMounted(() => {
    init();
  });
  const onChange = (pageNumber: number) => {
    init();
  };
  const searchQuery = () => {
    init();
  };
  const searchReset = () => {
    Object.assign(queryParams, {
      orgCodes: isSecuritySector !== '1' && orgCode.length >= 6 ? [orgCode.length >= 6 ? orgCode.substring(0, 6) : orgCode] : [],
      types: [],
      results: [],
      description: '',
      time: [],
      startTime: '',
      endTime: '',
    });
    init();
  };
  const handleAdd = (item) => {
    openModal(true, {year: queryParams.paramYear.year(),month: item});
  };
  // 补充资料弹框
  const handleDetail = (item) => {
    openDetail(true, {year: queryParams.paramYear.year(),month: item});
  };
</script>
<style lang="less" scoped>
  .accidentInquiry {
    margin: 10px;
    border-radius: 2px;
    background-color: #ffffff;
  }
  .accidentInquiry-form {
    padding: 12px 10px 6px;
  }
  .accidentInquiry-content {
    padding: 6px;
    .book-list {
      .row-item {
        width: calc((100% - 2%) / 4);
        min-height: 186px;
        display: inline-table;
        border: 1px solid rgba(170, 170, 170, 1);
        border-radius: 8px;
        padding: 15px;
        margin: 6px 0;
        margin-right: calc(2% / 3);
        &:nth-child(4n) {
          margin-right: 0;
        }
        & > div:nth-child(1) {
          font-weight: normal;
          font-size: 16px;
          & > span:nth-child(1) {
            font-weight: bold;
            font-size: 30px;
          }
        }
        & > div:last-child {
          margin-top: 100px;
          display: flex;
          justify-content: flex-end;
          line-height: 32px;
          & > button:nth-child(2) {
            margin-left: 5px;
          }
        }
      }
    }
    .bottom-page {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding-right: 20px;
    }
  }
  /deep/ .ant-form-item {
    margin-bottom: 8px !important;
  }
</style>
