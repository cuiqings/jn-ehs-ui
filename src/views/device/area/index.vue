<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="jeecg-basic-table-form-container" @keyup.enter="searchQuery">
      <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-row :gutter="24">
          <a-col :md="6" :sm="12">
            <a-form-item label="所属机构">
              <JTreeSelect1 v-model:value="queryParam.orgCode" load-triggle-change :url="departUrl" :fieldNames="fieldNames" />
            </a-form-item>
          </a-col>

          <a-col :md="6" :sm="12">
            <a-form-item label="系统分类">
              <JTreeSelect1 v-model:value="queryParam.deviceCategoryId" load-triggle-change :url="systemUrl" :fieldNames="fieldSystemNames" />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <a-form-item label="设备状态">
              <JDictSelectTag
                v-model:value="queryParam.deviceStatus"
                :allowClear="true"
                :showChooseOption="false"
                placeholder="请选择"
                dictCode="device_status"
              />
            </a-form-item>
          </a-col>
          <a-col :md="6" :sm="12">
            <div class="btn-list">
              <a-button type="primary" @click="searchQuery">查询</a-button>
              <a-button type="primary" @click="searchReset" style="margin-left: 8px">重置</a-button>
            </div>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 卡片区域 -->
    <a-tabs v-model:activeKey="activeKey" @change="handleTabChange">
      <a-tab-pane :tab="item.title" v-for="(item, index) in deviceList" :key="index + ''">
        <div v-if="list.length > 0" class="card-wrap">
          <div class="wrapSpan">
            <span class="wrapSpan_A">
              在线设备：
              <span class="wrapSpan_B">{{ status0 }}</span>
            </span>
            <span class="wrapSpan_A">
              离线设备：
              <span class="wrapSpan_B">{{ status1 }}</span>
            </span>
            <span class="wrapSpan_A">
              报警设备：
              <span class="wrapSpan_B">{{ status2 }}</span>
            </span>
          </div>
          <div class="listWrap">
            <div class="listDiv">
              <div class="listDivList" v-for="(ite, inx) in list" :key="inx">
                <div class="listImg" @click="showAllData(ite)">
                  <div class="card-head">
                    <img v-if="ite.status == 1" class="card-img" :src="getFullImgName(ite.deviceFunctionCategoryName)" />
                    <img v-if="ite.status == 0" class="card-img" :src="getFullGrayImgName(ite.deviceFunctionCategoryName)" />
                    <img v-if="ite.status == 2" class="card-img" :src="getFullRedImgName(ite.deviceFunctionCategoryName)" />
                    <div class="card-name">
                      <div class="name_ban1">
                        <div class="name_ban1_tip">
                          <div class="name_ban1_tip_0" v-if="ite.status == 0">离线</div>
                          <div class="name_ban1_tip_1" v-if="ite.status == 1">在线</div>
                          <div class="name_ban1_tip_2" v-if="ite.status == 2">报警</div>
                        </div>
                        {{ ite.name }}
                      </div>
                      <div class="nameQy">
                        所属部门：
                        <span>{{ ite.departmentName || '未知部门' }}</span>
                      </div>
                      <div class="nameQy">
                        系统分类：
                        <span>{{ ite.deviceCategoryName || '未知分类' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="tr-nodata">
          <span>暂无数据</span>
        </div>
        <!-- 分页 -->
        <div v-if="list.length > 0" class="page-wrap">
          <a-pagination
            v-model:current="current"
            :page-size-options="pageSizeOptions"
            :total="total"
            show-size-changer
            v-model:page-size="pageSize"
            @change="onChange"
            @show-size-change="onShowSizeChange"
          />
        </div>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>
<script lang="ts" name="area-collect" setup>
  import { ref, reactive, onMounted, onUnmounted } from 'vue';
  import { defHttp } from '/@/utils/http/axios';
  import { Pagination } from 'ant-design-vue';
  import { JTreeSelect1 } from '/@/components/Form';
  import JDictSelectTag from '/@/components/Form/src/jeecg/components/JDictSelectTag.vue';
  import { useRouter } from 'vue-router';
  const router: any = useRouter();
  const APagination = Pagination;
  const queryParam = reactive({
    orgCode: undefined,
    deviceCategoryId: undefined,
    deviceStatus: undefined,
    deviceFunctionCode: '',
  });
  const labelCol = reactive({
    xs: { span: 24 },
    sm: { span: 5 },
  });
  const wrapperCol = reactive({
    xs: { span: 24 },
    sm: { span: 19 },
  });
  const deviceList = ref([{ key: '', title: '全部' }]);
  const activeKey = ref('0');
  const pageSizeOptions = ref<string[]>(['12', '24', '32']);
  const current = ref(1);
  const pageSize = ref(12);
  const total = ref(0);
  const loading = ref(false);
  const list: any = ref([]);
  const selectedSearchTags = ref([]);
  const timer = ref();
  const status0 = ref(0);
  const status1 = ref(0);
  const status2 = ref(0);
  const departUrl = ref('/jn/common/getDepartTreeBy23');
  const systemUrl = ref('/deviceCategory/listDeviceCategoryTree');
  const fieldNames = reactive({ label: 'departName', value: 'orgCode', options: 'children' });
  const fieldSystemNames = reactive({ label: 'name', value: 'id', options: 'children' });
  getDeviceList();
  loadData(1);
  onMounted(() => {
    timer.value = setInterval(() => {
      loadData(current.value);
    }, 15000);
  });
  // //在页面销毁之前先销毁定时器
  onUnmounted(() => {
    clearInterval(timer.value);
  });
  //tab签
  function handleTabChange(key) {
    console.log('deviceList', deviceList.value, key);
    queryParam.deviceFunctionCode = deviceList.value[Number(key)].key;
    console.log('handleTabChange', key, queryParam.deviceFunctionCode);
    getDeviceStatusCount();
    loadData(1);
  }
  function searchReset() {
    queryParam.deviceCategoryId = undefined;
    queryParam.orgCode = undefined;
    queryParam.deviceStatus = undefined;
    queryParam.deviceFunctionCode = '';
    selectedSearchTags.value = [];
    loadData(1);
  }
  function searchQuery() {
    loadData(1);
  }
  function onShowSizeChange(_current, _pageSize) {
    pageSize.value = _pageSize;
    loadData(1);
  }
  function onChange(pageNumber) {
    console.log('Page: ', pageNumber);
    current.value = pageNumber;
    loadData(pageNumber);
  }
  function loadData(arg) {
    if (arg === 1) {
      current.value = 1;
    }
    loading.value = true;
    let params: any = Object.assign({}, queryParam);
    params.pageNo = current.value;
    params.pageSize = pageSize.value;
    defHttp.get({ url: '/space/energyRegionDeviceListViewNew', params }).then((res) => {
      loading.value = false;
      list.value = res.records;
      total.value = res.total;
    });
    getDeviceStatusCount();
  }
  function getDeviceStatusCount() {
    defHttp.get({ url: '/device/deviceStatusStats', params: queryParam }).then((res) => {
      res.forEach((item) => {
        if (item.name == '报警') {
          status2.value = item.value;
        }
        if (item.name == '离线') {
          status1.value = item.value;
        }
        if (item.name == '正常') {
          status0.value = item.value;
        }
      });
    });
  }
  function getDeviceList() {
    defHttp.get({ url: '/deviceFunctionCategory/listDeviceFunctionTab' }).then((res) => {
      deviceList.value = [{ key: '', title: '全部' }];
      deviceList.value = deviceList.value.concat(res);
    });
  }
  function getFullImgName(name) {
    let imgSrc = new URL(`../../../assets/images/device/energy-collect-${getImgName(name)}.png`, import.meta.url).href;
    return imgSrc;
  }
  function getFullGrayImgName(name) {
    let imgSrc = new URL(`../../../assets/images/device/energy-collect-gray-${getImgName(name)}.png`, import.meta.url).href;
    return imgSrc;
  }
  function getFullRedImgName(name) {
    let imgSrc = new URL(`../../../assets/images/device/energy-collect-red-${getImgName(name)}.png`, import.meta.url).href;
    return imgSrc;
  }
  // 设备类别对应图标
  function getImgName(name) {
    let send_name = 'r1';
    if (name.indexOf('静电电阻') !== -1) {
      send_name = 'r1';
    } else if (name.indexOf('回转窑') !== -1) {
      send_name = 'r2';
    } else if (name.indexOf('甲烷气体') !== -1) {
      send_name = 'r3';
    } else if (name.indexOf('RTO') !== -1) {
      send_name = '6';
    } else if (name.indexOf('VOC') !== -1) {
      send_name = '7';
    } else if (name.indexOf('生物滴滤') !== -1) {
      send_name = '8';
    } else if (name.indexOf('可燃气体') !== -1) {
      send_name = 'r5';
    } else if (name.indexOf('燃烧炉') !== -1) {
      send_name = '3';
    } else if (name.indexOf('压差表') !== -1) {
      send_name = 'r4';
    } else {
      send_name = '2';
    }
    return send_name;
  }
  function showAllData(record) {
    console.log('showAllData record', record);
    router.push({
      path: '/area/collect/details',
      query: {
        deviceId: record.deviceId,
        // type: record.type,
        name: record.name,
        status: record.status,
        code: record.deviceFunctionCategoryCode,
      },
    });
  }
</script>
<style lang="less" scoped>
  .jeecg-basic-table-form-container {
    .table-page-search-submitButtons {
      display: block;
      margin-bottom: 24px;
      white-space: nowrap;
    }
  }
  .card-wrap {
    margin-top: 5px;
    .wrapSpan {
      font-size: 14px;
      margin: 10px 0;
      .wrapSpan_A {
        margin-right: 24px;
        color: rgba(0, 0, 0, 0.38);
      }
      .wrapSpan_B {
        color: rgba(0, 0, 0, 0.87);
      }
    }
  }

  :deep(.ant-select-selection--multiple .ant-select-selection__choice__content) {
    max-width: 96%;
  }
  :deep(.ant-select-selection--multiple .ant-select-selection__choice) {
    max-width: 48%;
  }
  :deep(.ant-select-selection--multiple) {
    padding-bottom: 3px;
    cursor: text;
    zoom: 1;
    max-height: 60px;
    overflow-y: auto;
  }
  :deep(.ant-card-head) {
    min-height: 226px;
    margin-bottom: -1px;
    padding: 0 24px;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    font-size: 16px;
    background: rgba(0, 0, 0, 0.02);
    border-bottom: 0px;
    border-radius: 0 0 0 0;
    zoom: 1;
  }

  .page-wrap {
    float: right;
    margin-top: 20px;
  }
  .card-actions {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 80px;
    border-top: 1px solid #e8e8e8;
  }
  .go-link {
    width: 20px;
    height: 20px;
    vertical-align: middle;
    margin-left: 5px;
    cursor: pointer;
  }
  .tr-nodata {
    color: #999;
    line-height: 61px;
    text-align: center;
  }
  .point-list {
    height: 96px;
    margin-bottom: 80px;
    margin-top: 44px;
    .point-item {
      display: inline-block;
      width: 49%;
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: bottom;
      .item-name {
        display: inline-block;
        width: 50%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align: bottom;
        text-align: right;
      }
      .point-link {
        display: inline-block;
        color: #3e87f8;
        border-bottom: 1px solid #3e87f8;
        cursor: pointer;
      }
    }
  }
  .ant-card-bordered {
    border: 0;
  }
  .listWrap {
    position: relative;
    margin-bottom: 15px;
    margin-left: 30px;
    .listDiv {
      display: flex;
      flex-flow: row wrap;
      .listDivList {
        position: relative;
        display: inline-flex;
        margin: 8px;
        background: #f5f8fb;
        border-radius: 4px;
        width: 23%;
        .listImg {
          position: relative;
          width: 100%;
          display: flex;
          flex-flow: column nowrap;
          justify-content: center;
          cursor: pointer;
          .card-head {
            color: rgba(0, 0, 0, 1);
            font-size: 14px;
            zoom: 1;
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            .card-img {
              display: block;
              margin: 36px 12px;
              width: 56px;
              height: 56px;
            }
            .card-name {
              text-align: left;
              width: 100%;
              margin: 20px 15px;
              .nameQy {
                margin-top: 8px;
                color: rgba(0, 0, 0, 0.38);
                span {
                  color: #000;
                }
              }
              .name_ban1 {
                font-size: 16px;
                .name_ban1_tip {
                  display: inline-flex;
                  width: 38px;
                  height: 21px;
                  margin-right: 8px;
                  font-size: 13px;
                  text-align: center;
                  align-items: center;
                }
                .name_ban1_tip_0 {
                  background: #dadcdf;
                  color: rgba(0, 0, 0, 0.38);
                  border-radius: 2px;
                  line-height: 21px;
                  height: 100%;
                  width: 100%;
                }
                .name_ban1_tip_1 {
                  background: rgba(51, 119, 243, 0.15);
                  color: #3377f3;
                  border-radius: 2px;
                  line-height: 21px;
                  height: 100%;
                  width: 100%;
                }
                .name_ban1_tip_2 {
                  background: rgba(205, 43, 29, 0.15);
                  color: #cd2b1d;
                  border-radius: 2px;
                  line-height: 21px;
                  height: 100%;
                  width: 100%;
                }
              }
            }
          }
        }
      }
    }
  }
</style>
