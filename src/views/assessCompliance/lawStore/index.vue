<template>
  <div class="lawstore">
    <div class="left" :class="{ 'left-hide': !leftShow }">
      <div class="hd">
        <a-upload
          v-show="leftShow"
          name="file"
          :show-upload-list="false"
          accept=".xlsx,.xls"
          :customRequest="customRequest"
          :fileList="fileList"
        >
          <a-button :loading="uplaoding" type="primary"> 导入 </a-button>
        </a-upload>
        <!-- <span v-show="leftShow">合规总库</span> -->
        <MenuFoldOutlined :style="{ fontSize: '21px' }" @click="leftShow = false" v-show="leftShow" />
        <MenuUnfoldOutlined :style="{ fontSize: '21px' }" @click="leftShow = true" v-show="!leftShow" />
      </div>
      <div class="list" v-show="leftShow">
        <!-- <div class="item" v-for="(item, index) in treeData">
          <div class="tit">{{ item.label }}</div>
          <ul>
            <li @click="citemClick(citem)" v-for="citem in item.children" :class="{ active: citem.id === curItem.id }">{{ citem.label }}</li>
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
    <div class="right" v-loading="loading">
      <div class="hd">
        <a-form ref="formRef" :labelCol="{ span: 5 }" name="custom-validation">
          <a-row :gutter="24">
            <a-col :span="6">
              <a-form-item label="关键字" name="keyword">
                <a-input placeholder="请输入" v-model:value="queryParams.keyword" type="text" />
              </a-form-item>
            </a-col>
            <a-col :span="6">
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
            :scroll="{ x: 1300, y: bottomRef.clientHeight - 90 }"
            :columns="columns"
            :pagination="false"
            :data-source="detailInfo.infoList"
          >
            <!-- <template #action>
              <a-button type="link">编辑</a-button>
              <a-button type="link" danger>删除</a-button>
            </template> -->
          </a-table>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue';
  import { getTree, getInfo, uploadUrl } from '../url/index';
  import { getToken } from '/@/utils/auth';
  import axios from 'axios';
  import { ref } from 'vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  const { createMessage } = useMessage();

  const loading = ref(false);
  const leftShow = ref(true);
  const bottomRef = ref(null);
  const activeKey = ref('');
  const queryParams = ref({
    keyword: '',
  });
  const uplaoding = ref(false);
  const search = () => {
    getDetail(curItem.value.id);
  };
  const resetForm = () => {
    queryParams.value.keyword = '';
    getDetail(curItem.value.id);
  };
  const fileList = ref<any[]>([]);

  const columns = [
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
      title: '行业（严格执行）',
      key: 'industryOne',
      dataIndex: 'industryOne',
      width: 120,
    },
    {
      title: '行业（了解）',
      key: 'industryTwo',
      dataIndex: 'industryTwo',
      width: 120,
    },
    {
      title: '制造业（严格执行）',
      dataIndex: 'manufacturingOne',
      key: 'manufacturingOne',
      width: 120,
    },
    {
      title: '制造业（了解）',
      dataIndex: 'manufacturingTwo',
      key: 'manufacturingTwo',
      width: 120,
    },
    {
      title: '车间类型（严格执行）',
      dataIndex: 'workshopOne',
      key: 'workshopOne',
      width: 120,
    },
    {
      title: '车间类型（了解）',
      dataIndex: 'workshopTwo',
      key: 'workshopTwo',
      width: 120,
    },
    {
      title: '仓库类型（严格执行）',
      dataIndex: 'warehouseOne',
      key: 'warehouseOne',
      width: 120,
    },
    {
      title: '仓库类型（了解）',
      dataIndex: 'warehouseTwo',
      key: 'warehouseTwo',
      width: 120,
    },
    {
      title: '特种设备（严格执行）',
      dataIndex: 'specialEquipmentOne',
      key: 'specialEquipmentOne',
      width: 120,
    },
    {
      title: '特种设备（了解）',
      dataIndex: 'specialEquipmentTwo',
      key: 'specialEquipmentTwo',
      width: 120,
    },
    {
      title: '特种作业（严格执行）',
      dataIndex: 'specialWorkOne',
      key: 'specialWorkOne',
      width: 120,
    },
    {
      title: '特种作业（了解）',
      dataIndex: 'specialWorkTwo',
      key: 'specialWorkTwo',
      width: 120,
    },
    {
      title: '易制毒化学品（严格执行）',
      dataIndex: 'precursorChemicalsOne',
      key: 'precursorChemicalsOne',
      width: 120,
    },
    {
      title: '易制毒化学品（了解）',
      dataIndex: 'precursorChemicalsTwo',
      key: 'precursorChemicalsTwo',
      width: 120,
    },
    {
      title: '化学品（严格执行）',
      dataIndex: 'chemicalsOne',
      key: 'chemicalsOne',
      width: 120,
    },
    {
      title: '化学品（了解）',
      dataIndex: 'chemicalsTwo',
      key: 'chemicalsTwo',
      width: 120,
    },
    {
      title: '废气（严格执行）',
      dataIndex: 'wasteGasesOne',
      key: 'wasteGasesOne',
      width: 120,
    },
    {
      title: '废气（了解）',
      dataIndex: 'wasteGasesTwo',
      key: 'wasteGasesTwo',
      width: 120,
    },
    {
      title: '废弃物（严格执行）',
      dataIndex: 'castoffOne',
      key: 'castoffOne',
      width: 120,
    },
    {
      title: '废弃物（了解）',
      dataIndex: 'castoffTwo',
      key: 'castoffTwo',
      width: 120,
    },
    {
      title: '职业病危害因素（严格执行）',
      dataIndex: 'occupationalDiseaseHazardsOne',
      key: 'occupationalDiseaseHazardsOne',
      width: 140,
    },
    {
      title: '职业病危害因素（了解）',
      dataIndex: 'occupationalDiseaseHazardsTwo',
      key: 'occupationalDiseaseHazardsTwo',
      width: 140,
    },
    // {
    //   title: '操作',
    //   key: 'action',
    //   fixed: 'right',
    //   slots: { customRender: 'action' },
    //   width: 160,
    // },
  ];

  pageInit();
  const treeData = ref<any>([]);
  const curItem = ref<any>({});
  function pageInit() {
    getTree().then((res) => {
      treeData.value = res;
      if (treeData.value && treeData.value.length && treeData.value[0].children.length) {
        getDetail(treeData.value[0].children[0].id);
        curItem.value = treeData.value[0].children[0];
      }
    });
  }

  const detailInfo = ref<any>({});
  const citemClick = (item: any) => {
    curItem.value = item;
    getDetail(item.id);
  };

  const getDetail = (id: string) => {
    loading.value = true;
    getInfo({ id, keyValue: queryParams.value.keyword }).then((res) => {
      detailInfo.value = res;
      loading.value = false;
    });
  };

  // 自定义上传
  const customRequest = (option) => {
    const { file } = option;
    uplaoding.value = true;
    upload(file);
  };
  const upload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    await axios
      .post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Access-Token': getToken(),
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total > 0) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(percentCompleted);
          }
        },
      })
      .then(({status, data}) => {
        if (status === 200) {
          if(data.code === 200){
            createMessage.success(data.message);
          } else {
            createMessage.error(data.message);
          }
        } else {
          createMessage.error('上传失败');
        }
        uplaoding.value = false;
        pageInit();
      }).catch(_ => {
        uplaoding.value = false;
        createMessage.error('上传失败');
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
            padding: 0 0px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
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
          }
        }
        .tit {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }
        ul {
          padding: 0 0px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
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
