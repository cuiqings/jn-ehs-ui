<template>
  <a-cascader
    style="width: 100%;"
    v-model:value="selectValue"
    multiple
    :maxTagCount="2"
    :disabled="props.disabled"
    :options="props.personnel"
    change-on-select
    @change="handleChange"
    placeholder="选择人员(允许多选)"
    :displayRender="({ labels }) => labels.join('>')"
    :fieldNames="{ label: 'realname', value: 'value', children: 'children' }"
  />
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue';
  const emits = defineEmits(['change']);

  const loadData = (e) => {
    console.log(e);
    
  }


  const props = defineProps({
    personnel: {
      type: Array,
      default: () => [],
    },
    disabled: {
        type: Boolean,
        default: false
    },
    value: {
        type: Array,
        default: () => []
    }
  });
  const selectValue = ref(props.value);
  watch(() => props.value, (newVal) => {
    console.log(selectValue.value);
    
    selectValue.value = newVal;
  }, { deep: true })
  
  const handleChange = (value, s) => {
   console.log(value, s);
    if(s.length == 1 && s[0].length == 1){
      value[0].push(s[0][0].children[0].value)
    }
    console.log(value);
    
    emits('change', value);
  };
</script>
