<template>
  <!-- 弹出层 -->
  <van-popup v-model:show="data.isPicker" position="bottom" round @close="confirmOn">
    <van-picker
      ref="picker"
      title="请选择时间"
      :columns="data.columns"
      @change="onChange"
      @cancel="cancelOn"
      @confirm="onConfirm"
      v-model="data.selectedValues"
    />
  </van-popup>
</template>

<script setup lang="ts">
  import { reactive, watch } from 'vue';
  const data = reactive<{
    isPicker: boolean;
    columns: any[];
    selectedValues: any[];
  }>({
    isPicker: false, //是否显示弹出层
    columns: [], //所有时间列
    selectedValues: [], //控件选择的时间值
  });
  let minYear = 0;
  let minM = 0;
  let minD = 0;
  let minH = 0;
  let minMm = 0;
  let minS = 0;
  const props = defineProps({
    // 传入的显影状态
    showPicker: {
      type: Boolean,
    },
    // 传入的值
    values: {
      type: String,
    },
    minDate: {
      type: Date,
    },
  });


  //定义要向父组件传递的事件
  const emit = defineEmits(['changeValue', 'confirm']);

  watch(
    () => props.showPicker,
    (val) => {
      data.isPicker = val;
      data.columns = [];
      getcolumns();
    },
    {
      immediate: true, //立即监听--进入就会执行一次 监听显影状态
    }
  );

  function onChange(v) {
    // 无用的方法
    setDisabledDate(v.selectedOptions);
  }
  function setDisabledDate(v) {
    if(!props.minDate) return;
    let minArr = [minYear, minM, minD, minH, minMm, minS];
    if(v[0].value <= minYear){
      data.columns[1].forEach((item) => {
        if(item.value < minM){
          item.disabled = true;
        }
      })
      data.columns[2].forEach((item) => {
        if(item.value < minD){
          item.disabled = true;
        }
      })
      data.columns[3].forEach((item) => {
        if(item.value < minH){
          item.disabled = true;
        }
      })
      data.columns[4].forEach((item) => {
        if(item.value < minMm){
          item.disabled = true;
        }
      })
    } else {
      data.columns[1].forEach((item) => {
        if(item.value < minM){
          item.disabled = false;
        }
      })
      data.columns[2].forEach((item) => {
        if(item.value < minD){
          item.disabled = false;
        }
      })
      data.columns[3].forEach((item) => {
        if(item.value < minH){
          item.disabled = false;
        }
      })
      data.columns[4].forEach((item) => {
        if(item.value < minMm){
          item.disabled = false;
        }
      })
    }
    if(v[0].value >= minYear && v[1].value > minM){
      data.columns[2].forEach((item) => {
        if(item.value < minD){
          item.disabled = false;
        }
      })
      data.columns[3].forEach((item) => {
        if(item.value < minH){
          item.disabled = false;
        }
      })
      data.columns[4].forEach((item) => {
        if(item.value < minMm){
          item.disabled = false;
        }
      })
    }
    if(v[0].value >= minYear && v[2].value > minD){
      data.columns[3].forEach((item) => {
        if(item.value < minH){
          item.disabled = false;
        }
      })
      data.columns[4].forEach((item) => {
        if(item.value < minMm){
          item.disabled = false;
        }
      })
    }
    if(v[0].value >= minYear && v[3].value > minH){
      data.columns[4].forEach((item) => {
        if(item.value < minMm){
          item.disabled = false;
        }
      })
    }
  }
  function getcolumns() {
    let strtime = props.values; //传入的时间
    let date;
    if (!strtime) {
      date = new Date();
    } else {
      date = new Date(strtime.replace(/-/g, '/'));
    }

    
    if (props.minDate) {
      let minDate = new Date(props.minDate);
      minYear = minDate.getFullYear();
      minM = minDate.getMonth() + 1;
      minD = minDate.getDate();
      minH = minDate.getHours();
      minMm = minDate.getMinutes();
      minS = minDate.getSeconds();
    }

    let timeVaules = date.getTime();

    let dateVaules = new Date(timeVaules);

    let Y: number = dateVaules.getFullYear();
    let M: number = dateVaules.getMonth();
    let D: number = dateVaules.getDate();
    let h: number = dateVaules.getHours();
    let m: number = dateVaules.getMinutes();
    let s: number = dateVaules.getSeconds();

    let year: any[] = []; //获取前后十年数组
    // year.values = [];
    let Currentday = new Date().getFullYear();
    if (props.minDate) {
      for (let i = minYear; i < Currentday + 10; i++) {
        year.push({ text: i.toString(), value: i.toString() });
      }
    } else {
      for (let i = Currentday - 10; i < Currentday + 10; i++) {
        year.push({ text: i.toString(), value: i.toString() });
      }
    }

    // year.defaultIndex = year.values.indexOf(Y); //设置默认选项当前年
    // 个位数补0
    const _M = M + 1 < 10 ? `0${M + 1}` : (M+1).toString(); //月份比实际获取的少1，所以要加1
    const _D = D < 10 ? `0${D}` : D.toString();
    const _h = h < 10 ? `0${h}` : h.toString();
    const _m = m < 10 ? `0${m}` : m.toString();
    const _s = s < 10 ? `0${s}` : s.toString();

    // 生成年月日时分秒时间值
    data.selectedValues.push(Y.toString());
    data.selectedValues.push(_M);
    data.selectedValues.push(_D);
    data.selectedValues.push(_h);
    data.selectedValues.push(_m);
    data.selectedValues.push(_s);
    
    data.columns.push(year); //生成年列

    let month: any[] = []; //获取12月数组
    month = Object.keys(Array.apply(null, { length: 13 })).map(function (item) {
      if (+item + 1 <= 10) {
        return { text: '0' + item, value: '0' + item };
      } else if (+item + 1 == 11) {
        return { text: (+item).toString(), value: (+item).toString() };
      } else {
        return {
          text: (+item + 0).toString(),
          value: (+item + 0).toString(),
        };
      }
    });
    month.splice(0, 1);
    data.columns.push(month); //生成月列

    //获取当月的天数
    let days = getCountDays(Y, M + 1);
    let day: any[] = []; //创建当月天数数组
    day = Object.keys(Array.apply(null, { length: days + 1 })).map(function (item) {
      if (+item + 1 <= 10) {
        return { text: '0' + item, value: '0' + item };
      } else if (+item + 1 == 11) {
        return { text: (+item).toString(), value: (+item).toString() };
      } else {
        return {
          text: (+item + 0).toString(),
          value: (+item + 0).toString(),
        };
      }
    });
    day.splice(0, 1);
    
    data.columns.push(day); //生成日列

    let hour: any[] = []; //创建小时数组
    hour = Object.keys(Array.apply(null, { length: 24 })).map(function (item) {
      if (+item + 1 <= 10) {
        return { text: '0' + item, value: '0' + item };
      } else {
        return {
          text: (+item + 0).toString(),
          value: (+item + 0).toString(),
        };
      }
    });
    data.columns.push(hour); //生成小时列

    let mi: any[] = []; //创建分钟数组
    mi = Object.keys(Array.apply(null, { length: 60 })).map(function (item) {
      if (+item + 1 <= 10) {
        return { text: '0' + item, value: '0' + item };
      } else {
        return {
          text: (+item + 0).toString(),
          value: (+item + 0).toString(),
        };
      }
    });
    data.columns.push(mi); //生成分钟列


    let ss: any[] = []; // 创建秒数数组
    ss = Object.keys(Array.apply(null, { length: 60 })).map(function (item) {
      if (+item + 1 <= 10) {
        return { text: '0' + item, value: '0' + item };
      } else {
        return {
          text: (+item + 0).toString(),
          value: (+item + 0).toString(),
        };
      }
    });
    data.columns.push(ss); //生成秒钟列
    
    if(props.minDate){
      setDisabledDate([
        {text: minYear.toString(), value: minYear.toString()},
        {text: minM.toString(), value: minM.toString()},
        {text: minD.toString(), value: minD.toString()},
        {text: minH.toString(), value: minH.toString()},
        {text: minMm.toString(), value: minMm.toString()},
        {text: minS.toString(), value: minS.toString()},
      ])
    }

  }

  function getCountDays(year, month) {
    //获取某年某月多少天
    let day = new Date(year, month, 0);
    return day.getDate();
  }

  // 关闭弹框
  function confirmOn() {
    emit('changeValue');
  }

  //时间选择器关闭 值不改变并关闭弹框
  function cancelOn({ selectedValues }) {
    confirmOn();
  }

  // 时间选择器确定 值改变
   function onConfirm({ selectedOptions }) {
    let endval =
      selectedOptions[0].text +
      '-' +
      selectedOptions[1].text +
      '-' +
      selectedOptions[2].text +
      ' ' +
      selectedOptions[3].text +
      ':' +
      selectedOptions[4].text +
      ':' +
      selectedOptions[5].text;
    confirmOn();
    emit('confirm', endval);
  }
</script>
