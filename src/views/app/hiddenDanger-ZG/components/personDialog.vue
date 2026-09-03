<template>
  <van-dialog z-index="800" style="top: 25%" v-model:show="show" title="下一节点处理人" @cancel="cancel" :before-close="beforeClose" show-cancel-button>
    <van-form ref="form" @submit="onSubmit">
      <van-cell-group inset>
        <template v-for="(item, idx) in personData" :key="item.id">
          <van-field
            required
            label-align="top"
            v-model="item.user"
            :label="item.name"
            placeholder="请选择"
            :rules="[{ required: true, message: '请选择' }]"
          >
            <template #input>
              <a-select
                ref="select"
                v-model:value="item.user"
                show-search
                :field-names="{ label: 'realname', value: 'id' }"
                :filter-option="filterOption"
                style="width: 100%"
                :options="item.users"
                :getPopupContainer="returnBody"
              ></a-select>
            </template>
          </van-field>
        </template>
      </van-cell-group>
    </van-form>
  </van-dialog>
</template>
<script setup lang="ts">
  import { getAssignee } from '../index.api';
  import { ref } from 'vue';
  const form = ref(null);
  const show = ref(false);
  const personData = ref<any[]>([]);
    const emits = defineEmits(['confirm', 'cancel']);


  const getAssigneeData = async (params) => {
    const res = await getAssignee(params);
    personData.value = res;
    if(res.length > 0) {
        show.value = true;
        return true;
    }
    return false;
  };

  const returnBody = () => {
    return document.querySelector('body') as HTMLElement;
  };
  const filterOption = (input: string, option: any) => {
    return option.realname.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  const onSubmit = (values) => {
    console.log('submit', values);
  };

  const beforeClose = async (str) => {
    return new Promise((resolve) => {
        if (str === 'confirm') {
            if(personData.value.length > 0) {
                form.value.validate().then(() => {
                    resolve(true)
                    let mapValue = {}
                    personData.value.forEach(val => {
                        mapValue[val.field] = val.user
                    })
                    emits('confirm', mapValue)
                }).catch(() => {
                    resolve(false)
                })
            } else {
                resolve(true)
            }
        } else {
            resolve(true)
        }
    })
  }

  const cancel = () => {
    emits('cancel');
  };
  defineExpose({
    getAssigneeData,
  });
</script>
