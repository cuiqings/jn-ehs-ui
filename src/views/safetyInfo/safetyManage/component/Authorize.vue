<template>
  <a-modal
    v-model:visible="visibleAuthorize"
    :width="1200"
    :body-style="{ height: '678px' }"
    title="授权"
    ok-text="确定"
    cancel-text="取消"
    @ok="okAuthorize"
    @cancel="cancelAuthorize"
  >
    <a-card style="width: 100%" :tab-list="tabList" :active-tab-key="cardKeys" @tab-change="onTabChange">
      <a-spin :spinning="orgLoading" v-if="cardKeys === 'org'">
        <a-row type="flex" :gutter="15" v-if="cardKeys === 'org'">
          <a-col :md="11">
            <a-tree-select
              v-model:value="authorizeFromInfo.orgIds"
              show-search
              :field-names="{
                children: 'children',
                label: 'title',
                value: 'id',
              }"
              style="width: 100%"
              :dropdown-style="{ maxHeight: '500px', overflow: 'auto' }"
              placeholder="请选择"
              :show-checked-strategy="SHOW_ALL"
              allow-clear
              tree-check-strictly
              multiple
              tree-default-expand-all
              tree-node-filter-prop="title"
              :tree-data="orgTreeData"
              @select="changeOrgSelect"
            />
          </a-col>
          <a-col :md="2" />
          <a-col :md="11" class="rp-col">
            <div class="r-title">
              已选{{ authorizeFromInfo.orgIds.length }}项
              <span @click="clearOrg">清空</span>
            </div>
            <a-empty v-if="authorizeFromInfo.orgIdsValue.length === 0" :image="Empty.PRESENTED_IMAGE_SIMPLE" />
            <div class="r-wlist" v-else>
              <div class="r-list" v-for="item in authorizeFromInfo.orgIdsValue" :key="item.value">
                <span class="name">{{ item.label }}</span>
                <i @click="closeSelectOrg(item.value)">×</i>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-spin>
      <a-transfer
        v-if="cardKeys === 'role'"
        v-model:target-keys="authorizeFromInfo.roleIds"
        :row-key="(record) => record.id"
        :data-source="dataSourceRole"
        :show-select-all="false"
        show-search
        :filter-option="(inputValue, item) => item.roleName.indexOf(inputValue) !== -1"
      >
        <template #children="{ filteredItems, selectedKeys, onItemSelectAll, onItemSelect }">
          <a-table
            :row-selection="
              getRowSelection({
                selectedKeys,
                onItemSelectAll,
                onItemSelect,
              })
            "
            :columns="columnsRole"
            :data-source="filteredItems"
            :loading="roleLoading"
            size="small"
            :scroll="{ y: 390 }"
            :custom-row="
              ({ id }) => ({
                onClick: () => {
                  onItemSelect(id, !selectedKeys.includes(id));
                },
              })
            "
          />
        </template>
      </a-transfer>
      <a-transfer
        v-if="cardKeys === 'user'"
        v-model:target-keys="authorizeFromInfo.userAuthorize"
        :row-key="(record) => record.id"
        :data-source="dataSourceLeft"
        :show-select-all="false"
        show-search
        :filter-option="(inputValue, item) => item.username.indexOf(inputValue) !== -1"
      >
        <template #children="{ filteredItems, selectedKeys, onItemSelectAll, onItemSelect }">
          <a-table
            :row-selection="
              getRowSelection({
                selectedKeys,
                onItemSelectAll,
                onItemSelect,
              })
            "
            :columns="columnsAuthorize"
            :data-source="filteredItems"
            :loading="userLoading"
            size="small"
            :scroll="{ y: 390 }"
            :custom-row="
              ({ id }) => ({
                onClick: () => {
                  onItemSelect(id, !selectedKeys.includes(id));
                },
              })
            "
          />
        </template>
      </a-transfer>
    </a-card>
  </a-modal>
</template>
<script setup name="file-model" lang="ts">
  import { Empty } from 'ant-design-vue';
  import { useAuthorize } from './hooks/useAuthorize';
  const emit = defineEmits(['ok']);
  const {
    visibleAuthorize,
    okAuthorize,
    authorizeFromInfo,
    cancelAuthorize,
    openAuthorize,
    dataSourceLeft,
    columnsAuthorize,
    getRowSelection,
    orgTreeData,
    dataSourceRole,
    columnsRole,
    cardKeys,
    tabList,
    onTabChange,
    orgLoading,
    userLoading,
    clearOrg,
    closeSelectOrg,
    changeOrgSelect,
    SHOW_ALL,
    roleLoading,
  } = useAuthorize(emit);
  defineExpose(openAuthorize);
</script>
<style lang="less" scoped>
  .rp-col {
    border: 1px solid #eee;
    .r-title {
      font-size: 14px;
      color: rgba(0, 0, 0, 0.38);
      padding: 10px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      > span {
        color: #0091ff;
        cursor: pointer;
      }
    }
    .r-wlist {
      height: 500px;
      overflow-y: auto;
      .r-list {
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: 40px;
        line-height: 40px;
        padding: 0 8px;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 4px;
        font-size: 14px;
        margin-bottom: 10px;
        .name {
          color: rgba(0, 0, 0, 0.87);
          margin-right: 8px;
        }
        > i {
          color: rgba(0, 0, 0, 0.87);
          display: inline-block;
          font-size: 18px;
          cursor: pointer;
          font-style: normal;
        }
      }
    }
  }
</style>
