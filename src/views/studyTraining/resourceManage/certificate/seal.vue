<template>
  <div :style="style">
    <canvas ref="canvasRef" style="width: 128px; height: 128px"></canvas>
  </div>
</template>
<script>
  import { ref, onMounted, watch } from 'vue';
  export default {
    name: 'StampRender',
    props: {
      value: {
        type: String,
        required: true,
      },
      style: {
        type: Object,
        required: false,
      },
    },
    setup(props) {
      const canvasRef = ref(null);
      const create5star = (context, sx, sy, radius, color, rotato) => {
        context.save();
        context.fillStyle = color;
        context.translate(sx, sy);
        context.rotate(Math.PI + rotato);
        context.beginPath();
        const dig = (Math.PI / 5) * 4;
        for (let i = 0; i < 5; i++) {
          const x = Math.sin(i * dig);
          const y = Math.cos(i * dig);
          context.lineTo(x * radius, y * radius);
        }
        context.closePath();
        context.stroke();
        context.fill();
        context.restore();
      };
      const drawStamp = () => {
        const canvas = canvasRef.value;
        if (!canvas) {
          return;
        }
        const context = canvas.getContext('2d');
        const companyName = props.value;
        canvas.width = props.style?.width | 256; // 画布大小扩展到256x256
        canvas.height = props.style?.height | 256;

        const width = canvas.width / 2;
        const height = canvas.height / 2;

        context.lineWidth = 4; // 线宽扩展到6
        context.strokeStyle = props.style.color;
        context.beginPath();
        context.arc(width, height, 124, 0, Math.PI * 2); // 半径扩展到124
        context.stroke();
        // 画五角星
        create5star(context, width, height, 48, props.style.color, 0); // 半径扩展到48
        context.translate(width, height);

        context.save(); // 保存当前只进行了中心平移的画布状态

        context.font = props.style.fontSize;
        const count = companyName.length;
        const angle = (8 * Math.PI) / (7 * count);
        const chars = companyName.split('');

        for (let i = 0; i < count; i++) {
          const c = chars[i];
          if (i === 0) {
            context.rotate((8 * Math.PI) / 8.3);
          } else {
            context.rotate(angle);
          }
          context.save();
          context.font = 'bold 28px 微软雅黑';
          context.fillStyle = props.style.color;
          context.translate(88, 0); // 平移到此位置,此时字和x轴垂直，公司名称和最外圈的距离
          context.rotate(Math.PI / 2); // 旋转90度,让字平行于x轴
          context.fillText(c, 0, 0); // 此点为字的中心点
          context.restore();
        }

        context.restore(); // 恢复到仅中心平移的画布状态，清除公司名称的旋转

        // 添加"安全生产委员会"
        context.save();
        context.font = 'bold 22px 微软雅黑'; // 可以调整字体大小和样式
        context.fillStyle = props.style.color;
        const bottomText = '安全生产委员会';
        const bottomTextWidth = context.measureText(bottomText).width;
        context.fillText(bottomText, -bottomTextWidth / 2, 80); // 调整y坐标并使用相对中心坐标
        context.restore();
      };
      // 使用 onMounted 来在组件挂载时绘制印章
      onMounted(() => {
        drawStamp();
      });
      // 使用 watch 来监听 props.style 和 props.value 的变化，并重新绘制
      watch([() => props.style, () => props.value], () => {
        drawStamp();
      });
      return {
        canvasRef,
      };
    },
  };
</script>
