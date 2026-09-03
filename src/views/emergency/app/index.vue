<template>
  <div class="app-em-wrap">
    <van-tabs v-model:active="activeName" @click-tab="onClickTab">
      <van-tab title="应急预案" name="a">
        <van-search shape="round" v-model="searchValue1" placeholder="请输入" @search="onSearch1" />
        <div class="list-box">
          <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad1">
            <div class="box-item" v-for="(item, index) in listData1" :key="index">
              <div style="position: relative" @click="handlePreview(item.filePath)">
                <img class="item-book" src="../../../assets/images/emergency/app-book-1@2x.png" alt="" />
                <div class="book-title">应急预案</div>
              </div>
              <div class="item-right">
                <div class="item-title" @click="handlePreview(item.filePath)" v-html="item.name"></div>
                <div class="item-time">{{ item.createTime }}</div>
                <div class="item-action">
                  <!-- <div class="icon-item" @click="handleCollect(index)">
                    <img
                      v-if="isCollect && collectIndex == index"
                      class="icon-collect"
                      src="../../../assets/images/emergency/collect-active@2x.png"
                      alt=""
                    />
                    <img v-else class="icon-collect" src="../../../assets/images/emergency/collect-gray@2x.png" alt="" />
                    <span class="icon-text">收藏</span>
                  </div> -->
                  <div class="icon-item" @click="downloadFile(item.filePath)">
                    <img class="icon-collect" src="../../../assets/images/emergency/app-download@2x.png" alt="" />
                    <span class="icon-text">下载</span>
                  </div>
                  <div class="icon-item" style="margin-left: 80px; margin-right: 0px" @click="showMarkDialog(item)">
                    <img class="icon-collect" src="../../../assets/images/emergency/mark-icon@2x.png" alt="" />
                    <span class="icon-text">备注</span>
                  </div>
                </div>
              </div>
            </div>
          </van-list>
        </div>
      </van-tab>
      <van-tab title="应急处置" name="b">
        <div class="search-wrap">
          <van-search class="search-left" shape="round" v-model="searchValue2" placeholder="请输入" @search="onSearch2" />
          <div class="search-right" @click="showSearchDrawer">
            <span class="btn-text">筛选</span>
            <img class="btn-icon" src="../../../assets/images/emergency/down.png" alt="" />
          </div>
        </div>
        <div class="list-box">
          <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad2">
            <div class="box-item" v-for="(item, index) in listData2" :key="index">
              <div style="position: relative" @click="handlePreview(item.filePath)">
                <img class="item-book" src="../../../assets/images/emergency/app-book-1@2x.png" alt="" />
                <div class="book-title">应急处置</div>
              </div>
              <div class="item-right">
                <div class="item-title" @click="handlePreview(item.filePath)" v-html="item.name"></div>
                <div class="item-label">
                  <span v-if="item.typeCode" class="label-item">{{ filterMultiDictText(dictOptionsECL, item.typeCode) }}</span>
                  <span v-if="item.orgCodeText" class="label-item">{{ item.orgCodeText }}</span>
                  <span v-if="item.departText" class="label-item">{{ item.departText }}</span>
                </div>
                <div class="item-time">{{ item.createTime }}</div>
                <div class="item-action">
                  <!-- <div class="icon-item" @click="handleCollect(index)">
                    <img
                      v-if="isCollect && collectIndex == index"
                      class="icon-collect"
                      src="../../../assets/images/emergency/collect-active@2x.png"
                      alt=""
                    />
                    <img v-else class="icon-collect" src="../../../assets/images/emergency/collect-gray@2x.png" alt="" />
                    <span class="icon-text">收藏</span>
                  </div> -->
                  <div class="icon-item" @click="downloadFile(item.filePath)">
                    <img class="icon-collect" src="../../../assets/images/emergency/app-download@2x.png" alt="" />
                    <span class="icon-text">下载</span>
                  </div>
                </div>
              </div>
            </div>
          </van-list>
        </div>
      </van-tab>
      <van-tab title="应急演练" name="c">
        <div class="search-wrap">
          <van-search class="search-left" shape="round" v-model="searchValue3" placeholder="请输入" @search="onSearch3" />
          <div class="search-right" @click="showSearchDrawer">
            <span class="btn-text">筛选</span>
            <img class="btn-icon" src="../../../assets/images/emergency/down.png" alt="" />
          </div>
        </div>
        <div class="practice-box">
          <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad3">
            <div class="practice-item" v-for="(item, index) in listData3" :key="index" @click="handleDetail(item)">
              <div class="item-title" v-html="item.name"></div>
              <div class="item-content">
                <span>{{ item.orgCodeText }}</span
                >-<span>{{ item.departText }}</span>
                <span style="margin-left: 12px">{{ item.createTime }}</span>
              </div>
              <div class="label-wrap">
                <img v-if="item.typeCode" class="item-img" src="../../../assets/images/emergency/app-practice-label@2x.png" alt="" />
                <div class="item-label">{{ filterMultiDictText(dictOptionsECL, item.typeCode) }}</div>
              </div>
            </div>
          </van-list>
        </div>
      </van-tab>
    </van-tabs>
    <!-- 右侧弹出 -->
    <van-popup v-model:show="showRight" closeable position="right" :style="{ width: '294px', height: '100%' }">
      <div style="position: relative">
        <div class="search-title">筛选</div>
        <div class="search-split"></div>
        <div class="content-box">
          <div class="content-item">
            <div class="item-label">所属机构</div>
            <div v-if="!isCanSelectLine" class="choose-list">
              <div
                class="choose-item"
                @click="chooseLine(index, item.value)"
                v-for="(item, index) in orgOptions"
                :key="index"
                :class="{
                  'item-long-text': item.label.length > 8,
                  'item-margin': (index + 1) % 2 != 0 && item.label.length <= 8,
                  'item-active': (isActiveLine && isActiveLineIndex == index) || item.value == queryParam.orgCode,
                }"
              >
                {{ item.label }}
              </div>
            </div>
            <div v-else class="choose-list">
              <div
                class="choose-item item-active"
                :class="{
                  'item-long-text': orgOptions.filter((item) => item.value == queryParam.orgCode)[0].label.length > 8,
                }"
              >
                {{ orgOptions.filter((item) => item.value == queryParam.orgCode)[0].label }}
              </div>
            </div>
          </div>
          <div v-if="departOptions.length > 0" class="content-item">
            <div class="item-label">部门</div>
            <div class="choose-list">
              <div
                class="choose-item"
                @click="chooseDepart(index, item.value)"
                v-for="(item, index) in departOptions"
                :key="index"
                :class="{
                  'item-long-text': item.label.length > 8,
                  'item-margin': (index + 1) % 2 != 0 && item.label.length <= 8,
                  'item-active': (isActiveDepart && isActiveIndex == index) || item.value == queryParam.departCode,
                }"
                >{{ item.label }}</div
              >
            </div>
          </div>
          <div class="content-item">
            <div class="item-label">分类</div>
            <div class="choose-list">
              <div
                class="choose-item"
                @click="chooseClassify(index, item.value)"
                v-for="(item, index) in dictOptionsECL"
                :key="index"
                :class="{
                  'item-long-text': item.label.length > 8,
                  'item-margin': (index + 1) % 2 != 0 && item.label.length <= 8,
                  'item-active': isActiveClassify && isActiveClassifyIndex == index,
                }"
                >{{ item.text }}
                <input type="text" v-model="item.value" style="display: none" />
              </div>
            </div>
          </div>
          <div class="content-item" style="position: relative">
            <div class="item-label">录入时间</div>
            <a-input
              :disabled="true"
              style="width: 264px; height: 46px; border-radius: 4px 4px 4px 4px; margin-top: 8px"
              v-model:value="date"
              placeholder="请选择"
            />
            <van-icon name="arrow-down" class="arrow-down" @click="showTime = true" />
          </div>
        </div>
        <div class="action-btn">
          <div class="btn-item-1" @click="handleReset">重置</div>
          <div class="btn-item-2" @click="handleConfirm">查询</div>
        </div>
      </div>
    </van-popup>
    <van-calendar :max-date="maxDate" :min-date="minDate" v-model:show="showTime" :allow-same-day="true" type="range" @confirm="onConfirm" />

    <!-- 右侧弹出 -->
    <van-popup v-model:show="showDetail" closeable position="right" :style="{ width: '100%', height: '100%' }">
      <div class="drill-wrap">
        <div class="drill-content">
          <div class="detail-title">应急演练详情</div>
          <div class="item-box">
            <span class="label">所属机构</span>
            <span class="desc">{{ query.orgCodeText }}</span>
          </div>
          <div class="item-box">
            <span class="label">部门</span>
            <span class="desc">{{ query.departText }}</span>
          </div>
          <div class="item-box">
            <span class="label">分类</span>
            <span class="desc">{{ filterMultiDictText(dictOptionsECL, query.typeCode) }}</span>
          </div>
          <div class="item-box">
            <span class="label">演练名称</span>
            <span class="desc">{{ query.name }}</span>
          </div>
          <div class="item-box">
            <span class="label">应急处置方案</span>
            <!-- <span v-if="query.responsePlanFilePath" class="desc-link" @click="handlePreview(query.responsePlanFilePath)">{{
              query.responsePlanName
            }}</span> -->
            <span v-if="query.responsePlanFilePath" class="desc">{{ query.responsePlanName }}</span>
          </div>
          <div class="item-box">
            <span class="label">演练记录</span>
            <span v-if="query.drillRecordPath" class="desc-link" @click="handlePreview(query.drillRecordPath)">{{
              query.drillRecordPath.split('/').slice(-1)[0]
            }}</span>
          </div>
          <div class="item-box">
            <span class="label">演练签到表</span>
            <span v-if="query.drillCheckinPath" class="desc-link" @click="handlePreview(query.drillCheckinPath)">{{
              query.drillCheckinPath.split('/').slice(-1)[0]
            }}</span>
          </div>
          <div class="item-box">
            <span class="label">演练评估</span>
            <span v-if="query.drillEvaluatePath" class="desc-link" @click="handlePreview(query.drillEvaluatePath)">{{
              query.drillEvaluatePath.split('/').slice(-1)[0]
            }}</span>
          </div>
          <div class="item-box">
            <span class="label">录入时间</span>
            <span class="desc">{{ query.createTime }}</span>
          </div>
          <div class="item-box">
            <span class="label">录入人</span>
            <span class="desc">{{ query.createName ? query.createName : query.createBy }}</span>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { showDialog } from 'vant';
import { list1, list2, list3 } from './app.api';
import { downloadFile } from '/@/utils/common/renderUtils';
import { initDictOptions } from '/@/utils/dict';
import { filterMultiDictText } from '/@/utils/dict/JDictSelectUtil.js';
import { defHttp } from '/@/utils/http/axios';
import { useRouter } from 'vue-router';
import { previewFile } from '/@/api/common/api';
import { useUserStore } from '/@/store/modules/user';
const userStore = useUserStore();
const userinfo = computed(() => userStore.getUserInfo);
console.log('userinfo', userinfo);
const loginInfo = computed(() => userStore.getLoginInfo);
console.log('loginInfo', loginInfo);
let isSecuritySector = loginInfo.value.departs[0].isSecuritySector;
const router = useRouter();
const activeName = ref('a');
const searchValue1 = ref('');
const searchValue2 = ref('');
const searchValue3 = ref('');
const loading = ref(false);
const finished = ref(false);
const showRight = ref(false);
const isActiveDepart = ref(false);
const isActiveIndex = ref(null);
const isActiveClassify = ref(false);
const isActiveClassifyIndex = ref(null);
const isActiveLineIndex = ref(null);
const date = ref('');
const showTime = ref(false);
const isCollect = ref(false);
const collectIndex = ref(0);
const listData1 = ref([]);
const listData2 = ref([]);
const listData3 = ref([]);
const current = ref(1);
const pageSizeRef = ref(8);
const total1 = ref(0);
const total2 = ref(0);
const total3 = ref(0);
const dictOptionsECL = ref<any>([]);
const departOptions = ref<any>([]);
const orgOptions = ref<any>([]);
const isCanSelectLine = ref(false);
const isActiveLine = ref(false);
const queryParam = reactive({
  name: '',
  startTime: '',
  endTime: '',
  typeCode: '',
  orgCode: initOrgCode(),
  // departCode: initDeptCode(),
  departCode: '',

});
function initOrgCode() {
  console.log('userinfo.value.orgCode', userinfo, userinfo.value.orgCode);
  let queryParam = {};
  if (userinfo.value.orgCode.length > 6) {
    queryParam.orgCode = userinfo.value.orgCode.slice('0', '6');
    queryParam.departCode = userinfo.value.orgCode;
  } else if (userinfo.value.orgCode.length == 6) {
    queryParam.orgCode = userinfo.value.orgCode;
    queryParam.departCode = undefined;
  } else {
    queryParam.orgCode = undefined;
    queryParam.departCode = undefined;
  }
  if (userinfo.value.orgCode.length > 3 && isSecuritySector != 1 && userinfo.value.orgCode.slice('0', '6') != 'A04B01') {
    isCanSelectLine.value = true;
  } else {
    isCanSelectLine.value = false;
  }
  getDepartList(queryParam.orgCode);
  console.log('queryParam.orgCode', queryParam.orgCode);
  return queryParam.orgCode;
}
function initDeptCode() {
  let queryParam = {};
  if (userinfo.value.orgCode.length > 6) {
    queryParam.orgCode = userinfo.value.orgCode.slice('0', '6');
    queryParam.departCode = userinfo.value.orgCode;
  } else if (userinfo.value.orgCode.length == 6) {
    queryParam.orgCode = userinfo.value.orgCode;
    queryParam.departCode = undefined;
  } else {
    queryParam.orgCode = undefined;
    queryParam.departCode = undefined;
  }
  return queryParam.departCode;
}
const searchClassifyValue = ref('');
const query = ref({});
const showDetail = ref(false);
const maxDate = new Date();
const minDate = new Date(new Date().getFullYear() - 5, new Date().getMonth(), new Date().getDate());
/**
 * 初始化字典选项
 */
async function initDictConfig() {
  dictOptionsECL.value = await initDictOptions('emergency_disposal_classify');
}
loadData1(1);
onMounted(() => {
  //初始化字典选项
  initDictConfig();
  getOrgList();
});
async function getOrgList() {
  await defHttp.get({ url: '/jn/common/selectLine?orgCategories=1,2,4' }).then((res) => {
    res.map((item) => {
      orgOptions.value.push({
        label: item.departName,
        value: item.orgCode,
      });
    });
  });
  console.log('options', orgOptions.value);
}
function getDepartList(value) {
  console.log('getDepartList', value);
  if (value == undefined) {
    value = '';
  }
  let params = {};
  params.orgCode = value;
  params.pageSize = 9999;
  params.pageNo = 1;
  defHttp.get({ url: '/jn/common/selectDept?orgCategories=1,2,4', params }).then((res) => {
    departOptions.value = [];
    if (res && res.records && res.records.length > 0) {
      res.records.map((item) => {
        departOptions.value.push({
          label: item.departName,
          value: item.orgCode,
        });
      });
    }
  });
}
const onClickTab = ({ title }) => {
  console.log('title', title);
  // 清空查询条件
  handleReset();
  if (title == '应急预案') {
    listData1.value = [];
    current.value = 1;
    total1.value = 0;
    loadData1(1);
  } else if (title == '应急处置') {
    listData2.value = [];
    current.value = 1;
    total2.value = 0;
    loadData2(1);
  } else if (title == '应急演练') {
    listData3.value = [];
    current.value = 1;
    total3.value = 0;
    loadData3(1);
  }
};
const onSearch1 = (val) => {
  console.log('val', val);
  listData1.value = [];
  current.value = 1;
  total1.value = 0;
  loadData1(1);
};

const onLoad1 = () => {
  // 异步更新数据
  // setTimeout 仅做示例，真实场景中一般为 ajax 请求
  console.log('onLoad1');
  // 数据全部加载完成
  if (listData1.value.length == total1.value) {
    finished.value = true;
  } else {
    finished.value = false;
    // 加载状态结束
    loading.value = false;
    current.value += 1;
    loadData1(current.value);
  }
};
//应急预案列表
async function loadData1(arg) {
  if (arg === 1) {
    current.value = 1;
    listData1.value = [];
  }
  loading.value = true;
  console.log('queryParam', queryParam);
  let param = Object.assign({}, queryParam);
  param['name'] = searchValue1.value;
  param['pageNo'] = current.value;
  param['pageSize'] = pageSizeRef.value;
  console.log('param', param);
  await list1(param).then((res) => {
    console.log('res', res);
    listData1.value = listData1.value.concat(res.records);
    if (searchValue1.value) {
      let listDataBak = listData1.value.map((item) => {
        if (item.name.indexOf(searchValue1.value) > -1) {
          item.name = item.name.replace(searchValue1.value, "<span style='color:red'>" + searchValue1.value + '</span>');
        }
        return item;
      });
      listData1.value = listDataBak;
      console.log('this.listData.value', listData1.value);
    }
    total1.value = res.total;
    loading.value = false;
  });
}
const onSearch2 = (val) => {
  console.log('val', val);
  listData2.value = [];
  current.value = 1;
  total2.value = 0;
  loadData2(1);
};
const onSearch3 = (val) => {
  console.log('val', val);
  listData3.value = [];
  current.value = 1;
  total3.value = 0;
  loadData3(1);
};
const onLoad2 = () => {
  // 异步更新数据
  // setTimeout 仅做示例，真实场景中一般为 ajax 请求
  console.log('onLoad2');
  // 数据全部加载完成
  if (listData2.value.length == total2.value) {
    finished.value = true;
  } else {
    finished.value = false;
    // 加载状态结束
    loading.value = false;
    current.value += 1;
    loadData2(current.value);
  }
};
//应急处置方案列表
async function loadData2(arg) {
  if (arg === 1) {
    current.value = 1;
    listData2.value = [];
  }
  loading.value = true;
  console.log('loadData2 queryParam', queryParam);
  let param = Object.assign({}, queryParam);
  param['name'] = searchValue2.value;
  param['pageNo'] = current.value;
  param['pageSize'] = pageSizeRef.value;
  console.log('param', param);
  await list2(param).then((res) => {
    console.log('res', res);
    listData2.value = listData2.value.concat(res.records);
    if (searchValue2.value) {
      let listDataBak = listData2.value.map((item) => {
        if (item.name.indexOf(searchValue2.value) > -1) {
          item.name = item.name.replace(searchValue2.value, "<span style='color:red'>" + searchValue2.value + '</span>');
        }
        return item;
      });
      listData2.value = listDataBak;
      console.log('this.listData.value', listData2.value);
    }
    total2.value = res.total;
    loading.value = false;
  });
}
const onLoad3 = () => {
  // 异步更新数据
  // setTimeout 仅做示例，真实场景中一般为 ajax 请求
  console.log('onLoad3 listData3', listData3.value);
  // 数据全部加载完成
  if (listData3.value.length == total3.value) {
    finished.value = true;
  } else {
    finished.value = false;
    // 加载状态结束
    loading.value = false;
    current.value += 1;
    loadData3(current.value);
  }
};
//应急处置方案列表
async function loadData3(arg) {
  console.log('current value', arg);
  if (arg == 1) {
    current.value = 1;
    listData3.value = [];
  }
  loading.value = true;
  let param = Object.assign({}, queryParam);
  param['name'] = searchValue3.value;
  param['pageNo'] = current.value;
  param['pageSize'] = pageSizeRef.value;
  console.log('param', param);
  await list3(param).then((res) => {
    console.log('res', res);
    listData3.value = listData3.value.concat(res.records);
    if (searchValue3.value) {
      let listDataBak = listData3.value.map((item) => {
        if (item.name.indexOf(searchValue3.value) > -1) {
          item.name = item.name.replace(searchValue3.value, "<span style='color:red'>" + searchValue3.value + '</span>');
        }
        return item;
      });
      listData3.value = listDataBak;
      console.log('this.listData.value', listData3.value);
    }
    total3.value = res.total;
    loading.value = false;
  });
}
const formatDate = (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
const onConfirm = (values) => {
  const [start, end] = values;
  showTime.value = false;
  date.value = `${formatDate(start)} - ${formatDate(end)}`;
  queryParam['startTime'] = `${formatDate(start)} 00:00:00`;
  queryParam['endTime'] = `${formatDate(end)} 23:59:59`;
};
function showSearchDrawer() {
  showRight.value = true;
}
function chooseLine(index, value) {
  getDepartList(value);
  console.log('chooseLine', index, value);
  if (isActiveLineIndex.value == index) {
    console.log('chooseLine 11111');
    isActiveLine.value = !isActiveLine.value;
    queryParam['orgCode'] = '';
  } else {
    console.log('chooseLine 22222');
    isActiveLineIndex.value = index;
    isActiveLine.value = true;
    queryParam['orgCode'] = value;
    console.log('chooseLine queryParam', queryParam);
  }
}
function chooseDepart(index, value) {
  if (isActiveIndex.value == index) {
    isActiveDepart.value = !isActiveDepart.value;
    queryParam['departCode'] = '';
  } else {
    isActiveIndex.value = index;
    isActiveDepart.value = true;
    queryParam['departCode'] = value;
    console.log('chooseDepart', queryParam.value);
  }
}
function chooseClassify(index, value) {
  if (isActiveClassifyIndex.value == index) {
    isActiveClassify.value = !isActiveClassify.value;
    searchClassifyValue.value = '';
    queryParam['typeCode'] = '';
  } else {
    isActiveClassifyIndex.value = index;
    isActiveClassify.value = true;
    searchClassifyValue.value = value;
    queryParam['typeCode'] = value;
  }
}
function handleCollect(index) {
  console.log(index);
  if (collectIndex.value == index) {
    isCollect.value = !isCollect.value;
  } else {
    collectIndex.value = index;
    isCollect.value = true;
  }
}
function showMarkDialog(item) {
  if (!item.remark) {
    item.remark = '暂无数据';
  }
  showDialog({
    title: '备注',
    message: item.remark,
    messageAlign: 'left',
  }).then(() => {
    // on close
  });
}
// 预览
function handlePreview(filePath) {
  // console.log(filePath);
  if (filePath) {
    previewFile(filePath).then((res) => {
      console.log('previewFile res', res);
      window.open(res, '_blank');
    });
  }
}
// 筛选-确认
function handleConfirm() {
  if (activeName.value == 'b') {
    listData2.value = [];
    current.value = 1;
    total2.value = 0;
    loadData2(1);
  } else if (activeName.value == 'c') {
    listData3.value = [];
    current.value = 1;
    total3.value = 0;
    loadData3(1);
  }
  showRight.value = false;
}
// 重置
function handleReset() {
  finished.value = false;
  loading.value = false;
  isActiveDepart.value = false;
  isActiveIndex.value = null;
  isActiveClassify.value = false;
  isActiveClassifyIndex.value = null;
  isActiveLine.value = false;
  isActiveLineIndex.value = null;
  date.value = '';
  queryParam['startTime'] = '';
  queryParam['endTime'] = '';
  queryParam['typeCode'] = '';
  queryParam['orgCode'] = initOrgCode();
  queryParam['departCode'] = '';
  // queryParam['departCode'] = initDeptCode();
  // if (activeName.value == 'b') {
  //   loadData2(1);
  // }else if (activeName.value == 'c') {
  //   loadData3(1);
  // }
}
// 应急演练详情
function handleDetail(item) {
  console.log('item', item);
  // router.push({ path: '/app/em/drill/detail', query: item });
  showDetail.value = true;
  query.value = Object.assign({}, item);
}
</script>

<style lang="less" scoped>
.app-em-wrap {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #eff1f5;
}
:deep(.van-search) {
  background: none;
}
:deep(.van-search__content) {
  background: #ffffff;
}
:deep(.van-search__field) {
  height: 40px;
}
.search-wrap {
  clear: both;
  overflow: hidden;
  .search-right {
    float: right;
    width: 74px;
    height: 40px;
    border-radius: 20px 20px 20px 20px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    margin: 10px 12px 0 0;
    text-align: center;
    line-height: 40px;
    .btn-text {
      font-size: 13px;
      font-family: PingFang SC-Regular, PingFang SC;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.87);
    }
    .btn-icon {
      display: inline-block;
      width: 10px;
      height: 10px;
      margin-left: 4px;
    }
  }
  .search-left {
    float: left;
    width: 267px;
  }
}
.search-title {
  font-size: 16px;
  font-family: SourceHanSansCN-Medium-, SourceHanSansCN-Medium;
  color: rgba(0, 0, 0, 0.87);
  margin: 12px 0 12px 16px;
}
.search-split {
  width: 100%;
  height: 1px;
  background: #eff1f5;
  border-radius: 0px 0px 0px 0px;
}
.content-box {
  margin-left: 16px;
  padding-bottom: 80px;
  .content-item {
    margin-top: 12px;
    .item-label {
      font-size: 13px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      font-weight: 400;
      color: #000000;
    }
    .choose-list {
      margin-top: 8px;
      .choose-item {
        display: inline-block;
        width: 128px;
        height: 36px;
        background: #eff1f5;
        border-radius: 4px 4px 4px 4px;
        line-height: 36px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
        text-align: center;
        margin-bottom: 8px;
        border: 1px solid #eff1f5;
        cursor: pointer;
      }
      .item-long-text {
        width: 264px;
      }
      .item-margin {
        margin-right: 8px;
      }
      .item-active {
        border: 1px solid #3e87f8;
        background: rgba(62, 135, 248, 0.1);
      }
    }
    .arrow-down {
      position: absolute;
      right: 30px;
      top: 43px;
      z-index: 999;
      width: 8px;
      height: 4px;
      cursor: pointer;
    }
  }
}
.list-box {
  width: 100%;
  height: 100%;
  margin: 12px auto;
  background: #ffffff;
  .box-item {
    height: 134px;
    padding: 12px;
    display: flex;
    .item-book {
      width: 90px;
      height: 110px;
      margin-right: 12px;
    }
    .item-right {
      position: relative;
      flex: 1;
      .item-title {
        width: 242px;
        font-size: 15px;
        font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.87);
        text-overflow: -o-ellipsis-lastline;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      .item-label {
        margin-top: 3px;
        .label-item {
          display: inline-block;
          padding: 0 4px;
          width: auto;
          height: 17px;
          line-height: 17px;
          font-size: 12px;
          font-family: Source Han Sans CN-Regular, Source Han Sans CN;
          font-weight: 400;
          color: rgba(0, 0, 0, 0.45);
          text-align: center;
          margin-right: 4px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 2px 2px 2px 2px;
        }
      }
      .item-time {
        height: 17px;
        font-size: 12px;
        font-family: Source Han Sans CN-Regular, Source Han Sans CN;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.45);
        margin-top: 2px;
      }
      .item-action {
        // margin-top: 18px;
        position: absolute;
        bottom: 2px;
        left: 0px;
        .icon-item {
          cursor: pointer;
          margin-right: 14px;
          display: inline-block;
          .icon-collect {
            display: inline-block;
            width: 14px;
            height: 14px;
            margin-right: 4px;
            margin-top: -4px;
            vertical-align: text-bottom;
          }
          .icon-text {
            font-family: Source Han Sans CN-Regular, Source Han Sans CN;
            font-weight: 400;
            color: rgba(0, 0, 0, 0.45);
            font-size: 11px;
            display: inline-block;
          }
        }
      }
    }
  }
}
.book-title {
  position: absolute;
  bottom: 10px;
  left: 11px;
  font-size: 14px;
  font-family: Source Han Sans CN-Medium, Source Han Sans CN;
  font-weight: 500;
  color: #724315;
}
.practice-box {
  .practice-item {
    position: relative;
    width: 349px;
    height: 74px;
    margin: 13px auto;
    background: #ffffff;
    border-radius: 4px 4px 4px 4px;
    margin-bottom: 12px;
    .item-title {
      padding: 16px 0 0 16px;
      width: 275px;
      font-size: 15px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.87);
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      line-clamp: 1;
      -webkit-box-orient: vertical;
    }
    .item-content {
      font-size: 12px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.45);
      padding: 4px 0 0 16px;
    }
    .label-wrap {
      position: absolute;
      right: 10px;
      top: 0px;
      text-align: center;
    }
    .item-img {
      width: 56px;
      height: 26px;
      z-index: 999;
    }
    .item-label {
      position: absolute;
      top: 2px;
      width: 56px;
      font-size: 11px;
      font-family: Source Han Sans CN-Regular, Source Han Sans CN;
      font-weight: 400;
      color: #724315;
    }
  }
}
.action-btn {
  position: absolute;
  right: 0px;
  bottom: 0px;
  width: 100%;
  z-index: 999;
  .btn-item-1 {
    display: inline-block;
    cursor: pointer;
    width: 50%;
    color: rgba(0, 0, 0, 0.6);
    height: 53px;
    line-height: 53px;
    background: #f7f8fa;
    text-align: center;
  }
  .btn-item-2 {
    display: inline-block;
    cursor: pointer;
    width: 50%;
    height: 53px;
    line-height: 53px;
    font-weight: 600;
    color: #ffffff;
    background: #3e87f8;
    cursor: pointer;
    text-align: center;
  }
}
.detail-title {
  text-align: center;
  font-size: 18px;
  margin-bottom: 15px;
}
.drill-wrap {
  width: 100%;
  height: 100%;
  background: #eff1f5;
  // padding: 12px 0;
}
.drill-content {
  // height: 324px;
  background: #fff;
  width: 100%;
  padding: 16px;
  .item-box {
    font-size: 14px;
    margin-bottom: 8px;
    .label {
      display: inline-block;
      width: 84px;
      text-align: left;
      margin-right: 12px;
      color: rgba(0, 0, 0, 0.38);
      vertical-align: top;
    }
    .desc {
      display: inline-block;
      width: calc(100% - 96px);
      text-align: left;
      color: rgba(0, 0, 0, 0.87);
    }
    .desc-link {
      width: 240px;
      display: inline-block;
      text-align: left;
      color: #3e87f8;
      cursor: pointer;
    }
  }
}
</style>