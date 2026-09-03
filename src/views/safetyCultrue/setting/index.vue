<template>
  <div class="safetycultrue-setting">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" tab="安全理念配置">
        <div class="top">
          <a-table size="small" :columns="columnsA" :data-source="tableDataA" :pagination="paginationA" bordered @change="handleChangeA">
            <template #bodyCell="{ column, text, record }">
              <template v-if="column.dataIndex === 'name'">
                <a>{{ text }}</a>
              </template>
              <template v-if="column.dataIndex === 'displayFlag'">
                <a-switch
                  :checked="record.displayFlag === '1'"
                  checked-children="开启"
                  un-checked-children="关闭"
                  @change="(checked) => handleDisplayFlagChange(record, checked)"
                />
              </template>
              <template v-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" v-auth="'safetyCultrue:setting:editA'" @click="editA(record)">编辑</a-button>
                  <a-button type="link" v-auth="'safetyCultrue:setting:delA'" @click="deletePlay(record, 1)" danger>删除</a-button>
                </a-space>
              </template>
            </template>
            <template #title>
              <div class="hd">
                <div class="tit">安全理念配置</div>
                <a-button type="primary" v-auth="'safetyCultrue:setting:addA'" @click="addA">新增理念</a-button>
              </div>
            </template>
          </a-table>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="安全活动配置" force-render
        ><div class="middl">
          <a-table size="small" :columns="columnsB" :data-source="tableDataB" :pagination="paginationB" bordered @change="handleChangeB">
            <template #bodyCell="{ column, text, record }">
              <template v-if="column.dataIndex === 'isTop'">
                {{ text == 1 ? '是' : '否' }}
              </template>
              <template v-if="column.dataIndex === 'delFlag'">
                {{ text == 0 ? '已发布' : '已下架' }}
              </template>
              <template v-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" v-auth="'safetyCultrue:setting:editB'" @click="editB(record)">编辑</a-button>
                  <a-button v-if="record.delFlag == 0" type="link" v-auth="'safetyCultrue:setting:finish'" @click="deletePlay(record, 2)" danger>下架</a-button>
                  <a-button v-if="record.delFlag == 1" type="link" v-auth="'safetyCultrue:setting:delB'" @click="deletePlay(record, 2)" danger>删除</a-button>
                </a-space>
              </template>
            </template>
            <template #title>
              <div class="hd">
                <div class="tit">安全活动配置</div>
                <a-button type="primary" v-auth="'safetyCultrue:setting:addB'" @click="addB">发布活动</a-button>
              </div>
            </template>
          </a-table>
        </div></a-tab-pane
      >
      <a-tab-pane key="3" tab="安全知识配置">
        <div class="bottom">
          <a-table size="small" :columns="columnsC" :data-source="tableDataC" :pagination="paginationC" bordered @change="handleChangeC">
            <template #bodyCell="{ column, text, record }">
              <template v-if="column.dataIndex === 'isTop'">
                {{ text == 1 ? '有图' : '无图' }}
              </template>
              <template v-if="column.dataIndex === 'delFlag'">
                {{ text == 0 ? '已发布' : '已下架' }}
              </template>
              <template v-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" v-auth="'safetyCultrue:setting:editC'" @click="editC(record)">编辑</a-button>
                  <a-button type="link" v-auth="'safetyCultrue:setting:delC'" @click="deletePlay(record, 1)" danger>删除</a-button>
                </a-space>
              </template>
            </template>
            <template #title>
              <div class="hd">
                <div class="tit">安全知识配置</div>
                <a-button type="primary" v-auth="'safetyCultrue:setting:addC'" @click="addC">新增知识</a-button>
              </div>
            </template>
          </a-table>
        </div>
      </a-tab-pane>
      <a-tab-pane key="4" tab="安全提示配置">
        <div class="top">
          <a-table size="small" :columns="columnsD" :data-source="tableDataD" :pagination="paginationD" bordered @change="handleChangeD">
            <template #bodyCell="{ column, text, record }">
              <template v-if="column.dataIndex === 'displayFlag'">
                <a-switch
                  :checked="record.displayFlag === '1'"
                  checked-children="开启"
                  un-checked-children="关闭"
                  @change="(checked) => handleDisplayFlagChangeD(record, checked)"
                />
              </template>
              <template v-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" v-auth="'safetyCultrue:setting:editD'" @click="editD(record)">编辑</a-button>
                  <a-button type="link" v-auth="'safetyCultrue:setting:delD'" @click="deletePlay(record, 4)" danger>删除</a-button>
                </a-space>
              </template>
            </template>
            <template #title>
              <div class="hd">
                <div class="tit">安全提示配置</div>
                <a-button type="primary" v-auth="'safetyCultrue:setting:addD'" @click="addD">新增安全提示</a-button>
              </div>
            </template>
          </a-table>
        </div>
      </a-tab-pane>
      <a-tab-pane key="5" tab="安全文化宣传">
        <div class="top">
          <a-table size="small" :columns="columnsE" :data-source="tableDataE" :pagination="paginationE" bordered @change="handleChangeE">
            <template #bodyCell="{ column, text, record }">
              <template v-if="column.dataIndex === 'isTop'">
                {{ text == 1 ? '政府发布' : text == 2 ? '企业发布' : '案例信息' }}
              </template>
              <template v-if="column.dataIndex === 'displayFlag'">
                <a-tag :color="text === '1' ? 'green' : 'orange'">{{ text === '1' ? '已发布' : '待发布' }}</a-tag>
              </template>
              <template v-if="column.key === 'action'">
                <a-space>
                  <template v-if="record.displayFlag === '2'">
                    <a-button type="link" v-auth="'safetyCultrue:setting:editE'" @click="editE(record)">编辑</a-button>
                    <a-button type="link" v-auth="'safetyCultrue:setting:publishE'" @click="publishE(record)">发布</a-button>
                  </template>
                  <template v-if="record.displayFlag === '1'">
                    <a-button type="link" v-auth="'safetyCultrue:setting:revokeE'" @click="revokeE(record)" danger>撤销发布</a-button>
                  </template>
                </a-space>
              </template>
            </template>
            <template #title>
              <div class="hd">
                <div class="tit">安全文化宣传</div>
                <a-button type="primary" v-auth="'safetyCultrue:setting:addE'" @click="addE">新增宣传</a-button>
              </div>
            </template>
          </a-table>
        </div>
      </a-tab-pane>
    </a-tabs>

    <AddModalA @register="registerA" ref="addModalA" @success="loadA" />

    <AddModalB @register="registerB" ref="addModalB" @success="loadB" />

    <AddModalC @register="registerC" ref="addModalB" @success="loadC" />

    <AddModalD @register="registerD" ref="addModalD" @success="loadD" />

    <AddModalE @register="registerE" ref="addModalE" @success="loadE" />
  </div>
</template>
<script lang="ts" setup>
  import { Modal } from 'ant-design-vue';
  import { del, edit } from '../api';
  import AddModalA from './addModalA.vue';
  import AddModalB from './addModalB.vue';
  import AddModalC from './addModalC.vue';
  import AddModalD from './addModalD.vue';
  import AddModalE from './addModalE.vue';
  import { useContent } from './useContentA';
  import { useContent as useContentB } from './useContentB';
  import { useContent as useContentC } from './useContentC';
  import { useContent as useContentD } from './useContentD';
  import { useContent as useContentE } from './useContentE';
  import { ref } from 'vue';
  const activeKey = ref('1');

  const { registerA, openModalA, handleChangeA, loadA, tableDataA, paginationA, columnsA } = useContent();

  const { registerB, openModalB, handleChangeB, loadB, tableDataB, paginationB, columnsB } = useContentB();

  const { registerC, openModalC, handleChangeC, loadC, tableDataC, paginationC, columnsC } = useContentC();

  const { registerD, openModalD, handleChangeD, loadD, tableDataD, paginationD, columnsD } = useContentD();

  const { registerE, openModalE, handleChangeE, loadE, tableDataE, paginationE, columnsE } = useContentE();

  const addA = () => {
    openModalA(true, { title: '新增理念' });
  };

  const addB = () => {
    openModalB(true, { title: '发布活动' });
  };

  const addC = () => {
    openModalC(true, { title: '新增安全知识' });
  };

  const addD = () => {
    openModalD(true, { title: '新增安全提示' });
  };

  const addE = () => {
    openModalE(true, { title: '新增安全文化宣传' });
  };

  const editA = (record) => {
    openModalA(true, { title: '编辑理念', record: JSON.parse(JSON.stringify(record)) });
  };

  const handleDisplayFlagChange = (record, checked) => {
    const displayFlag = checked ? '1' : '2';
    edit({ ...record, displayFlag }).then(() => {
      loadA();
    });
  };

  const handleDisplayFlagChangeD = (record, checked) => {
    const displayFlag = checked ? '1' : '2';
    edit({ ...record, displayFlag }).then(() => {
      loadD();
    });
  };

  const editB = (record) => {
    openModalB(true, { title: '编辑活动', record: JSON.parse(JSON.stringify(record)) });
  };

  const editC = (record) => {
    openModalC(true, { title: '编辑安全知识', record: JSON.parse(JSON.stringify(record)) });
  };

  const editD = (record) => {
    openModalD(true, { title: '编辑安全提示', record: JSON.parse(JSON.stringify(record)) });
  };

  const editE = (record) => {
    openModalE(true, { title: '编辑安全文化宣传', record: JSON.parse(JSON.stringify(record)) });
  };

  const publishE = (record) => {
    Modal.confirm({
      title: '确定要发布吗?',
      onOk() {
        edit({ ...record, displayFlag: '1' }).then(() => {
          loadE();
        });
      },
    });
  };

  const revokeE = (record) => {
    Modal.confirm({
      title: '确定要撤销发布吗?',
      onOk() {
        edit({ ...record, displayFlag: '2' }).then(() => {
          loadE();
        });
      },
    });
  };

  const deletePlay = (record, type) => {
    const title = type === 1 || type === 4 ? '确定要删除吗?' : type === 2 ? '确定要下架吗?' : '确定要删除吗?';
    Modal.confirm({
      title: title,
      onOk() {
        del({
          id: record.id,
          type: type,
        }).then((_) => {
          if (type === 1) {
            loadA();
          } else if (type === 2) {
            loadB();
          } else if (type === 4) {
            loadD();
          } else {
            loadC();
          }
        });
      },
      onCancel() {
        console.log('Cancel');
      },
      class: 'test',
    });
  };
</script>
<style lang="less" scoped>
  .safetycultrue-setting {
    width: 100%;
    height: 100%;
    padding: 16px;
    background-color: #ffffff;
    .hd {
      display: flex;
      justify-content: space-between;
      .tit {
        font-size: 18px;
        font-weight: 600;
      }
    }
  }
</style>
