<template>
  <basic-table @register="registerTable">
    <template #tableTitle>
      <a-button type="primary" v-auth="'ballCamera:add'" @click="handleAdd">新增</a-button>
    </template>
    <template #action="{ record }">
      <table-action :actions="getActions(record)" />
    </template>
  </basic-table>
  <teamInfoDrawer @register="registerDrawer" @success="handleSuccess" />
  <playerModal @register="registerPlayerModal" />
</template>
<script setup name="hazardousOperation-ballCamera" lang="ts">
  import { useContent } from './hooks/useContent';
  import { BasicTable, TableAction } from '/@/components/Table';
  import teamInfoDrawer from './drawer.vue';
  import playerModal from '../jobManagement/playedu-player/playerModal.vue';
  const { registerTable, getActions, handleSuccess, registerDrawer, handleAdd, registerPlayerModal } = useContent();
</script>
<style lang="less"></style>
