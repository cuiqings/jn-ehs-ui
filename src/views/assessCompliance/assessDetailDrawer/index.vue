<template>
  <BasicDrawer
    :showFooter="false"
    @close="handleClose"
    @register="register"
    :footerStyle="{ display: 'flex', justifyContent: 'center', alignItems: 'center' }"
    :bodyStyle="{ background: '#eff1f5' }"
    v-bind="$attrs"
    width="100%"
  >
    <template #title>
      <div style="display: flex; align-items: center; justify-content: space-between">
        <h1 style="font-weight: 600">{{ detailInfo.assessName || '评估报告' }}</h1>
        <div>
          <a-button type="primary" :loading="downloading" @click="exportAssessment">下载评估报告</a-button>
          <a-button v-if="pageType != 'detail'" style="margin-left: 16px" @click="cleanAssessment">清空评估数据</a-button>
        </div>
      </div>
    </template>
    <div class="assessment" v-loading="loading">
      <div class="main" ref="mainRef" @scroll="scrollEvent">
        <div class="info">
          <p>最新评估时间：{{ detailInfo.assessTime }}</p>
          <p>评估人：{{ detailInfo.assessUserName }}</p>
          <p v-if="detailInfo && detailInfo.assessDesc">{{
            pageType == 'report' ? detailInfo.assessDesc.replace(/^本次/, '当前') : detailInfo.assessDesc
          }}</p>
        </div>
        <div class="btn">
          <a-radio-group v-model:value="activeKey" @change="onChange" button-style="solid">
            <a-radio-button @click="radioClick('0')" value="0">合规项</a-radio-button>
            <a-radio-button @click="radioClick('1')" value="1">不合规项</a-radio-button>
            <a-radio-button @click="radioClick('2')" value="2">不相关项</a-radio-button>
            <a-radio-button @click="radioClick('3')" v-if="pageType != 'detail'" value="3">未评估项</a-radio-button>
          </a-radio-group>
        </div>
        <a-form :model="formData" name="basic" autocomplete="off">
          <div class="content">
            <a-empty
              v-if="!detailInfo || !detailInfo.tree || detailInfo.tree.length == 0"
              description="暂无数据"
              style="position: relative; margin: 40px 20px 20px 20px"
              :image="Empty.PRESENTED_IMAGE_SIMPLE"
            />
            <div class="list" v-for="(item, fidx) in detailInfo.tree" :key="item">
              <div class="title" @click="titleClick(item, fidx)">
                <span class="open" v-show="item.open"></span>
                <span class="close" v-show="!item.open"></span>
                <h1>{{ item.name }}</h1>
                <h5>({{ item.num }})部法规</h5>
              </div>
              <div class="item" v-for="(citem, idx) in item.children" :id="'id' + citem.id" v-show="item.open">
                <div class="tit" @click="ctitleClick(citem, fidx, idx)">
                  <span class="open" v-show="citem.open"></span>
                  <span class="close" v-show="!citem.open"></span>
                  <img src="../../../assets/images/hg/b.png" alt="" />
                  <h2 @click.stop="title2Click(citem)">{{ citem.name }}</h2>
                </div>
                <div v-show="citem.open">
                  <div class="desc">
                    <p>法律效力：{{ citem.legalEffect }}</p>
                    <p>颁布部门：{{ citem.promulgatingSector }}</p>
                    <p>生效日期：{{ citem.effectiveDate }}</p>
                  </div>
                  <h3
                    >合规性审查条款（<span>{{ citem.num }}条</span>）：</h3
                  >
                  <a-table :dataSource="citem.items" :columns="columns" :pagination="false">
                    <template #bodyCell="{ column, record, index }">
                      <template v-if="column.key === 'index'">
                        {{ index + 1 }}
                      </template>
                      <template v-if="column.key === 'handle'">
                        <a-button v-if="record.assessResult != '未评估'" type="link" @click="showModal(record, citem)">详情</a-button>
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
    <DetailModal @register="registerModal" />
    <div class="homeview" v-if="isContent">
      <home-view :list-obj="listObj" :breadcrumb-text="breadcrumbText" @success="onSuccess" />
    </div>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { homeGetInfo, getReport, getJnFileManageList, exportReport, exportReportById, cleanState } from '../url/index';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import HomeView from '../../law/lawLaw/component/view.vue';
  import { useModal } from '/@/components/Modal';
  import { Modal, Empty } from 'ant-design-vue';
  import DetailModal from './modal.vue';
  import { createVNode } from 'vue';
  import dayjs from 'dayjs';
  import { ref } from 'vue';
  const activeKey = ref('');
  const loading = ref(false);
  const detailInfo = ref<any>({});
  const routerInfo = ref<any>({});
  const pageType = ref('detail');

  const [register] = useDrawerInner((data) => {
    routerInfo.value = data;
    if (data.pageType) {
      pageType.value = data.pageType;
    }
    pageInit();
  });

  const [registerModal, { openModal, closeModal }] = useModal();

  // 滚动内容
  const mainRef = ref<HTMLElement>();
  const curId = ref('');
  const curIndex = ref<number[]>([0, 0]);
  const pageSize = ref(20);
  // 更多数据列表
  const moreInfoList = ref<any>({});
  // 原始数据
  const originData = ref<any>({});
  function pageInit() {
    loading.value = true;
    if (pageType.value == 'report') {
      getReport({ type: activeKey.value })
        .then((res) => {
          if (res.tree && res.tree.length > 0) {
            originData.value = JSON.parse(JSON.stringify(res));
            res.tree.forEach((item, i) => {
              // if (item.children && item.children.length > 0) {
              //   item.children.forEach((citem, ci) => {
              //     citem.id = `${i}-${ci}`;
              //     if (citem.items && citem.items.length > pageSize.value) {
              //       moreInfoList.value[citem.id] = citem.items.splice(pageSize.value, citem.items.length - pageSize.value);
              //     }
              //   });
              // }
              if (i != 0) {
                item.children = [];
              } else {
                item.children.forEach((citem, ci) => {
                  citem.id = `${i}-${ci}`;
                  if (citem.items && citem.items.length > pageSize.value) {
                    moreInfoList.value[citem.id] = citem.items.splice(pageSize.value, citem.items.length - pageSize.value);
                  }
                });
                res.tree[0].children[0].open = true;
                curId.value = res.tree[0].children[0].id;
                res.tree[0].open = true;
              }
            });
          }

          detailInfo.value = res;
          loading.value = false;
        })
        .catch((_) => {
          detailInfo.value = {};
          loading.value = false;
        });
      return;
    }
    homeGetInfo({ id: routerInfo.value.id, type: activeKey.value })
      .then((res) => {
        if (res.tree && res.tree.length > 0) {
          res.tree.forEach((item, i) => {
            if (item.children && item.children.length > 0) {
              item.children.forEach((citem, ci) => {
                citem.id = `${i}-${ci}`;
                if (citem.items && citem.items.length > pageSize.value) {
                  moreInfoList.value[citem.id] = citem.items.splice(pageSize.value, citem.items.length - pageSize.value);
                }
              });
            }
          });
          res.tree[0].open = true;
          if (res.tree[0].children && res.tree[0].children.length > 0) {
            res.tree[0].children[0].open = true;
            curId.value = res.tree[0].children[0].id;
          }
        }
        originData.value = res;
        detailInfo.value = res;
        loading.value = false;
      })
      .catch((_) => {
        detailInfo.value = {};
        loading.value = false;
      });
  }

  const onChange = () => {
    pageInit();
  };

  const radioClick = (val) => {
    if (val == activeKey.value) {
      activeKey.value = '';
      pageInit();
    }
  };

  const titleClick = (item, idx) => {
    if(detailInfo.value.tree[idx] && detailInfo.value.tree[idx].children.length == 0){
      originData.value.tree[idx].children.forEach((val) => {
        detailInfo.value.tree[idx].children.push({...val, items: []})
      })
    }
    item.open = !item.open;
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: '120px',
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
      customCell: () => {
        return { style: { 'word-break': 'break-all' } };
      },
    },
    {
      title: '纠正措施',
      dataIndex: 'correctiveActions',
      key: 'correctiveActions',
      fixed: 'right',
      width: '160px',
      customCell: () => {
        return { style: { 'word-break': 'break-all' } };
      },
    },
    {
      title: '整改负责人',
      dataIndex: 'assessUserName',
      key: 'assessUserName',
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
    {
      title: '操作',
      dataIndex: 'handle',
      key: 'handle',
      fixed: 'right',
      width: '100px',
    },
  ];

  const formData = ref({
    name: dayjs().format('YYYY-MM-DD') + '评估',
  });

  // main 滚动事件
  const scrollEvent = (e) => {
    let mainH = e.target.clientHeight;
    let tarEl: HTMLElement | null = document.querySelector('#id' + curId.value);
    let pos = tarEl?.getBoundingClientRect();
    if (moreInfoList.value[curId.value] && moreInfoList.value[curId.value].length > 0) {
      if (pos && mainH + Math.abs(pos.top) > pos.height - 180) {
        detailInfo.value.tree[curIndex.value[0]].children[curIndex.value[1]].items.push(...moreInfoList.value[curId.value].splice(0, pageSize.value));
      }
    }
  };

  // 子级展开收起
  const ctitleClick = (item, i, ci) => {
    curId.value = item.id;
    curIndex.value = [i, ci];
    if(detailInfo.value.tree[i].children[ci].items.length <= 0){
      detailInfo.value.tree[i].children[ci].items = originData.value.tree[i].children[ci].items
    }
    detailInfo.value.tree[i].children[ci].open = !detailInfo.value.tree[i].children[ci].open;
  };

  const emit = defineEmits(['close']);
  const handleClose = () => {
    closeModal();
    emit('close');
    isContent.value = false;
    pageType.value = 'detail';
    activeKey.value = '';
    detailInfo.value = {};
    curId.value = '';
    curIndex.value = [0, 0];
  };

  const cleanAssessment = () => {
    Modal.confirm({
      title: '提示',
      content: createVNode(
        'div',
        { style: 'color:red;' },
        '清空评估数据，将把所有项目的合规性恢复为未评估，但不影响已经保存的评估报告，确定清空评估数据？'
      ),
      onOk() {
        Modal.confirm({
          title: '提示',
          content: '确定进行清空操作？',
          onOk() {
            return new Promise((reslove, rej) => {
              cleanState()
                .then((r) => {
                  reslove(true);
                  // activeKey.value = '';
                  pageInit();
                })
                .catch((_) => {
                  rej();
                });
            });
          },
        });
      },
    });
  };
  const downloading = ref(false);
  const exportAssessment = async () => {
    downloading.value = true;
    let res: any = null;
    if (pageType.value == 'detail') {
      res = await exportReportById(routerInfo.value.id).catch((_) => (downloading.value = false));
    } else {
      res = await exportReport().catch((_) => (downloading.value = false));
    }
    downloading.value = false;
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `评估报告${dayjs().format('YYYYMMDD')}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const showModal = (record, citem) => {
    openModal(true, { ...record, wid: routerInfo.value.id, pageType: pageType.value });
  };
  const listObj = ref({});
  const breadcrumbText = ref('');
  const isContent = ref(false);
  const title2Click = (item) => {
    getJnFileManageList({
      pageNo: 1,
      pageSize: 10,
      fileContent: '',
      fileName: item.name,
    }).then((res) => {
      if (res && res.records && res.records.length > 0) {
        listObj.value = res.records[0];
        breadcrumbText.value = item.name;
        isContent.value = true;
      }
    });
  };
  const onSuccess = () => {
    isContent.value = false;
    console.log('onSuccess');
  };
</script>
<style lang="less" scoped>
  .homeview {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    z-index: 999;
    background: #fff;
  }
  h1,
  h2,
  h5 {
    padding: 0;
    margin: 0;
  }

  .assessment {
    width: 100%;
    height: 100%;
    background-color: #eff1f5;
    overflow: hidden;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    // padding: 10px 16px;
    .hd {
      background-color: #ffffff;
      padding: 16px;
      margin-bottom: 16px;
    }

    .main {
      background-color: #ffffff;
      width: 100%;
      height: 100%;
      overflow-y: auto;
      padding: 10px 16px;
      border-radius: 4px 4px 4px 4px;
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
            h2 {
              font-size: 16px;
              color: rgba(0, 0, 0, 0.87);
              padding-left: 10px;
              color: #1890ff;
              cursor: pointer;
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
      cursor: pointer;
      border-left: 2px solid #3e87f8;
      border-top: 2px solid #3e87f8;
      transform: rotate(45deg) translateY(3px);
      transform-origin: 50% 50%;
    }

    .close {
      width: 10px;
      height: 10px;
      cursor: pointer;
      border-left: 2px solid #3e87f8;
      border-bottom: 2px solid #3e87f8;
      transform: rotate(-45deg) translateY(-3px);
      transform-origin: 50% 50%;
    }
    .null {
      font-size: 18px;
      color: #9d9d9d;
      padding: 50px;
      text-align: center;
    }
  }
</style>
