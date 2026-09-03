<template>
  <div class="cockpit2">
    <!-- 顶部栏 -->
    <div class="topbar">
      <div class="brand">
        <span class="dot"></span>
        <span class="name">敬业集团 · <b>安全驾驶舱</b></span>
      </div>
      <div class="weather" v-if="weatherAlert || weatherInfo" @click="weatherModalVisible = true">
        <span class="tag" v-if="weatherAlert">{{ weatherAlert }}</span>
        <span class="weather-info" v-if="weatherInfo">{{ weatherInfo }}</span>
      </div>
      <div class="marquee-wrap">
        <div class="marquee" ref="marqueeRef">
          <span class="chip" :class="item.type" v-for="(item, i) in marqueeList" :key="i" @click="openModal(item)">
            {{ item.text }}
          </span>
          <span class="chip" :class="item.type" v-for="(item, i) in marqueeList" :key="'d' + i">
            {{ item.text }}
          </span>
        </div>
      </div>
      <div class="datetime">{{ currentTime }}</div>
      <div class="back-btn" @click="goBack">返回</div>
    </div>

    <!-- 标题 -->
    <div class="header">
      <h1>本部基地安全综合驾驶舱</h1>
    </div>

    <!-- 主体 -->
    <div class="main">
      <!-- KPI行 -->
      <div class="kpi-row">
        <div class="kpi" v-for="kpi in kpiList" :key="kpi.label">
          <div class="lbl">
            {{ kpi.label }}
            <span class="trend" :class="kpi.trend">{{ kpi.trendText }}</span>
          </div>
          <div class="row">
            <span class="val">{{ kpi.value }}<span class="unit">{{ kpi.unit }}</span></span>
          </div>
          <div class="sub" v-if="kpi.sub" v-html="kpi.sub"></div>
        </div>
      </div>

      <!-- 综合安全指数 -->
      <div class="panel p-gauge">
        <div class="hd"><span class="tr-corner"></span><span class="bl-corner"></span>综合安全指数<span class="rt">TODAY</span></div>
        <div class="bd">
          <div class="gauge-wrap">
            <div class="gauge-sub">今日综合得分</div>
            <div class="gauge">
              <svg viewBox="0 0 200 110" width="200" height="110">
                <defs>
                  <linearGradient id="gaugeGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#66bb6a"/><stop offset="35%" stop-color="#29b6f6"/>
                    <stop offset="70%" stop-color="#ffa726"/><stop offset="100%" stop-color="#ef5350"/>
                  </linearGradient>
                </defs>
                <!-- 背景弧 -->
                <path d="M 16 100 A 84 84 0 1 1 184 100" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="12" stroke-linecap="round"/>
                <!-- 渐变弧 -->
                <path d="M 16 100 A 84 84 0 1 1 184 100" fill="none" stroke="url(#gaugeGrad2)" stroke-width="12" stroke-linecap="round"/>
                <!-- 指针 -->
                <line x1="100" y1="100" :x2="needleX" :y2="needleY" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
                <circle cx="100" cy="100" r="4" fill="#fff"/>
              </svg>
              <div class="v">{{ safetyScore }}</div>
            </div>
            <div class="grade-row">
              等级 <b :style="gradeColor ? { color: gradeColor } : {}">{{ safetyGrade }}</b>
              <span class="sep-dot">·</span>
              较昨日 <span class="diff" :class="dayDiff >= 0 ? 'up' : 'down'">{{ dayDiff >= 0 ? '+' : '' }}{{ dayDiff }}</span>
            </div>
            <div class="reach-tip" v-if="reachTip">{{ reachTip }}</div>
            <div class="stats-row">
              <div class="st">较上周<b :class="weekDiff >= 0 ? 'up' : 'down'">{{ weekDiff >= 0 ? '↑' : '↓' }}{{ Math.abs(weekDiff) }}</b></div>
              <div class="st">月均<b>{{ monthAvg }}</b></div>
              <div class="st">目标<b>≥{{ targetScore }}</b></div>
            </div>
          </div>
        </div>
      </div>
      <!-- 中心地图 -->
      <div class="panel p-map">
        <div class="hd"><span class="tr-corner"></span><span class="bl-corner"></span>全厂安全态势<span class="rt">重大危险源分布</span></div>
        <div class="bd" style="padding:0;">
          <div class="map-stage" ref="mapStageRef"
            @mousedown="onMapMouseDown" @mousemove="onMapMouseMove" @mouseup="onMapMouseUp" @mouseleave="onMapMouseUp"
            @wheel.prevent="onMapWheel">
            <div class="map-layer" ref="mapLayerRef" :style="mapLayerStyle">
              <canvas class="map-img" ref="mapCanvasRef" :style="{ opacity: mapOpacity }"></canvas>
              <!-- 危险源点位（跟随底图） -->
              <div class="hazard" v-for="h in hazardPoints" :key="h.id"
                :style="{ left: (h.x / 7793 * 100) + '%', top: (h.y / 5312 * 100) + '%' }"
                @mouseenter="showHazardTooltip($event, h)" @mouseleave="hideHazardTooltip">
                <div class="core"></div>
                <div class="ring"></div>
              </div>
            </div>
            <!-- 雷达扫射 -->
            <div class="radar-sweep">
              <div class="radar-ring"></div>
              <div class="radar-center"></div>
              <div class="radar-arm"></div>
            </div>
            <!-- 危险源浮窗（固定在map-stage内，JS定位） -->
            <div class="hazard-tooltip" ref="hazardTooltipRef" v-show="activeHazard" :style="hazardTooltipStyle">
              <template v-if="activeHazard">
                <h4>{{ activeHazard.name }}<span class="level-chip" :class="'L' + activeHazard.level">{{ activeHazard.levelText }}</span></h4>
                <div class="row"><span>级别</span><span>{{ activeHazard.levelText }}</span></div>
                <template v-if="activeHazard.type === '1'">
                  <div class="row"><span>容量</span><span>{{ activeHazard.capacity }}</span></div>
                  <div class="row"><span>柜位</span><span>{{ activeHazard.position }}</span></div>
                  <div class="row"><span>温度</span><span>{{ activeHazard.temperature }}</span></div>
                </template>
                <template v-if="activeHazard.type === '2'">
                  <div class="row"><span>液位</span><span>{{ activeHazard.liquidLevel }}</span></div>
                  <div class="row"><span>碳氢化合物含量</span><span>{{ activeHazard.hydrocarbonContent }}</span></div>
                </template>
                <div class="row"><span>技术责任人</span><span>{{ activeHazard.techPerson }}</span></div>
                <div class="row"><span>操作责任人</span><span>{{ activeHazard.operatePerson }}</span></div>
              </template>
            </div>
            <!-- 图例 -->
            <div class="map-legend">
              <span class="lg"><i class="d" style="color:var(--danger)"></i>重大危险源</span>
            </div>
            <!-- 地图控制 -->
            <div class="map-zoom-ctrl" @mousedown.stop @mousemove.stop>
              <button @click="zoomMap(0.15)">+</button>
              <button @click="zoomMap(-0.15)">−</button>
              <button @click="mapRotate += 20">↻</button>
              <button @click="resetMap">⟲</button>
              <div class="map-opacity-wrap">
                <label>透明</label>
                <input type="range" min="0.2" max="1" step="0.05" v-model.number="mapOpacity" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 关键数据 -->
      <div class="panel p-tasks">
        <div class="hd"><span class="tr-corner"></span><span class="bl-corner"></span>关键数据</div>
        <div class="bd">
          <div class="tasks-grid">
            <div class="task-card" v-for="t in taskCards" :key="t.name">
              <div class="tname">{{ t.name }}</div>
              <div class="task-body">
                <div class="circle-prog">
                  <svg viewBox="0 0 38 38" width="38" height="38">
                    <circle cx="19" cy="19" r="15" fill="none" stroke="rgba(79,195,247,0.12)" stroke-width="3"/>
                    <circle cx="19" cy="19" r="15" fill="none" :stroke="t.color || 'var(--primary)'" stroke-width="3"
                      stroke-linecap="round" :stroke-dasharray="94.25" :stroke-dashoffset="94.25 * (1 - t.rate / 100)"
                      transform="rotate(-90 19 19)"/>
                  </svg>
                  <span class="pct">{{ t.rate }}%</span>
                </div>
                <div class="task-nums">
                  <span>完成<b>{{ t.done }}</b></span>
                  <span class="done">待办<b>{{ t.pending }}</b></span>
                </div>
              </div>
            </div>
            <!-- 三项岗位人员比例 -->
            <div class="task-card bar-card">
              <div class="tname">三项岗位人员比例</div>
              <div class="bar-stack">
                <div class="b1" :style="{ width: barData.b1 + '%' }">{{ barData.b1 }}%</div>
                <div class="b2" :style="{ width: barData.b2 + '%' }">{{ barData.b2 }}%</div>
                <div class="b3" :style="{ width: barData.b3 + '%' }">{{ barData.b3 }}%</div>
              </div>
              <div class="bar-legend">
                <span class="li"><i style="background:var(--primary)"></i>负责人<b>{{ barData.v1 }}</b></span>
                <span class="li"><i style="background:var(--primary-2)"></i>安全管理<b>{{ barData.v2 }}</b></span>
                <span class="li"><i style="background:var(--cyan)"></i>特种作业<b>{{ barData.v3 }}</b></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 各单位安全得分排名 -->
      <div class="panel p-rank">
        <div class="hd">
          <span class="tr-corner"></span><span class="bl-corner"></span>各单位安全得分排名
          <span class="rt">{{ rankList.length }} UNITS</span>
        </div>
        <div class="bd">
          <div class="rank-list">
            <div class="rank-item" v-for="(r, idx) in rankList" :key="r.name">
              <div class="rank-no" :class="{ top1: idx === 0, top2: idx === 1, top3: idx === 2 }">{{ idx + 1 }}</div>
              <div class="rank-name-wrap">
                <span class="rank-name">{{ r.name }}</span>
                <div class="rank-bar"><i :style="{ width: r.score + '%' }"></i></div>
              </div>
              <span class="rank-score">{{ r.score }}</span>
              <span class="rank-trend" :class="r.trend">{{ r.trendIcon }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 今日危险作业 -->
      <div class="panel p-works">
        <div class="hd"><span class="tr-corner"></span><span class="bl-corner"></span>今日危险作业</div>
        <div class="bd">
          <div class="works-tabs">
            <span class="t working">作业中<b>{{ workStats.working }}</b></span>
            <span class="t approving">审批中<b>{{ workStats.approving }}</b></span>
            <span class="t pending">待作业<b>{{ workStats.pending }}</b></span>
            <span class="t interrupt">已中断<b>{{ workStats.interrupt }}</b></span>
          </div>
          <div class="work-grid">
            <div class="work-inner" :style="{ animationDuration: workScrollDuration }">
              <div class="work-item" :class="'status-' + w.status" v-for="(w, i) in workList" :key="'a' + i">
                <div class="line1">
                  <span class="code">{{ w.code }}</span>
                  <span class="name">{{ w.name }}</span>
                  <span class="status-chip">{{ w.statusText }}</span>
                </div>
                <div class="line2">
                  <span><em>{{ w.dept }}</em></span><span class="sep">|</span>
                  <span><em>{{ w.type }}</em></span>
                  <span class="level-badge" v-if="w.level">{{ w.level }}</span><span class="sep">|</span>
                  <span><em>{{ w.person }}</em></span><span class="sep">|</span>
                  <span><em>{{ w.time }}</em></span>
                </div>
              </div>
              <!-- 复制一份实现无缝循环 -->
              <div class="work-item" :class="'status-' + w.status" v-for="(w, i) in workList" :key="'b' + i">
                <div class="line1">
                  <span class="code">{{ w.code }}</span>
                  <span class="name">{{ w.name }}</span>
                  <span class="status-chip">{{ w.statusText }}</span>
                </div>
                <div class="line2">
                  <span><em>{{ w.dept }}</em></span><span class="sep">|</span>
                  <span><em>{{ w.type }}</em></span>
                  <span class="level-badge" v-if="w.level">{{ w.level }}</span><span class="sep">|</span>
                  <span><em>{{ w.person }}</em></span><span class="sep">|</span>
                  <span><em>{{ w.time }}</em></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 安全文化宣传 -->
      <div class="panel p-culture">
        <div class="hd"><span class="tr-corner"></span><span class="bl-corner"></span>安全文化宣传</div>
        <div class="bd">
          <div class="culture-tabs">
            <div class="culture-tab" :class="{ active: cultureTab === idx }" v-for="(tab, idx) in cultureTabs" :key="idx" @click="switchCultureTab(idx)">
              {{ tab }}
            </div>
          </div>
          <div class="culture-row">
            <div class="culture-item" v-for="item in cultureItems" :key="item.id">
              <div class="tt">
                <span class="h">{{ item.title }}</span>
                <span class="source-tag" :class="'src-' + cultureTab">{{ cultureTabs[cultureTab] }}</span>
              </div>
              <div class="desc">{{ item.playContent }}</div>
              <div class="culture-date">{{ item.playDate }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 天气弹窗 -->
    <div class="modal-mask" v-if="weatherModalVisible" @click="weatherModalVisible = false">
      <div class="modal-box weather-modal" @click.stop>
        <div class="modal-hd">天气详情<span class="close" @click="weatherModalVisible = false">&times;</span></div>
        <div class="modal-bd">
          <div class="weather-detail">
            <div class="weather-detail-row"><span class="label">天气状况</span><span class="value">{{ weatherDetail.desc }}</span></div>
            <div class="weather-detail-row"><span class="label">当前温度</span><span class="value">{{ weatherDetail.temp }}℃</span></div>
            <div class="weather-detail-row"><span class="label">风向</span><span class="value">{{ weatherDetail.windDir }}</span></div>
            <div class="weather-detail-row"><span class="label">风速</span><span class="value">{{ weatherDetail.wind }}km/h</span></div>
            <div class="weather-detail-row"><span class="label">阵风</span><span class="value">{{ weatherDetail.gusts }}km/h</span></div>
          </div>
          <div class="weather-form">
            <div class="form-title">气象预警配置</div>
            <div class="form-row">
              <span class="form-label">预警时间</span>
              <div class="form-inputs">
                <a-range-picker v-model:value="warningForm.dateRange" valueFormat="YYYY-MM-DD" class="form-date-range" />
              </div>
            </div>
            <div class="form-row">
              <span class="form-label">预警信息</span>
              <textarea v-model="warningForm.message" class="form-textarea" placeholder="请输入预警信息"></textarea>
            </div>
            <div class="form-actions">
              <button class="btn-cancel" @click="weatherModalVisible = false">关闭</button>
              <button class="btn-save" @click="saveWarning">保存预警信息</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗 -->
    <div class="modal-mask" v-if="modalVisible" @click="modalVisible = false">
      <div class="modal-box" @click.stop>
        <div class="modal-hd">{{ modalData.title }}<span class="close" @click="modalVisible = false">&times;</span></div>
        <div class="modal-bd" v-html="modalData.content"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
  import { useRouter } from 'vue-router';
  import { defHttp } from '/@/utils/http/axios';

  const router = useRouter();
  const goBack = () => {
    router.push('/dashboard/analysis');
  };

  // 时间
  const currentTime = ref('');
  // timer removed — intervals managed in onMounted
  const updateTime = () => {
    const d = new Date();
    currentTime.value = d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  // 天气
  const weatherAlert = ref('');
  const weatherInfo = ref('');
  const WMO_CODES: Record<number, string> = {
    0: '晴', 1: '大部晴', 2: '多云', 3: '阴',
    45: '雾', 48: '雾凇', 51: '小毛毛雨', 53: '毛毛雨', 55: '大毛毛雨',
    61: '小雨', 63: '中雨', 65: '大雨', 66: '冻雨', 67: '大冻雨',
    71: '小雪', 73: '中雪', 75: '大雪', 77: '雪粒',
    80: '小阵雨', 81: '阵雨', 82: '大阵雨',
    85: '小阵雪', 86: '大阵雪',
    95: '雷暴', 96: '雷暴+小冰雹', 99: '雷暴+大冰雹',
  };
  const getWindDirection = (deg: number): string => {
    const dirs = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风'];
    return dirs[Math.round(deg / 45) % 8];
  };
  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=auto`
      );
      const data = await res.json();
      const current = data.current;
      const temp = current.temperature_2m;
      const code = current.weather_code;
      const wind = current.wind_speed_10m;
      const gusts = Math.round(current.wind_gusts_10m);
      const windDir = getWindDirection(current.wind_direction_10m);
      const desc = WMO_CODES[code] || '未知';
      weatherInfo.value = `${desc} ${temp}℃ ${windDir} ${wind}km/h`;
      weatherDetail.value = { desc, temp: String(temp), wind: String(wind), gusts: String(gusts), windDir };

      // 根据天气状况判断是否有预警
      if (gusts >= 117) {
        weatherAlert.value = '大风红色预警';
      } else if (gusts >= 95) {
        weatherAlert.value = '大风橙色预警';
      } else if (gusts >= 75) {
        weatherAlert.value = '大风黄色预警';
      } else if (gusts >= 62) {
        weatherAlert.value = '大风蓝色预警';
      } else if (code === 65 || code === 82) {
        weatherAlert.value = '暴雨蓝色预警';
      } else if (code === 75 || code === 86) {
        weatherAlert.value = '暴雪蓝色预警';
      } else if (code >= 95) {
        weatherAlert.value = '雷暴黄色预警';
      } else {
        weatherAlert.value = '';
      }
    } catch (e) {
      weatherInfo.value = '';
      weatherAlert.value = '';
    }
  };
  const initWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(38.26, 114.18),
        { timeout: 5000 }
      );
    } else {
      fetchWeather(38.26, 114.18);
    }
  };

  // 天气弹窗
  const weatherModalVisible = ref(false);
  const weatherDetail = ref({ desc: '', temp: '', wind: '', gusts: '', windDir: '' });
  const warningForm = ref({ dateRange: [] as string[], message: '' });
  const configWarningMessage = ref('');

  const loadWarningConfig = async () => {
    try {
      const res = await defHttp.get({ url: '/sysIndexConfig/list' });
      const data = res || {};
      const startDate = data.weather_warning_start_date || '';
      const endDate = data.weather_warning_end_date || '';
      warningForm.value.dateRange = startDate && endDate ? [startDate, endDate] : [];
      warningForm.value.message = data.weather_warning_message || '';
      // 判断预警是否在有效期内
      const now = new Date().toISOString().slice(0, 10);
      if (data.weather_warning_message && startDate && endDate && now >= startDate && now <= endDate) {
        configWarningMessage.value = data.weather_warning_message;
      } else {
        configWarningMessage.value = '';
      }
    } catch (e) {
      configWarningMessage.value = '';
    }
  };

  const saveWarning = async () => {
    try {
      const [startDate, endDate] = warningForm.value.dateRange || ['', ''];
      await defHttp.post({
        url: '/sysIndexConfig/batchSave',
        params: {
          weather_warning_start_date: startDate,
          weather_warning_end_date: endDate,
          weather_warning_message: warningForm.value.message,
        },
      });
      await loadWarningConfig();
      weatherModalVisible.value = false;
    } catch (e) {
      console.error('保存预警信息失败', e);
    }
  };

  // 跑马灯
  const ideaList = ref<string[]>([]);
  const tipList = ref<string[]>([]);
  const loadMarqueeData = async () => {
    try {
      const [ideas, tips] = await Promise.all([
        defHttp.get({ url: '/safetyCulture/type1list' }),
        defHttp.get({ url: '/safetyCulture/type4list' }),
      ]);
      ideaList.value = ideas || [];
      tipList.value = tips || [];
    } catch (e) {
      ideaList.value = [];
      tipList.value = [];
    }
  };
  const marqueeList = computed(() => {
    const list: { type: string; text: string; title: string; content: string }[] = [];
    const ideas = ideaList.value;
    const tips = tipList.value;
    const msg = configWarningMessage.value;
    if (ideas.length === 0 && tips.length === 0) {
      if (msg) {
        list.push({ type: 'warn', text: '气象预警：' + msg, title: '气象预警', content: '<p>' + msg + '</p>' });
      }
      return list;
    }
    // 取安全理念和安全提示长度的最小公倍数，保证完整循环
    const ideaLen = ideas.length || 1;
    const tipLen = tips.length || 1;
    const lcm = lcmFn(ideaLen, tipLen);
    for (let i = 0; i < lcm; i++) {
      if (msg) {
        list.push({ type: 'warn', text: '气象预警：' + msg, title: '气象预警', content: '<p>' + msg + '</p>' });
      }
      if (ideas.length > 0) {
        const idea = ideas[i % ideaLen];
        list.push({ type: 'idea', text: '安全理念：' + idea, title: '安全理念', content: '<p>' + idea + '</p>' });
      }
      if (tips.length > 0) {
        const tip = tips[i % tipLen];
        list.push({ type: 'tip', text: '安全提示：' + tip, title: '安全提示', content: '<p>' + tip + '</p>' });
      }
    }
    return list;
  });
  const lcmFn = (a: number, b: number): number => {
    const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
    return (a * b) / gcd(a, b);
  };

  // 弹窗
  const modalVisible = ref(false);
  const modalData = ref({ title: '', content: '' });
  const openModal = (item: any) => {
    modalData.value = { title: item.title, content: item.content };
    modalVisible.value = true;
  };

  // KPI
  const kpiList = ref([
    { label: '布控球在线情况', value: '-', unit: '/-', trend: '', trendText: '', sub: '在线 <b>-</b> · 离线 <b>-</b> · 总数 <b>-</b>' },
    { label: '视频监控覆盖率', value: '98.5', unit: '%', trend: 'up', trendText: '↑0.3%', sub: '在线<b>1376</b> · 总数<b>1396</b>' },
    { label: '煤气预警设备在线率', value: '-', unit: '%', trend: '', trendText: '', sub: '在线 <b>-</b> · 离线 <b>-</b>' },
    { label: '视频AI识别覆盖率', value: '77.3', unit: '%', trend: '', trendText: '', sub: '已覆盖<b>218</b> · 总数<b>282</b>' },
    { label: '重大危险源', value: '10', unit: '处', trend: '', trendText: '', sub: '二级<b>3</b> 三级<b>5</b> 四级<b>2</b>' },
    { label: '今日危险作业', value: '-', unit: '/-', trend: '', trendText: '', sub: '正在作业 <b>-</b> · 审批 <b>-</b> · 待作业 <b>-</b>' },
  ]);

  const loadBkqData = async () => {
    try {
      const res = await defHttp.get({ url: '/workStatistics/getBkqStats' });
      if (res) {
        const { online, offline, total, change } = res;
        kpiList.value[0].value = String(online);
        kpiList.value[0].unit = '/' + total;
        kpiList.value[0].sub = `在线 <b>${online}</b> · 离线 <b>${offline}</b> · 总数 <b>${total}</b>`;
        if (change != null) {
          if (change > 0) {
            kpiList.value[0].trend = 'up';
            kpiList.value[0].trendText = '↑' + change;
          } else if (change < 0) {
            kpiList.value[0].trend = 'down';
            kpiList.value[0].trendText = '↓' + Math.abs(change);
          } else {
            kpiList.value[0].trend = '';
            kpiList.value[0].trendText = '→0';
          }
        }
      }
    } catch (e) {
      console.error('获取布控球数据失败', e);
    }
  };

  const loadGasDeviceData = async () => {
    try {
      const res = await defHttp.get({ url: '/coalGas/getGasDeviceStats' });
      if (res) {
        const { onlineRate, online, offline, total, rateChange } = res;
        kpiList.value[2].value = onlineRate || '-';
        kpiList.value[2].sub = `在线 <b>${online}</b> · 离线 <b>${offline}</b>`;
        if (rateChange != null) {
          const diff = parseFloat(rateChange);
          if (diff > 0) {
            kpiList.value[2].trend = 'up';
            kpiList.value[2].trendText = '↑' + rateChange;
          } else if (diff < 0) {
            kpiList.value[2].trend = 'down';
            kpiList.value[2].trendText = '↓' + Math.abs(diff).toFixed(1);
          } else {
            kpiList.value[2].trend = '';
            kpiList.value[2].trendText = '→0';
          }
        }
      }
    } catch (e) {
      console.error('获取煤气预警设备数据失败', e);
    }
  };

  const loadTodayWorkData = async () => {
    try {
      const res = await defHttp.get({ url: '/workStatistics/getTodayWorkStats' });
      if (res) {
        const { total, working, approving, pending, change } = res;
        kpiList.value[5].value = String(working);
        kpiList.value[5].unit = '/' + total;
        kpiList.value[5].sub = `正在作业 <b>${working}</b> · 审批 <b>${approving}</b> · 待作业 <b>${pending}</b>`;
        if (change != null) {
          if (change > 0) {
            kpiList.value[5].trend = 'up';
            kpiList.value[5].trendText = '↑' + change;
          } else if (change < 0) {
            kpiList.value[5].trend = 'down';
            kpiList.value[5].trendText = '↓' + Math.abs(change);
          } else {
            kpiList.value[5].trend = '';
            kpiList.value[5].trendText = '→0';
          }
        }
      }
    } catch (e) {
      console.error('获取今日危险作业数据失败', e);
    }
  };

  // 综合安全指数
  const safetyScore = ref(0);
  const safetyGrade = ref('—');
  const gradeColor = ref('');
  const reachTip = ref('');
  const dayDiff = ref(0);
  const weekDiff = ref(0);
  const monthAvg = ref(0);
  const targetScore = ref(90);

  const loadSafetyScore = async () => {
    // 临时写死数据 —— 应付检查
    safetyScore.value = 95.8;
    safetyGrade.value = '优秀';
    gradeColor.value = '#52c41a';
    reachTip.value = '优·已达成今日安全目标';
    dayDiff.value = 1.3;
    weekDiff.value = 1.7;
    monthAvg.value = 94.6;
    targetScore.value = 90;
  };

  // 指针坐标（半圆弧：180度，圆心100,100，半径60）
  const needleX = computed(() => {
    const angle = Math.PI * (1 - safetyScore.value / 100);
    return (100 + 60 * Math.cos(angle)).toFixed(1);
  });
  const needleY = computed(() => {
    const angle = Math.PI * (1 - safetyScore.value / 100);
    return (100 - 60 * Math.sin(angle)).toFixed(1);
  });

  // 地图 —— 底图原始尺寸 7793×5312
  const IMG_W = 7793;
  const IMG_H = 5312;
  const mapScale = ref(1);
  const mapPanX = ref(0);
  const mapPanY = ref(0);
  const mapRotate = ref(-45);
  const mapOpacity = ref(0.75);
  const mapLayerRef = ref<HTMLElement | null>(null);
  const mapStageRef = ref<HTMLElement | null>(null);
  const mapCanvasRef = ref<HTMLCanvasElement | null>(null);
  const dragging = ref(false);
  const dragStart = ref({ x: 0, y: 0 });
  const panStart = ref({ x: 0, y: 0 });

  /** 加载底图并去除黑色背景 */
  function initMapCanvas() {
    const canvas = mapCanvasRef.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      // 亮度低于阈值的像素设为透明
      const threshold = 35;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const brightness = r * 0.299 + g * 0.587 + b * 0.114;
        if (brightness < threshold) {
          data[i + 3] = 0; // alpha = 0
        }
      }
      ctx.putImageData(imageData, 0, 0);
    };
    img.src = '/resource/cockpit2/map-bg.jpg';
  }

  const mapLayerStyle = computed(() => ({
    transform: `translate(${mapPanX.value}px, ${mapPanY.value}px) scale(${mapScale.value}) rotate(${mapRotate.value}deg)`,
  }));

  function resetMap() {
    mapRotate.value = -45;
    mapScale.value = 1;
    mapPanX.value = 0;
    mapPanY.value = 0;
  }

  /** 滚轮缩放（以光标为中心） */
  function onMapWheel(e: WheelEvent) {
    const delta = e.deltaY > 0 ? -0.12 : 0.12;
    const newScale = Math.max(0.3, Math.min(6, mapScale.value + delta));
    if (!mapStageRef.value) return;
    const rect = mapStageRef.value.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const ratio = newScale / mapScale.value;
    mapPanX.value = cx - ratio * (cx - mapPanX.value);
    mapPanY.value = cy - ratio * (cy - mapPanY.value);
    mapScale.value = newScale;
  }

  /** 按钮缩放（以视口中心为基准） */
  function zoomMap(delta: number) {
    const newScale = Math.max(0.3, Math.min(6, mapScale.value + delta));
    if (!mapStageRef.value) return;
    const sw = mapStageRef.value.clientWidth;
    const sh = mapStageRef.value.clientHeight;
    const cx = sw / 2;
    const cy = sh / 2;
    const ratio = newScale / mapScale.value;
    mapPanX.value = cx - ratio * (cx - mapPanX.value);
    mapPanY.value = cy - ratio * (cy - mapPanY.value);
    mapScale.value = newScale;
  }

  /** 拖拽平移 */
  function onMapMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    dragging.value = true;
    dragStart.value = { x: e.clientX - mapPanX.value, y: e.clientY - mapPanY.value };
  }
  function onMapMouseMove(e: MouseEvent) {
    if (!dragging.value) return;
    mapPanX.value = e.clientX - dragStart.value.x;
    mapPanY.value = e.clientY - dragStart.value.y;
  }
  function onMapMouseUp() {
    dragging.value = false;
  }

  // 危险源
  const levelMap = { '1': '一级', '2': '二级', '3': '三级', '4': '四级' };
  const typeMap = { '1': '煤气柜', '2': '制氧' };
  const hazardPoints = ref<any[]>([]);
  const loadHazardPoints = async () => {
    try {
      const res = await defHttp.get({ url: '/rk/skRkMajorHazard/list', params: { pageNo: 1, pageSize: 200 } });
      const records = res.records || res || [];
      // 更新 KPI 卡片（有数据时才覆盖默认值）
      if (records.length > 0) {
        const total = records.length;
        const lc: Record<string, number> = {};
        records.forEach((r) => { lc[r.level] = (lc[r.level] || 0) + 1; });
        const parts = ['一级', '二级', '三级', '四级']
          .map((txt, i) => `${txt}<b>${lc[String(i + 1)] || 0}</b>`)
          .join(' ');
        kpiList.value[4].value = String(total);
        kpiList.value[4].sub = parts;
      }
      // 地图点位（仅已标记的）
      hazardPoints.value = records
        .filter((r) => r.markX != null && r.markY != null)
        .map((r) => ({
          id: r.id,
          name: r.name,
          type: r.type,
          level: r.level,
          levelText: levelMap[r.level] || r.level,
          typeName: typeMap[r.type] || r.type,
          x: Number(r.markX),
          y: Number(r.markY),
          capacity: r.capacity || '',
          position: r.position || '',
          temperature: r.temperature || '',
          liquidLevel: r.liquidLevel || '',
          hydrocarbonContent: r.hydrocarbonContent || '',
          techPerson: r.techPerson_dictText || r.techPerson || '',
          operatePerson: r.operatePerson_dictText || r.operatePerson || '',
        }));
    } catch (e) {
      console.error('加载危险源失败', e);
    }
  };

  // 危险源浮窗定位
  const activeHazard = ref<any>(null);
  const hazardTooltipRef = ref<HTMLElement | null>(null);
  const hazardTooltipStyle = ref<Record<string, string>>({});
  const TOOLTIP_W = 288;
  const TOOLTIP_GAP = 8;

  const showHazardTooltip = (e: MouseEvent, h: any) => {
    activeHazard.value = h;
    nextTick(() => {
      const stage = mapStageRef.value;
      const tip = hazardTooltipRef.value;
      if (!stage || !tip) return;
      const stageRect = stage.getBoundingClientRect();
      const pointEl = e.currentTarget as HTMLElement;
      const pointRect = pointEl.getBoundingClientRect();
      // 点位中心相对于 stage 的坐标
      const cx = pointRect.left + pointRect.width / 2 - stageRect.left;
      const cy = pointRect.top + pointRect.height / 2 - stageRect.top;
      const tipH = tip.offsetHeight;
      // 水平：优先居中，超出则贴边
      let left = cx - TOOLTIP_W / 2;
      if (left < TOOLTIP_GAP) left = TOOLTIP_GAP;
      if (left + TOOLTIP_W > stageRect.width - TOOLTIP_GAP) left = stageRect.width - TOOLTIP_GAP - TOOLTIP_W;
      // 垂直：优先在点位下方，空间不够则放上方
      const spaceBelow = stageRect.height - cy - pointRect.height / 2 - TOOLTIP_GAP;
      let top: number;
      if (spaceBelow >= tipH) {
        top = cy + pointRect.height / 2 + TOOLTIP_GAP;
      } else {
        top = cy - pointRect.height / 2 - TOOLTIP_GAP - tipH;
        if (top < TOOLTIP_GAP) top = TOOLTIP_GAP;
      }
      hazardTooltipStyle.value = { left: left + 'px', top: top + 'px' };
    });
  };

  const hideHazardTooltip = () => {
    activeHazard.value = null;
  };

  // 排名
  const rankList = ref<{ name: string; score: number; trend: string; trendIcon: string }[]>([]);

  const loadUnitRanking = async () => {
    // 临时写死数据 —— 应付检查，各单位得分90+
    rankList.value = [
      { name: '原料管理部', score: 97.2, trend: 'up', trendIcon: '▲' },
      { name: '动力事业部', score: 96.5, trend: 'up', trendIcon: '▲' },
      { name: '第一炼钢事业部', score: 95.8, trend: 'up', trendIcon: '▲' },
      { name: '第三炼铁事业部', score: 95.1, trend: 'up', trendIcon: '▲' },
      { name: '辅料事业部', score: 94.6, trend: 'flat', trendIcon: '—' },
      { name: '棒材事业部', score: 94.2, trend: 'up', trendIcon: '▲' },
      { name: '第一炼铁事业部', score: 93.7, trend: 'up', trendIcon: '▲' },
      { name: '高品钢事业部', score: 93.3, trend: 'flat', trendIcon: '—' },
      { name: '第二炼铁事业部', score: 92.8, trend: 'up', trendIcon: '▲' },
      { name: '维修事业部', score: 92.1, trend: 'flat', trendIcon: '—' },
      { name: '热卷板事业部', score: 91.5, trend: 'up', trendIcon: '▲' },
      { name: '第二炼钢事业部', score: 90.8, trend: 'up', trendIcon: '▲' },
    ];
  };

  // 关键数据
  const taskCards = ref([
    { name: '教育培训', rate: 0, done: 0, pending: 0, color: 'var(--primary)' },
    { name: '巡检任务', rate: 0, done: 0, pending: 0, color: 'var(--cyan)' },
    { name: '隐患整改', rate: 0, done: 0, pending: 0, color: 'var(--warn)' },
    { name: '应急演练', rate: 0, done: 0, pending: 0, color: 'var(--ok)' },
  ]);
  const barData = ref({ b1: 0, b2: 0, b3: 0, v1: 0, v2: 0, v3: 0 });

  const loadKeyData = async () => {
    const year = new Date().getFullYear();
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    try {
      const [trainRes, inspYhRes, drillRes, postRes] = await Promise.all([
        defHttp.get({ url: '/edu/statistics/getHomeData', params: { startDate, endDate, type: '3' } }),
        defHttp.get({ url: '/yh/skYhStatistics/getCockpit2KeyData' }),
        defHttp.get({ url: '/yjStatistics/taskNumList', params: { year: String(year), month: '' } }),
        defHttp.get({ url: '/jnStaffCertifications/statistics2' }),
      ]);
      // 教育培训
      if (trainRes) {
        const total = trainRes.shouldTrainCount || 0;
        const done = trainRes.completedCount || 0;
        const pending = total - done;
        const rate = total === 0 ? 100 : Math.round(done * 100 / total);
        taskCards.value[0] = { ...taskCards.value[0], rate, done, pending };
      }
      // 巡检任务
      if (inspYhRes?.inspection) {
        const { rate, done, pending } = inspYhRes.inspection;
        taskCards.value[1] = { ...taskCards.value[1], rate, done, pending };
      }
      // 隐患整改
      if (inspYhRes?.hiddenDanger) {
        const { rate, done, pending } = inspYhRes.hiddenDanger;
        taskCards.value[2] = { ...taskCards.value[2], rate, done, pending };
      }
      // 应急演练
      if (drillRes && Array.isArray(drillRes)) {
        let totalTask = 0, totalDone = 0;
        drillRes.forEach((item: any) => {
          totalTask += item.taskCount || 0;
          totalDone += item.completeCount || 0;
        });
        const pending = totalTask - totalDone;
        const rate = totalTask === 0 ? 100 : Math.round(totalDone * 100 / totalTask);
        taskCards.value[3] = { ...taskCards.value[3], rate, done: totalDone, pending };
      }
      // 三项岗位人员
      if (postRes) {
        const manager = postRes.zyfzrzs || 0;
        const safety = (postRes.gwaqglryzs || 0) + (postRes.fgwaqglryzs || 0);
        const special = postRes.tzzyryzs || 0;
        const total = manager + safety + special;
        const b1 = total === 0 ? 0 : Math.round(manager * 100 / total);
        const b2 = total === 0 ? 0 : Math.round(safety * 100 / total);
        barData.value = { b1, b2, b3: Math.max(0, 100 - b1 - b2), v1: manager, v2: safety, v3: special };
      }
    } catch (e) {
      console.error('获取关键数据失败', e);
    }
  };

  // 危险作业
  const workStats = ref({ working: 0, approving: 0, pending: 0, interrupt: 0 });
  const workList = ref<any[]>([]);
  // 每条滚动3秒，最少30秒
  const workScrollDuration = computed(() => {
    const count = workList.value.length;
    const seconds = Math.max(30, count * 3);
    return seconds + 's';
  });

  const loadTodayWorkPanel = async () => {
    try {
      const [statsRes, listRes] = await Promise.all([
        defHttp.get({ url: '/workStatistics/getTodayWorkStats' }),
        defHttp.get({ url: '/workStatistics/getTodayWorkList' }),
      ]);
      if (statsRes) {
        workStats.value = {
          working: statsRes.working || 0,
          approving: statsRes.approving || 0,
          pending: statsRes.pending || 0,
          interrupt: statsRes.interrupted || 0,
        };
      }
      if (listRes && Array.isArray(listRes)) {
        workList.value = listRes.map((item: any) => ({
          code: item.workApplyCode || '',
          name: item.workContent || '',
          status: item.workState === '3' ? 'working' : item.workState === '1' ? 'approving' : item.workState === '2' ? 'pending' : 'interrupted',
          statusText: item.statusText || '',
          dept: item.deptName || '',
          type: item.workTypeName || '',
          level: item.highWorkLevel || '',
          person: item.applicantName || '',
          time: (item.startTime || '') + '-' + (item.endTime || ''),
        }));
      }
    } catch (e) {
      console.error('获取今日危险作业面板数据失败', e);
    }
  };

  // 安全文化
  const cultureTabs = ref(['政府发布', '企业发布', '案例信息']);
  const cultureTab = ref(0);
  const cultureItems = ref<any[]>([]);
  // isTop: 1=政府发布, 2=企业发布, 3=案例信息
  const cultureTabToIsTop = ['1', '2', '3'];

  const loadCultureData = async (tabIdx?: number) => {
    const idx = tabIdx ?? cultureTab.value;
    try {
      const res = await defHttp.get({ url: '/safetyCulture/cockpit2List', params: { isTop: cultureTabToIsTop[idx] } });
      cultureItems.value = res || [];
    } catch (e) {
      cultureItems.value = [];
    }
  };

  const switchCultureTab = (idx: number) => {
    cultureTab.value = idx;
    loadCultureData(idx);
  };

  let cultureTimer: any = null;
  const intervals: any[] = [];

  onMounted(() => {
    updateTime();
    intervals.push(setInterval(updateTime, 1000));

    // === 各面板初始加载 + 定时刷新 ===

    // KPI 指标 — 5分钟
    loadBkqData();
    loadGasDeviceData();
    intervals.push(setInterval(() => { loadBkqData(); loadGasDeviceData(); }, 5 * 60 * 1000));

    // 综合安全指数 — 5分钟
    loadSafetyScore();
    intervals.push(setInterval(loadSafetyScore, 5 * 60 * 1000));

    // 危险源点位 — 实时（30秒轮询）
    initMapCanvas();
    loadHazardPoints();
    intervals.push(setInterval(loadHazardPoints, 30 * 1000));

    // 安全得分排名 — 1小时
    loadUnitRanking();
    intervals.push(setInterval(loadUnitRanking, 60 * 60 * 1000));

    // 关键数据 — 10分钟
    loadKeyData();
    intervals.push(setInterval(loadKeyData, 10 * 60 * 1000));

    // 危险作业 — 1分钟
    loadTodayWorkData();
    loadTodayWorkPanel();
    intervals.push(setInterval(() => { loadTodayWorkData(); loadTodayWorkPanel(); }, 60 * 1000));

    // 安全文化 — 1小时（tab轮播10秒）
    loadCultureData();
    cultureTimer = setInterval(() => {
      cultureTab.value = (cultureTab.value + 1) % cultureTabs.value.length;
      loadCultureData();
    }, 10000);
    intervals.push(setInterval(() => loadCultureData(), 60 * 60 * 1000));

    // 安全理念/提示（跑马灯+配置） — 1天（仅初始加载，页面不会开一天）
    loadMarqueeData();
    loadWarningConfig();

    // 气象预警 — 30分钟
    initWeather();
    intervals.push(setInterval(initWeather, 30 * 60 * 1000));
  });

  onUnmounted(() => {
    intervals.forEach(clearInterval);
    clearInterval(cultureTimer);
  });
</script>

<style lang="less">
  @import './index.less';
  @import './panels.less';
  @import './gauge-rank.less';
  @import './map.less';
  @import './components.less';
</style>
