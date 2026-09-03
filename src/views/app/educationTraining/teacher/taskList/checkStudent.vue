<template>
  <div class="checkStudent">
    <div class="hd">
      <div>
        {{ route.query.name }}
        <span @click="tabClick(1)" :class="{active: activeIdx == 1}">待确认<i>{{ totalData.waitConfirm }}</i></span>
        <span @click="tabClick(2)" :class="{active: activeIdx == 2}">已完成<i>{{ totalData.alreadyConfirm }}</i></span>
        <span @click="tabClick(3)" :class="{active: activeIdx == 3}">未完成<i>{{ totalData.notFinished }}</i></span>
      </div>
      <van-button size="mini" v-show="activeIdx == 1" type="primary" @click="checkAll">批量确认</van-button>
    </div>
    <div class="main" v-loading="loading">
      <List
        :listType="2"
        :total="total1"
        :needBtn="false"
        ref="listRef1"
        :immediateCheck="false"
        @openDetail="openDetail"
        :list="list"
        @onLoad="onLoad"
        @onRefresh="onRefresh"
      >
        <template #check="{ item }">
          <van-button size="mini" type="primary" @click="checkFn(item)">确认</van-button>
        </template>
        <template #detail="{ item }">
          <span style="color: #1890ff" @click.stop="go(item)">明细</span>
        </template>
      </List>
    </div>
    <!-- 线上 -->
    <van-popup position="bottom" round v-model:show="checkShow" :style="{ height: '300px' }">
      <div class="record">
        <div class="record-title">教育者确认</div>
        <div class="main">
          <van-field
            v-if="route.query.type == '1'"
            label-width="100"
            readonly
            input-align="right"
            :border="false"
            v-model="formData.num"
            label="已选培训人员："
          />
          <van-field :border="false" label="确认课时：" placeholder="请输入">
            <template #input>
              <span @click="add(0)" class="add"><van-icon color="#323233" name="minus" /></span>
              <van-field
                input-align="center"
                readonly
                style="background-color: #f5f5f5; padding: 0; width: 60px"
                type="number"
                v-model="formData.duration"
              />
              <span @click="add(1)" class="add"><van-icon color="#323233" name="plus" /></span>
              <span style="padding-left: 10px">课时</span>
            </template>
          </van-field>
          <van-field v-if="currentItems[0].score" readonly :border="false" v-model="value" label="">
            <template #input>
              <van-radio-group v-model="checked" disabled>
                <van-radio name="1">已完成答题教育订正</van-radio>
              </van-radio-group>
            </template>
          </van-field>
        </div>
        <div class="foot">
          <van-button @click="signShow = true" block type="primary">确认签字</van-button>
        </div>
      </div>
    </van-popup>
    <!-- 线下 -->
    <van-popup position="bottom" round v-model:show="checkShowOutline" :style="{ height: '400px' }">
      <div class="record">
        <div class="record-title">教育者确认</div>
        <div class="main">
          <van-form ref="formRef">
            <van-field
              label-width="100"
              readonly
              input-align="right"
              :border="false"
              v-model="formData.num"
              label="已选培训人员："
            />
            <!-- <van-field
              label-width="100"
              input-align="right"
              placeholder="请输入"
              :border="false"
              v-model="formData.content"
              label="职务/工种："
              v-if="!currentItems[0].score"
              :rules="[{ required: true, message: '请输入' }]"
            /> -->
            <van-field v-if="!currentItems[0].score" label-width="100" :border="false" v-model="value" label="线下培训课时：" placeholder="请输入">
              <template #input>
                <span @click="add(0)" class="add"><van-icon color="#323233" name="minus" /></span>
                <van-field
                  input-align="center"
                  style="background-color: #f5f5f5; padding: 0; width: 60px"
                  type="number"
                  v-model="formData.duration"
                />
                <span @click="add(1)" class="add"><van-icon color="#323233" name="plus" /></span>
                <span style="padding-left: 10px">课时</span>
              </template>
            </van-field>
            <van-field
              readonly
              label-width="100"
              @click="departShow = true"
              input-align="right"
              placeholder="请选择"
              :border="false"
              :disabled="!!route.query.enforceCode"
              v-model="formData.departCodeName"
              label="车间/科室："
              v-if="route.query.grade != '2' && route.query.isLast != 'true' && !route.query.enforceCode"
              :rules="[{ required: true, message: '请选择' }]"
            />
            <van-field
              :disabled="!!route.query.enforceCode"
              readonly
              @click="userShow = true"
              label-width="100"
              input-align="right"
              placeholder="请选择"
              :border="false"
              v-model="formData.trainPersonName"
              label="三级教育者："
              v-if="route.query.grade != '2' && route.query.isLast != 'true' && !route.query.enforceCode"
              :rules="[{ required: true, message: '请选择' }]"
            />
            <van-field v-if="currentItems[0].score" readonly :border="false" v-model="value" label="">
              <template #input>
                <van-radio-group v-model="checked" disabled>
                  <van-radio name="1">已完成答题教育订正</van-radio>
                </van-radio-group>
              </template>
            </van-field>
          </van-form>
        </div>
        <div class="foot">
          <van-button @click="confirmClick()" block type="primary">确认签字</van-button>
        </div>
      </div>
    </van-popup>
    <TreeSelect
      :value="formData.departCode"
      :not-tree="true"
      value-key="orgCode"
      :is-radio="true"
      title-key="departName"
      v-model:show="departShow"
      :items="departOptions"
      @change="onConfirm($event, 'depart')"
    />
    <TreeSelect
      :value="formData.trainPerson"
      :not-tree="true"
      value-key="id"
      :is-radio="true"
      title-key="realname"
      v-model:show="userShow"
      :items="userList"
      @change="onConfirm($event, 'user')"
    />
    <van-dialog v-model:show="signShow" title="签名" :before-close="signClose" @confirm="dialogConfirm" show-cancel-button>
      <Sign v-model:value="signature" />
      <div class="hint" v-show="hintShow && !signature">请签字</div>
    </van-dialog>
  </div>
</template>
<script lang="ts" setup>
  import { contentInfo, contentStatistics, confirmExam, confirmClass, getDepart3List, educatorsList } from '../../index.api';
  import TreeSelect from '../../../components/treeSelect.vue';
  import Sign from '../../../components/sign.vue';
  import { ref, nextTick, onMounted } from 'vue';
  import List from '../components/list.vue';
  import type { FormInstance } from 'vant';
  import { useRoute } from 'vue-router';
  import { router } from '/@/router';
  const route = useRoute();
  const list = ref<any[]>([]);
  const loading = ref(false);
  const total1 = ref(0);
  const listRef1 = ref();
  const checkShow = ref(false);
  const checkShowOutline = ref(false);
  const checked = ref('1');
  const userShow = ref(false);
  const formRef = ref<FormInstance | null>(null);
  const hintShow = ref(false);

  const value = ref('');

  const formData = ref<{ [key: string]: any }>({
    duration: route.query && route.query.courseConfig != 'null' ? route.query.courseConfig : 0,
    content: '', // 职务工中
    departCode: route.query && route.query.enforceCode ? route.query.enforceCode : '', // 车间科室
    trainPerson: route.query && route.query.trainPerson ? route.query.trainPerson : '', // 三级教育者
    num: 0,
  });
  const departShow = ref(false);
  const activeIdx = ref(1);
  const tabClick = (index) => { 
    activeIdx.value = index;
    onRefresh({});
  };
  const onConfirm = (e, type) => {
    if (type == 'depart') {
      console.log(e);
      formData.value.departCode = e.orgCode;
      formData.value.departCodeName = e.departName;
      geteducatorsList(formData.value.departCode);
    }
    if (type == 'user') {
      formData.value.trainPersonName = e.realname;
      formData.value.trainPerson = e.id;
    }
  };

  const confirmClick = async () => {
    await formRef.value?.validate();
    signature.value = '';
    signShow.value = true;
  };

  const add = (i) => {
    if (route.query.type == '1') return;
    if (i) {
      formData.value.duration++;
    } else {
      if (formData.value.duration == 0) {
        return;
      }
      formData.value.duration--;
    }
  };

  const batchShOW = ref(false);
  const onRefresh = async (params) => {
    const res = await getList(params).catch(() => {
      nextTick(() => {
        listRef1.value.refreshEnd();
      });
    });
    list.value = res;
    total1.value = res.length;
    list.value.forEach((item) => {
      if (item.confirm == 1) {
        batchShOW.value = true;
      }
    });
    nextTick(() => {
      listRef1.value.refreshEnd();
    });
  };
  const num = ref(0);
  const onLoad = async (params) => {
    num.value = 0;
    const res = await getList(params).catch(() => {
      nextTick(() => {
        listRef1.value.loadEnd();
      });
    });
    if (res.length > 0) {
      res.forEach((item) => {
        if (item.confirm === '1') {
          num.value++;
          batchShOW.value = true;
        }
      });
    } else {
      num.value = 0;
    }
    loading.value = false;
    list.value = [...list.value, ...res];
    total1.value = res.length;
    nextTick(() => {
      listRef1.value.loadEnd();
    });
  };

  const departOptions = ref<any[]>([]);

  function getOrg() {
    getDepart3List({
      orgCode: route.query.orgCode && route.query.orgCode.slice(0, 6),
    }).then((res) => {
      departOptions.value = res;
    });
  }

  const userList = ref<any[]>([]);
  function geteducatorsList(code) {
    educatorsList({ orgCode: code }).then((res) => {
      userList.value = res;
    });
  }
  const totalData = ref<any>({});
  onMounted(() => {
    getOrg();
    getStatistics();
    onLoad({});
  })

  function getStatistics() {
    contentStatistics({contentId: route.query.id}).then((res) => { 
      totalData.value = res;
    })
  }

  function getList(params?) {
    loading.value = true;
    return contentInfo({
      contentId: route.query.id,
      state: activeIdx.value,
      // pageNo: pageNo.value,
      // pageSize: pageSize.value,
      // ...params,
    }).finally(() => { loading.value = false });
  }
  const openDetail = () => {};

  const currentItems = ref<any[]>([]);
  const checkFn = (item) => {
    currentItems.value = [item];
    resetForm();
    if (route.query.type == '1') {
      checkShow.value = true;
    } else {
      checkShowOutline.value = true;
    }
    formData.value.num = currentItems.value.length;
  };

  const resetForm = () => {
    signature.value = '';
    formData.value = {
      duration: route.query && route.query.courseConfig != 'null' ? route.query.courseConfig : 0,
      content: '',
    };
  };

  const go = (item) => {
    router.push({
      path: '/app/teacher/studentDetail',
      query: {
        id: route.query.taskId,
        userId: item.userId,
      },
    });
  };

  const signShow = ref(false);
  const signature = ref('');
  const signClose = (s) => {
    if (s == 'confirm') return !!signature.value;
    hintShow.value = false;
    return true;
  };
  const dialogConfirm = async () => {
    if (!signature.value) {
      hintShow.value = true;
      return;
    }
    signShow.value = false;
    checkShow.value = false;
    checkShowOutline.value = false;
    let userIds = '';
    if (currentItems.value.length > 0) {
      currentItems.value.forEach((item) => {
        userIds += item.userId + ',';
      });
    }
    userIds = userIds.substring(0, userIds.length - 1);
    if (route.query.type == '1') {
      await confirmExam({
        contentId: currentItems.value[0].contentId,
        trainPerson: currentItems.value[0].trainPerson,
        userIds: userIds,
        sign: signature.value,
        content: '',
        departCode: '',
        duration: formData.value.duration,
      });
    } else {
      if (currentItems.value[0].finishCourse === null || currentItems.value[0].finishCourse === 'null') {
        await confirmClass({
          contentId: currentItems.value[0].contentId,
          trainPerson: route.query && route.query.trainPerson ? '' : formData.value.trainPerson,
          userIds: userIds,
          sign: signature.value,
          content: formData.value.content,
          departCode: route.query && route.query.enforceCode ? '' : formData.value.departCode,
          duration: formData.value.duration,
        });
      } else {
        await confirmExam({
          contentId: currentItems.value[0].contentId,
          trainPerson: currentItems.value[0].trainPerson,
          userIds: userIds,
          sign: signature.value,
          content: '',
          departCode: '',
          duration: formData.value.duration,
        });
      }
    }
    currentItems.value = [];
    onRefresh({});
    getStatistics();
  };
  const checkAll = () => {
    currentItems.value = [];
    list.value.forEach((item) => {
      if (item.confirm == 1) {
        currentItems.value.push(item);
      }
    });
    if (currentItems.value.length == 0) return;
    resetForm();
    if (route.query.type == '1') {
      checkShow.value = true;
    } else {
      checkShowOutline.value = true;
    }
    formData.value.num = currentItems.value.length;
  };
</script>
<style lang="less" scoped>
  .checkStudent {
    width: 100%;
    height: 100%;
    padding: 10px 16px;
    .hd {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      span {
        margin-left: 16px;
      }
      i{
        font-style: normal;
      }
      .active {
        color: #1890ff;
      }
    }
    .main {
      width: 100%;
      height: calc(100% - 40px);
      overflow-y: auto;
    }
    .record {
      display: flex;
      flex-direction: column;
      padding: 0 16px;
      position: relative;
      height: 100%;
      width: 100%;
    }
    .record-title {
      width: 100%;
      height: auto;
      font-size: 16px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.88);
      line-height: 16px;
      box-sizing: border-box;
      padding: 30px 20px;
      text-align: center;
    }
    .record-item {
      width: 100%;
      height: 44px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      box-sizing: border-box;
      padding-bottom: 20px;
      .left {
        width: auto;
        display: flex;
        height: 22px;
        align-items: center;
        .date {
          height: 22px;
          font-size: 14px;
          font-weight: 400;
          color: rgba(0, 0, 0, 0.88);
          line-height: 22px;
          margin-right: 40px;
        }
        .status {
          width: 70px;
          height: 22px;
          display: flex;
          align-items: center;
          font-size: 14px;
          font-weight: 400;
          color: rgba(0, 0, 0, 0.88);
          line-height: 22px;
          .error {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            margin-right: 8px;
            background: #1890ff;
          }
        }
      }
      .right {
        width: auto;
        height: 22px;
        font-size: 14px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.88);
        line-height: 22px;
      }
    }
    .add {
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 24px;
      width: 24px;
      background-color: #f5f5f5;
    }
    .foot {
      width: 90%;
      position: absolute;
      bottom: 20px;
    }
    .hint {
      font-size: 12px;
      color: #ee0a24;
      padding: 0 16px;
      text-align: center;
    }
  }
</style>
