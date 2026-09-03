<script lang="ts">
  import axios from 'axios';
  export default {
    data() {
      return {
        accuracy: '',
        latitude: '',
        temp: '',
        text: '',
        icon: '',
        title: '',
        severityColor: '',
        bottomText: '',
      };
    },
    mounted() {
      // 获取当前经纬度
      axios
        .get('https://restapi.amap.com/v3/ip', {
          params: {
            key: '3f3886c24c7f640cc44404a485c3608e',
          },
        })
        .then(({ data }) => {
          if (data.rectangle) {
            const arr = data.rectangle.split(';');
            const arr1 = arr[arr.length - 1];
            this.accuracy = arr1.split(',')[0];
            this.latitude = arr1.split(',')[1];
            axios
              .get('https://devapi.qweather.com/v7/weather/now', {
                params: {
                  location: `${this.accuracy},${this.latitude}`,
                  key: '79a4c48adc2d4cf5804646a01b56f7bd',
                },
              })
              .then(({ data }) => {
                if (data.code === '200') {
                  this.temp = data.now.temp;
                  this.text = data.now.text;
                  this.icon = data.now.icon;
                }
              });
            axios
              .get('https://devapi.qweather.com/v7/warning/now', {
                params: {
                  location: `${this.accuracy},${this.latitude}`,
                  key: '79a4c48adc2d4cf5804646a01b56f7bd',
                },
              })
              .then(({ data }) => {
                if (data.code === '200') {
                  this.title = data.warning.length > 0 ? data.warning[0].typeName + data.warning[0].level + '预警' : '';
                  this.severityColor = data.warning.length > 0 ? data.warning[0].severityColor : '';
                }
              });
            axios
              .get('https://devapi.qweather.com/v7/weather/7d', {
                params: {
                  location: `${this.accuracy},${this.latitude}`,
                  key: '79a4c48adc2d4cf5804646a01b56f7bd',
                },
              })
              .then(({ data }) => {
                if (data.code === '200') {
                  const data1 = data.daily;
                  const maxObj = data1.reduce((maxObj, currentObj) => {
                    return parseInt(currentObj.tempMax) > parseInt(maxObj.tempMax) ? currentObj : maxObj;
                  }, data1[0]);
                  const minObj = data1.reduce((minObj, currentObj) => {
                    return parseInt(currentObj.tempMin) < parseInt(minObj.tempMin) ? currentObj : minObj;
                  }, data1[0]);
                  this.bottomText = `近七天最高温度${maxObj.tempMax}°C(${this.dateFormat(maxObj.fxDate)}） 最低气温${
                    minObj.tempMin
                  }°C(${this.dateFormat(minObj.fxDate)}）`;
                }
              });
          }
        });
    },
    methods: {
      dateFormat(dateTime) {
        const date = new Date(dateTime);
        return date.getMonth() + 1 + '月' + date.getDate() + '日';
      },
    },
  };
</script>

<template>
  <div class="weather">
    <div class="container">
      <div class="bg">
        <div style="display: flex; margin-top: 9px; padding: 5px 10px 0 10px; align-items: center">
          <div><i :class="'qi-' + icon" style="font-size: 24px; padding: 0 10px"></i></div>
          <div style="font-size: 20px; padding: 0 30px 0 10px">{{ temp }}°C</div>
          <div style="display: flex">
            <div> {{ text }}</div>
            <div :style="'padding-left: 20px;color:' + severityColor">{{ title }}</div>
          </div>
        </div>
        <div style="padding-left: 10px; font-size: 13px">{{ bottomText }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
  .someClass::before {
    font-family: 'qweather-icons' !important;
    content: '\f110';
  }
  .weather {
    width: 400px;
    height: 90px;
    margin-bottom: 17px;
    .container {
      position: relative; /* 让容器成为相对定位的父元素 */
      width: 379px;
      height: 90px;
    }
    .bg {
      position: absolute; /* 设置背景图绝对定位，相对于容器 */
      width: 379px;
      height: 90px;
      background-image: url('../../../assets/images/controlScreen/weatherbg.png');
      background-size: cover; /* 让背景图完全覆盖容器 */
    }
  }
</style>
