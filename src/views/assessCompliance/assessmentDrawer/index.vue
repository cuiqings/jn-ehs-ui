<template>
  <BasicDrawer
    showFooter
    @register="register"
    :footerStyle="{ display: 'flex', justifyContent: 'center', alignItems: 'center' }"
    :bodyStyle="{ background: '#eff1f5' }"
    v-bind="$attrs"
    :title="title"
    width="100%"
    @close="handleClose"
  >
    <div class="assessment" v-loading="loading">
      <div class="hd">
        <a-form layout="inline" :modal="queryParams" ref="formRef" :labelCol="{ span: 5 }" :wrapperCol="{ span: 19 }" name="custom-validation">
          <a-row style="width: 100%">
            <a-col span="5">
              <a-form-item label="法规名称" name="keyword">
                <a-input placeholder="请输入" v-model:value="queryParams.name" type="text" />
              </a-form-item>
            </a-col>
            <a-col span="5">
              <a-form-item label="颁布部门" name="keyword">
                <a-input placeholder="请输入" v-model:value="queryParams.promulgatingSector" type="text" />
              </a-form-item>
            </a-col>
            <a-col span="5">
              <a-form-item label="生效日期" name="keyword">
                <a-range-picker valueFormat="YYYY-MM-DD" format="YYYY-MM-DD" v-model:value="queryParams.time" />
              </a-form-item>
            </a-col>
            <a-col span="5">
              <a-form-item :wrapper-col="{ span: 24 }">
                <a-button type="primary" @click="search">查询</a-button>
                <a-button style="margin-left: 10px" @click="resetForm">重置</a-button>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <div class="main" @scroll="scrollEvent" ref="mainRef">
        <a-form ref="formRef2" :model="formData" name="basic" autocomplete="off">
          <div class="name">
            <a-form-item
              :rules="[{ required: true, message: '评估主题不能为空' }]"
              style="margin-bottom: 0"
              :label-col="{ span: 1 }"
              :wrapper-col="{ span: 6 }"
              label="评估主题："
              name="name"
            >
              <a-input :readonly="handleType != 'add'" :maxlength="50" v-model:value="formData.name" />
            </a-form-item>
          </div>
          <div class="content">
            <div class="list" v-for="(item, fidx) in treeData" :key="item.name">
              <div class="title" @click="titleClick(item)">
                <span class="open" v-show="item.open"></span>
                <span class="close" v-show="!item.open"></span>
                <h1>{{ item.name }}</h1>
                <h5>({{ item.num }})部法规</h5>
              </div>
              <div class="item" v-for="(citem, idx) in item.children" :key="citem.name" v-if="item.open" :id="'id' + citem.id">
                <div class="tit" @click="($event) => ctitleClick($event, citem, fidx, idx)">
                  <span class="open" v-show="citem.open"></span>
                  <span class="close" v-show="!citem.open"></span>
                  <img src="../../../assets/images/hg/b.png" alt="" />
                  <h2>{{ citem.name }}</h2>
                </div>
                <div v-show="citem.open">
                  <div class="desc">
                    <p>法律效力：{{ citem.legalEffect }}</p>
                    <p>颁布部门：{{ citem.promulgatingSector }}</p>
                    <p>生效日期：{{ citem.effectiveDate }}</p>
                  </div>
                  <h3
                    >合规性审查条款（<span>{{ citem.totalCount }}条</span>）：</h3
                  >
                  <a-table :dataSource="citem.infoList" :columns="columns" :pagination="false">
                    <template #bodyCell="{ column, record, index }">
                      <template v-if="column.key === 'index'">{{ index + 1 }}</template>
                      <template v-if="column.key === 'assessResult'">
                        <a-form-item>
                          <a-radio-group
                            :disabled="handleType == 'edit'"
                            @change="onChange($event, record.assessResult, fidx, idx, index)"
                            :value="record.assessResult"
                          >
                            <a-radio :value="'0'">合规</a-radio>
                            <a-radio :value="'1'">不合规</a-radio>
                            <a-radio :value="'2'">不相关</a-radio>
                          </a-radio-group>
                        </a-form-item>
                      </template>
                      <template v-if="column.key === 'notComplianceDesc'">
                        <a-form-item>
                          <a-input :disabled="handleType == 'edit'" :maxlength="100" placeholder="请输入" v-model:value="record.notComplianceDesc" />
                        </a-form-item>
                      </template>
                      <template v-if="column.key === 'correctiveActions'">
                        <a-form-item>
                          <a-input :disabled="handleType == 'edit'" :maxlength="100" placeholder="请输入" v-model:value="record.correctiveActions" />
                        </a-form-item>
                      </template>

                      <template v-if="column.key === 'assessUser'">
                        <a-form-item>
                          <a-select
                            :disabled="handleType == 'edit'"
                            show-search
                            :options="allUser"
                            :filter-option="filterOption"
                            :fieldNames="{ label: 'title', value: 'id' }"
                            @change="(v, o) => handleChange(o, fidx, idx, index)"
                            :getPopupContainer="getPopupContainer"
                            v-model:value="record.assessUser"
                            placeholder="请选择"
                          >
                          </a-select>
                        </a-form-item>
                      </template>

                      <template v-if="column.key === 'finishTime'">
                        <a-form-item>
                          <a-date-picker
                            :disabled="handleType == 'edit'"
                            valueFormat="YYYY-MM-DD"
                            format="YYYY-MM-DD"
                            v-model:value="record.finishTime"
                            :disabled-date="disabledDate"
                          />
                        </a-form-item>
                      </template>
                    </template>
                  </a-table>
                </div>
              </div>
            </div>
          </div>
        </a-form>
      </div>
    </div>
    <template #footer>
      <a-button :loading="submiting" v-if="handleType == 'add'" type="primary" @click="submitWithThrottle">提交</a-button>
      <a-button v-if="handleType == 'edit'" type="primary" @click="resetAssess">重新评估</a-button>
      <a-button :loading="submiting" style="margin-left: 10px" @click="closeDrawer">取消</a-button>
    </template>
  </BasicDrawer>
  <EditDialog @ok="dialogOk" @register="registerDialog" />
</template>
<script lang="ts" setup>
  import dayjs, { Dayjs } from 'dayjs';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { ref, nextTick } from 'vue';
  import { getName, homeGetTree, getStatuteInfo, getAllUser, assess } from '../url/index';
  import EditDialog from './editDialog.vue';
  import { useModal } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import type { FormInstance } from 'ant-design-vue';

  const { createMessage: $message } = useMessage();

  // 滚动内容
  const mainRef = ref<HTMLElement>();
  const curId = ref('');
  const curIndex = ref<number[]>([0, 0]);
  const pageSize = ref(20);
  const loading = ref(false);
  const getPopupContainer = () => document.body;

  const submiting = ref(false);
  const title = ref('合规性评估');
  const allUser = ref<any>([]);
  const queryParams = ref({
    name: '',
    promulgatingSector: '',
    time: [],
    strTime: '',
    endTime: '',
    type: 0,
  });
  const handleType = ref('add');
  const handleStatus = ref('');
  const emit = defineEmits(['close']);

  const [register, { closeDrawer }] = useDrawerInner((data) => {
    handleType.value = data.type;
    handleStatus.value = data.status;
    queryParams.value.type = data.status;
    if (data.title) {
      title.value = data.title;
    }
    pageInit();
  });
  // 不合规变合规弹窗
  const [registerDialog, { openModal, closeModal }] = useModal();

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: '100px',
    },
    {
      title: '适用性',
      dataIndex: 'applicability',
      key: 'applicability',
      width: '120px',
    },
    {
      title: '条款及内容',
      dataIndex: 'content',
      key: 'content',
      width: '380px',
    },
    {
      title: '条款摘要',
      dataIndex: 'enterpriseImplementation',
      key: 'enterpriseImplementation',
      width: '200px',
    },
    {
      title: '合规性',
      dataIndex: 'assessResult',
      key: 'assessResult',
      fixed: 'right',
      width: '120px',
    },
    {
      title: '不合规说明',
      dataIndex: 'notComplianceDesc',
      key: 'notComplianceDesc',
      fixed: 'right',
      width: '160px',
    },
    {
      title: '纠正措施',
      dataIndex: 'correctiveActions',
      key: 'correctiveActions',
      fixed: 'right',
      width: '160px',
    },
    {
      title: '整改负责人',
      dataIndex: 'assessUser',
      key: 'assessUser',
      fixed: 'right',
      width: '120px',
    },
    {
      title: '整改完成期限',
      dataIndex: 'finishTime',
      key: 'finishTime',
      fixed: 'right',
      width: '120px',
    },
  ];

  const treeData = ref<any[]>([]);
  const originTreeData = ref<any[]>([]);
  function pageInit() {
    getName({}).then((res) => {
      formData.value.name = res;
    });
    getTreeData();
    getAllUser().then((res) => {
      allUser.value = res;
    });
  }

  const search = () => {
    queryParams.value.strTime = queryParams.value.time[0];
    queryParams.value.endTime = queryParams.value.time[1];
    getTreeData();
  };
  const resetForm = () => {
    queryParams.value.name = '';
    queryParams.value.time = [];
    queryParams.value.strTime = '';
    queryParams.value.endTime = '';
    queryParams.value.promulgatingSector = '';
    getTreeData();
  };

  // 更多数据列表
  const moreInfoList = ref<any>({});
  const getTreeData = () => {
    homeGetTree(queryParams.value).then(async (res) => {
      res.forEach((item) => {
        item.open = false;
        if (item.children) {
          item.children.forEach((citem) => {
            citem.open = false;
          });
        }
      });
      if (res && res.length > 0 && res[0].children && res[0].children.length > 0) {
        res[0].open = true;
        let more = [];
        const cres = await getStatuteInfo({ id: res[0].children[0].id, type: handleStatus.value });
        curId.value = res[0].children[0].id;
        if (cres.infoList && cres.infoList.length > pageSize.value) {
          more = cres.infoList.splice(pageSize.value, cres.infoList.length - pageSize.value);
        }
        moreInfoList.value[res[0].children[0].id] = more;
        res[0].children[0] = { ...res[0].children[0], ...cres };
        loading.value = false;
        res[0].children[0].open = true;
      }
      treeData.value = res;
      originTreeData.value = JSON.parse(JSON.stringify(res));
    });
  };

  // main 滚动事件
  const scrollEvent = (e) => {
    let mainH = e.target.clientHeight;
    let tarEl: HTMLElement | null = document.querySelector('#id' + curId.value);
    let pos = tarEl?.getBoundingClientRect();

    if (moreInfoList.value[curId.value] && moreInfoList.value[curId.value].length > 0) {
      if (pos && mainH + Math.abs(pos.top) > pos.height - 180) {
        console.log('load more----+++++++++++');
        treeData.value[curIndex.value[0]].children[curIndex.value[1]].infoList.push(...moreInfoList.value[curId.value].splice(0, pageSize.value));
      }
    }
  };

  // 父级展开收起
  const titleClick = (item) => {
    item.open = !item.open;
  };
  // 子级展开收起
  const ctitleClick = (e, item, i, ci) => {
    // 点击之前判断上一个是否全部添加完成 否则一次性添加
    if (moreInfoList.value[curId.value] && moreInfoList.value[curId.value].length > 0) {
      treeData.value[curIndex.value[0]].children[curIndex.value[1]].infoList.push(...moreInfoList.value[curId.value]);
    }
    if (treeData.value[i].children[ci].infoList && treeData.value[i].children[ci].infoList.length > 0) {
      treeData.value[i].children[ci].open = !treeData.value[i].children[ci].open;
      return;
    }
    if (treeData.value[i].children[ci].open) {
      treeData.value[i].children[ci].open = false;
      return;
    }
    loading.value = true;
    curIndex.value = [i, ci];
    curId.value = item.id;
    getStatuteInfo({ id: item.id, type: handleStatus.value }).then((res) => {
      if (res && res.infoList && res.infoList.length > pageSize.value) {
        moreInfoList.value[curId.value] = res.infoList.splice(pageSize.value, res.infoList.length - pageSize.value);
      }
      treeData.value[i].children[ci] = { ...item, ...res };
      originTreeData.value[i].children[ci] = { ...item, ...JSON.parse(JSON.stringify(res)) };
      treeData.value[i].children[ci].open = !treeData.value[i].children[ci].open;
      loading.value = false;
    });
  };

  const filterOption = (input: string, option: any) => {
    return option.title.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  // 重新评估
  const resetAssess = () => {
    handleType.value = 'add';
  };

  // 当前操作obj
  const cI = ref<any>({});
  const onChange = (e, item, fi, ci, i) => {
    cI.value = { e, item, fi, ci, i };
    if (e.target.value == '0' && item == 1) {
      console.log('tankuang');
      openModal(true, {});
    } else {
      treeData.value[fi].children[ci].infoList[i].assessResult = e.target.value;
    }
  };

  // 不合规变合规 重置内容
  const dialogOk = (data) => {
    closeModal();
    Object.assign(treeData.value[cI.value.fi].children[cI.value.ci].infoList[cI.value.i], data);
    treeData.value[cI.value.fi].children[cI.value.ci].infoList[cI.value.i].assessResult = '0';
    treeData.value[cI.value.fi].children[cI.value.ci].infoList[cI.value.i].correctiveActions = null;
    treeData.value[cI.value.fi].children[cI.value.ci].infoList[cI.value.i].notComplianceDesc = null;
    treeData.value[cI.value.fi].children[cI.value.ci].infoList[cI.value.i].assessUser = null;
    treeData.value[cI.value.fi].children[cI.value.ci].infoList[cI.value.i].finishTime = null;
  };

  const formRef = ref<FormInstance>();
  const formRef2 = ref<FormInstance>();

  const submit = () => {
    if (submiting.value) return;
    formRef2.value
      ?.validate()
      .then(() => {
        let params: any = { type: handleType.value == 'add' ? '0' : '1', name: formData.value.name, assessList: [] };
        treeData.value.forEach((item, fi) => {
          if (item.children) {
            item.children.forEach((citem, ci) => {
              if (citem.infoList) {
                citem.infoList.forEach((val, i) => {
                  if (val.assessResult && val.assessResult != originTreeData.value[fi].children[ci].infoList[i].assessResult) {
                    params.assessList.push(val);
                  }
                });
              }
            });
          }
        });
        if (params.assessList.length == 0 && !submiting.value) {
          submiting.value = false;
          $message.warn('请先评估');
          return;
        }
        submiting.value = true;
        assess(params)
          .then((res) => {
            submiting.value = false;
            resetPageStatus();
          })
          .catch((_) => (submiting.value = false));
      })
      .catch((_) => (submiting.value = false));
  };

  const submitWithThrottle = throttle(submit, 300)
  function throttle(func, delay) {
    let lastExecutionTime = 0; // 上次执行时间
    return function (...args) {
      const now = new Date().getTime(); // 当前时间
      // 如果当前时间距离上次执行时间超过了延迟时间，则执行函数
      if (now - lastExecutionTime >= delay) {
        func.apply(this, args); // 执行原函数，并传递参数
        lastExecutionTime = now; // 更新上次执行时间为当前时间
      }
    };
  }

  const handleChange = (e, fi, ci, i) => {
    treeData.value[fi].children[ci].infoList[i].assessUserName = e.title;
  };

  // 禁用日期
  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
  };

  // 发送事件刷新列表
  const handleClose = (key: string) => {
    resetPageStatus();
  };
  const resetPageStatus = () => {
    emit('close');
    title.value = '合规性评估';
    handleType.value = 'add';
    handleStatus.value = '';
    treeData.value = [];
    closeDrawer();
    queryParams.value.name = '';
    queryParams.value.time = [];
    queryParams.value.strTime = '';
    queryParams.value.endTime = '';
    queryParams.value.promulgatingSector = '';
    curId.value = '';
    curIndex.value = [0, 0];
    moreInfoList.value = [];
  };

  const formData = ref({
    name: dayjs().format('YYYY-MM-DD') + '评估',
  });
</script>

<style lang="less" scoped>
  h1,
  h2,
  h5 {
    padding: 0;
    margin: 0;
  }
  .assessment {
    width: 100%;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: #eff1f5;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .hd {
      background-color: #ffffff;
      padding: 16px;
      margin-bottom: 16px;
    }
    .main {
      flex: 1;
      background-color: #ffffff;
      width: 100%;
      padding: 10px 16px;
      border-radius: 4px 4px 4px 4px;
      overflow-y: auto;
    }
    .content {
      .list {
        padding: 16px 0;
        padding-bottom: 0;
        .title {
          height: 48px;
          line-height: 48px;
          background: #f5f8fb;
          display: flex;
          align-items: center;
          padding: 0 16px;
          h1 {
            padding-left: 5px;
            font-size: 18px;
            color: #000000;
          }
          h5 {
            font-size: 14px;
            color: #f43328;
            line-height: 14px;
            text-stroke: 1px rgba(0, 0, 0, 0);
            margin-left: 10px;
          }
        }
        .item {
          width: 100%;
          .tit {
            display: flex;
            align-items: center;
            height: 70px;
            line-height: 70px;
            padding: 0 16px;
            padding-left: 16px;
            h2 {
              font-size: 16px;
              color: rgba(0, 0, 0, 0.87);
              padding-left: 10px;
            }
            img {
              width: 24px;
              height: 24px;
              margin-left: 10px;
            }
          }
          .desc {
            padding: 0 16px;
          }
          h3 {
            font-size: 18px;
            padding: 0 16px;
            span {
              color: #f43328;
            }
          }
        }
      }
    }
    .open {
      width: 10px;
      height: 10px;
      border-left: 2px solid #3e87f8;
      border-top: 2px solid #3e87f8;
      transform: rotate(45deg) translateY(3px);
      transform-origin: 50% 50%;
    }
    .close {
      width: 10px;
      height: 10px;
      border-left: 2px solid #3e87f8;
      border-bottom: 2px solid #3e87f8;
      transform: rotate(-45deg) translateY(-3px);
      transform-origin: 50% 50%;
    }
  }
</style>
