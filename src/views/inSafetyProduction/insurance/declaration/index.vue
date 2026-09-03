<template>
    <div class="declaration">
        <div class="main">
<!--            <a-tabs v-model:activeKey="activeKey">-->
<!--                <a-tab-pane key="1" tab="各单位明细">-->
                    <DeptRecord />
<!--                </a-tab-pane>-->
<!--                <a-tab-pane key="2" tab="月度汇总" force-render>-->
<!--                    <MonthRecord />-->
<!--                </a-tab-pane>-->
<!--            </a-tabs>-->
        </div>
    </div>
</template>

<script lang="ts" name="inSafetyProduction-insurance-declaration" setup>
import DeptRecord from './record.vue'
// import MonthRecord from './monthRecord.vue';
// import { ref } from 'vue';
import { useModal } from '/@/components/Modal'
const [register, { openModal }] = useModal();
// const activeKey = ref('1');
</script>

<style lang="less" scoped>
.declaration{
    width: 100%;
    padding: 10px;
    .main{
         padding: 10px;
         background-color: #ffffff;
         .btn-template{
            position: absolute;
            right: 28px;
            top: 20px;
         }
    }
}
</style>
