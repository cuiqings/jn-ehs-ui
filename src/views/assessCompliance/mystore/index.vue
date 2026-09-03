<template>
  <div class="lawstore">
    <div class="left" :class="{ 'left-hide': !leftShow }">
      <div class="hd">
        <span v-show="leftShow">我的合规库</span>
        <MenuFoldOutlined :style="{ fontSize: '21px' }" @click="leftShow = false" v-show="leftShow" />
        <MenuUnfoldOutlined :style="{ fontSize: '21px' }" @click="leftShow = true" v-show="!leftShow" />
      </div>
      <div class="list" v-show="leftShow">
        <!-- <div class="item" v-for="(item, index) in 6">
          <div class="tit">综合管理类</div>
          <ul>
            <li>大姐夫砥砺奋进啊富家大室句if几艘飞机哦啊后付i然后给i热加工反季节饿哦if今晚i哦额飞机我i额发</li>
            <li>大姐夫砥砺奋进啊富家大室句if几艘飞机哦啊后付i然后给i热加工反季节饿哦if今晚i哦额飞机我i额发</li>
            <li>大幅度讽德诵功水电费</li>
            <li>大法师大哥发的</li>
            <li>辅导费大概</li>
          </ul>
        </div> -->
        <a-collapse v-model:activeKey="activeKey" :bordered="false">
          <a-collapse-panel :key="index" v-for="(item, index) in treeData">
            <template #header
              ><h1 class="tit">{{ item.label }}</h1></template
            >
            <ul>
              <li @click="citemClick(citem)" v-for="citem in item.children" :class="{ active: citem.id === curItem.id }">{{ citem.label }}</li>
            </ul>
          </a-collapse-panel>
        </a-collapse>
      </div>
    </div>
    <div class="right">
      <div class="hd">
        <a-form style="width: 100%" ref="formRef" :labelCol="{ span: 5 }" :wrapperCol="{ span: 19 }" name="custom-validation">
          <a-row :gutter="24">
            <a-col span="6">
              <a-form-item label="关键字" name="keyword">
                <a-input placeholder="请输入" v-model:value="queryParams.keyValue" type="text" />
              </a-form-item>
            </a-col>
            <a-col span="6">
              <a-form-item label="适用性" name="keyword">
                <a-select v-model:value="queryParams.applicability" @change="handleChange" placeholder="请选择" mode="multiple">
                  <a-select-option value="严格执行">严格执行</a-select-option>
                  <a-select-option value="了解">了解</a-select-option>
                  <a-select-option value="不相关">不相关</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col span="6">
              <a-form-item :wrapper-col="{ span: 24 }">
                <a-button type="primary" @click="search">查询</a-button>
                <a-button style="margin-left: 10px" @click="resetForm">重置</a-button>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <div class="main">
        <div class="top">
          <table>
            <tr>
              <td style="width: 10%; background-color: #eff1f5">法规名称</td>
              <td style="width: 40%">{{ detailInfo.statuteName }}</td>
              <td style="width: 10%; background-color: #eff1f5">地区</td>
              <td style="width: 40%">{{ detailInfo.region }}</td>
            </tr>
            <tr>
              <td style="width: 10%; background-color: #eff1f5">法律效力</td>
              <td style="width: 40%">{{ detailInfo.legalEffect }}</td>
              <td style="width: 10%; background-color: #eff1f5">文号/标准号</td>
              <td style="width: 40%">{{ detailInfo.docNumber }}</td>
            </tr>
            <tr>
              <td style="width: 10%; background-color: #eff1f5">颁布部门</td>
              <td style="width: 40%">{{ detailInfo.promulgatingSector }}</td>
              <td style="width: 10%; background-color: #eff1f5"></td>
              <td style="width: 40%"></td>
            </tr>
            <tr>
              <td style="width: 10%; background-color: #eff1f5">颁布日期</td>
              <td style="width: 40%">{{ detailInfo.issuedDate }}</td>
              <td style="width: 10%; background-color: #eff1f5">生效日期</td>
              <td style="width: 40%">{{ detailInfo.effectiveDate }}</td>
            </tr>
          </table>
        </div>
        <div class="bottom" ref="bottomRef">
          <a-table
            v-if="bottomRef"
            width="100%"
            :scroll="{ x: 800, y: bottomRef.clientHeight - 90 }"
            :columns="columns"
            :pagination="false"
            :data-source="detailInfo.infoList"
          >
          <template #bodyCell="{ column, record }">
            <template  v-if="column.key === 'action'">
              <a-button @click="change(record)" type="link">更改适用性</a-button>
            </template>
          </template>
          </a-table>
        </div>
      </div>
    </div>
  </div>
  <a-modal @cancel="close" v-model:visible="openChange" title="更改适用性" @ok="handleOk">
      <a-form :label-col="{ span: 5 }" ref="formRef" :model="formData"
      :wrapper-col="{ span: 16 }">
        <a-form-item :rules="[{required: true, message: '请选择适用性'}]" label="适用性" name="applicability" style="margin: 30px 0 50px 0;">
          <a-select v-model:value="formData.applicability" placeholder="请选择">
            <a-select-option value="严格执行">严格执行</a-select-option>
            <a-select-option value="了解">了解</a-select-option>
            <a-select-option value="不相关">不相关</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
</template>
<script lang="ts" setup>
  import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue';
  import { myGetTree, myGetInfo, changeApplicability } from '../url/index';
  import { ref } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  
  const leftShow = ref(true);
  const bottomRef = ref(null);
  const activeKey = ref('');
  const queryParams = ref({
    keyValue: '',
    applicability: ['严格执行', '了解'],
  });
  const formData = ref<any>({
    applicability: undefined
  });
  const openChange = ref(false);
  const search = () => {
    getDetail(curItem.value.id);
  };
  const resetForm = () => {
    queryParams.value.keyValue = '';
    queryParams.value.applicability = ['严格执行', '了解'];
    search();
  };
  const columns = [
    {
      title: '适用性',
      dataIndex: 'applicability',
      key: 'applicability',
      fixed: 'left',
      width: 120,
    },
    {
      title: '条款及内容',
      dataIndex: 'content',
      key: 'content',
      width: 400,
      fixed: 'left',
    },
    {
      title: '企业实施情况',
      dataIndex: 'enterpriseImplementation',
      key: 'enterpriseImplementation',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 100,
    },
  ];
  const detailInfo = ref<any>({});

  const curFormItem = ref<any>({});
  const change = (record) => {
    openChange.value = true;
    curFormItem.value = record;
    formData.value.applicability = record.applicability;
  };
  const formRef = ref<FormInstance|null>(null)
  const handleOk = async () => {
    await formRef.value?.validate()
    changeApplicability({ id: curFormItem.value.id, applicability: formData.value.applicability }).then((res) => {
      openChange.value = false;
      formData.value.applicability = undefined;
      getDetail(curItem.value.id);
    });
  };
  const close = () => {
    formData.value.applicability = undefined;
    formRef.value?.clearValidate();
  }

  pageInit();
  const treeData = ref<any>([]);
  const curItem = ref<any>({});
  function pageInit() {
    myGetTree({}).then((res) => {
      console.log(res);
      treeData.value = res;
      if (treeData.value && treeData.value.length && treeData.value[0].children.length) {
        getDetail(treeData.value[0].children[0].id);
        curItem.value = treeData.value[0].children[0];
      }
    });
  }

  const citemClick = (item: any) => {
    curItem.value = item;
    getDetail(item.id);
  };
  const loading = ref(false);
  const getDetail = (id: string) => {
    loading.value = true;
    let params: any = { id: id, ...queryParams.value };
    params.applicability = params.applicability.join(',');
    myGetInfo(params).then((res) => {
      detailInfo.value = res;
      loading.value = false;
    });
  };
</script>
<style lang="less" scoped>
  .lawstore {
    width: 100%;
    height: calc(100vh - 98px);
    background-color: #eff1f5;
    padding: 16px;
    display: flex;
    overflow: hidden;
    .left {
      width: 320px;
      height: 100%;
      padding: 0 16px;
      background-color: #ffffff;
      border-radius: 4px 4px 4px 4px;
      display: flex;
      flex-direction: column;
      .hd {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        span {
          font-size: 18px;
          font-weight: bold;
        }
        padding: 16px 0;
      }
      .list {
        flex: 1;
        overflow-y: auto;
        padding: 16px 0;
        .item {
          .tit {
            font-size: 16px;
            font-weight: 600;
          }
          ul {
            padding: 0 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            list-style: square inside !important;
            li {
              padding: 5px 0;
            }
          }
        }
        .tit {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }
        ul {
          padding: 0 0px;
          list-style: square inside !important;
          li {
            padding: 5px 10px;
          }
          li:hover {
            background-color: #e3f1fe;
            color: #222222;
          }
          .active {
            background-color: #1890ff;
            color: #ffffff;
          }
          .active:hover {
            background-color: #1890ff;
            color: #ffffff;
          }
        }
        .item:last-child {
          ul {
            border: none;
          }
        }
      }
    }
    .left-hide {
      width: 32px;
      padding: 0;
      transition: all 0.3s;
      .hd {
        justify-content: center;
      }
    }
    .right {
      flex: 1;
      overflow: hidden;
      margin-left: 10px;
      background-color: #ffffff;
      border-radius: 4px 4px 4px 4px;
      display: flex;
      flex-direction: column;
      .hd {
        height: 64px;
        padding: 16px 0;
      }
      .main {
        display: flex;
        flex-direction: column;
        padding: 0 16px;
        flex: 1;
        overflow: hidden;
        .top {
          height: 160px;
          table {
            width: 100%;
            text-align: center;
            border: 1px solid #d9d9d9;
            border-collapse: collapse;
            td {
              border: 1px solid #d9d9d9;
              text-align: center;
              height: 38px;
            }
          }
        }
        .bottom {
          flex: 1;
          width: 100%;
          overflow: hidden;
        }
      }
    }
  }
</style>
