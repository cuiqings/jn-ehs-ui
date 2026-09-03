<template>
  <div>
    <basic-table @register="registerTable">
      <template #tableTitle>
        <a-button preIcon="ant-design:plus-outlined" type="primary" v-auth="'examineQuestion:add'" @click="onAdd">问题录入</a-button>
      </template>
      <template #image="{ record }">
        <img
          v-if="record.image"
          :src="fmtImg(record)"
          style="cursor: pointer; display: inline-block; width: 40px; height: 40px"
          @click="openImg(record)"
        />
        <span v-if="!record.image">无</span>
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
    <examine-question-drawer @register="registerDrawer" @success="handleSuccess" />
  </div>
</template>
<script setup name="examine-question" lang="ts">
  import { useContent } from './hooks/useContent';
  import examineQuestionDrawer from './drawer.vue';
  import { BasicTable, TableAction } from '/@/components/Table';
  const { registerTable, getActions, registerDrawer, onAdd, fmtImg, openImg, handleSuccess } = useContent();
</script>
<style lang="less"></style>
