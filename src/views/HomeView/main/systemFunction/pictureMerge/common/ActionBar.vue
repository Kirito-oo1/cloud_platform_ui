<template>
  <div>
    <div>
      <el-row text-xs-left caption justify-space-between pr-2 align-center>
        <span
          :style="{
            position: 'relative',
          }"
        >
          {{ inputButtonsTitle }}

          <el-button
            @click="$emit('load-default-images')"
            flat
            icon
            color="accent"
            :style="{
              position: 'absolute',
              top: '0',
              right: '0',
              transform: 'translateY(-42%) translateX(120%)',
            }"
          >
            <el-icon :size="14">
              <i class="el-icon-refresh">cached</i>
            </el-icon>
          </el-button>
        </span>

        <span v-if="!workerReady" :style="{ color: '#3f51b5' }"> Loading OpenCV {{ timeStr(currentLoadingTime) }} </span>
        <span v-else-if="workerBusyCompute || (workerBusyImage && !showStatusInfo && currentComputeTime && workerActionInfoMessage)" :style="{ color: !workerActionInfoError ? '#3f51b5' : red }">
          {{ timeStr(currentComputeTime) + ", " + workerActionInfoMessage }}
        </span>
        <span v-else-if="(inputBusyImage || resultValid) && !showStatusInfo && transitionDone && workerActionInfoMessage" :style="{ color: !workerActionInfoError ? '#3f51b5' : red }">
          {{ workerActionInfoMessage }} ...
        </span>
        <span v-else-if="resultValid && !showStatusInfo && transitionDone">
          <span
            :style="{
              color: red,
              cursor: 'pointer',
            }"
            @click="$emit('delete-result')"
          >
            <strong>▶ Clear image</strong>
          </span>

          <span
            v-if="enableSaveImage"
            :style="{
              color: '#3f51b5',
              cursor: workerBusyImage ? 'wait' : 'pointer',
              'padding-left': '1rem',
              'padding-right': '0.2rem',
              opacity: workerBusyImage ? '0.5' : '1.0',
            }"
            @click="workerBusyImage ? () => {} : $emit('save-result')"
          >
            <strong>▶ Save image</strong>
          </span>
        </span>

        <transition name="status-info" @after-enter="afterEnter" @after-leave="afterLeave">
          <span v-if="showStatusInfo && workerActionInfoError && computeSuccess === 1" :style="{ color: red }">
            <strong>{{ workerActionInfoError }}, time {{ timeStr(computeTimeTotal) }}</strong>
          </span>
          <span v-else-if="showStatusInfo && computeSuccess === 1" :style="{ color: 'green' }">
            <strong>Success, time {{ timeStr(computeTimeTotal) }}</strong>
          </span>

          <span v-else-if="showStatusInfo && computeSuccess === 2" :style="{ color: red }">
            <strong>Low confidence result, time {{ timeStr(computeTimeTotal) }}</strong>
          </span>
          <span v-else-if="showStatusInfo && computeSuccess === 0" :style="{ color: red }">
            <strong>{{ failText }}</strong>
          </span>
          <span v-else-if="showStatusInfo && workerErrorMessage" :style="{ color: red }">
            <strong>{{ workerErrorMessage }}</strong>
          </span>
        </transition>
      </el-row>

      <el-row :gutter="10" type="flex" align="center" justify="start">
        <el-col :span="24">
          <el-row v-if="!multiple">
            <app-upload-button
              v-for="(imageName, index) of $store.getters['input/allImageNames']"
              :key="imageName"
              :unique-id="true"
              :style="{ padding: '0 0.2rem 0 0' }"
              :title="`${index + 1} ...`"
              :disabled="workerBusy || inputBusyImage"
              :accept="'image/*'"
              :multiple="multiple"
              small
              :file-changed-callback="(file) => onFileChanged(imageName, file)"
              @file-selection-started="$store.commit('input/busy', { name: imageName, value: true })"
              @file-selection-ended="$store.commit('input/busy', { name: imageName, value: false })"
            />
          </el-row>
          <el-row v-else>
            <app-upload-button
              :key="'multiStitch'"
              :unique-id="true"
              :style="{ padding: '0 0.2rem 0 0' }"
              :title="`Images ...`"
              :disabled="workerBusy || inputBusyImage"
              :accept="'image/*'"
              :multiple="multiple"
              small
              :file-changed-callback="(files) => onMultiFileChanged(files)"
              @file-selection-started="$store.commit('multiInput/busyLoading', true)"
              @file-selection-ended="$store.commit('multiInput/busyLoading', false)"
            />
            <el-button
              :style="{
                padding: '0 0.2rem 0 0',
                margin: '0',
                'text-transform': 'none !important',
              }"
              small
              type="text"
              :disabled="deleteDisabled"
              @click="$emit('delete-click')"
            >
              Delete
            </el-button>
          </el-row>
        </el-col>

        <el-col :span="24">
          <el-row justify="end" align="center">
            <el-button
              :style="{
                'text-transform': 'none !important',
                position: 'relative',
              }"
              :type="workerBusyCompute && kill != null ? 'danger' : 'text'"
              :disabled="computeButtonDisabled"
              small
              @click="workerBusyCompute && kill != null ? runKill() : runCompute()"
            >
              {{ workerBusyCompute && kill != null ? "Abort" : actionText }}
            </el-button>
          </el-row>
        </el-col>
      </el-row>

      <app-view-spacer mtop="0.5rem" />
    </div>
  </div>
</template>

<script>
  import UploadButton from "../gui/UploadButton";
  import ViewSpacer from "../layout/ViewSpacer";

  export default {
    components: {
      AppUploadButton: UploadButton,
      AppViewSpacer: ViewSpacer,
    },
    props: {
      compute: {
        type: Function,
        required: true,
      },
      kill: {
        type: Function,
        default: null,
      },
      computeSuccess: {
        validator(value) {
          return [0, 1, 2, null].indexOf(value) !== -1;
        },
        required: true,
      },
      workerReady: {
        type: Boolean,
        required: true,
      },
      workerBusyCompute: {
        type: Boolean,
        required: true,
      },
      workerBusyImage: {
        type: Boolean,
        required: true,
      },
      workerActionInfo: {
        type: String,
        default: "",
      },
      workerActionInfoError: {
        type: String,
        required: true,
        default: "",
      },
      workerlastCompletedActionTime: {
        type: Number,
        default: 0,
      },
      inputBusyImage: {
        type: Boolean,
        required: true,
      },
      failText: {
        type: String,
        default: "No match found!",
      },
      actionText: {
        type: String,
        default: "Match!",
      },
      actionButtonDisabledCondition: {
        type: Boolean,
        default: false,
      },
      resultValid: {
        type: Boolean,
        default: false,
      },
      multiple: {
        type: Boolean,
        default: false,
      },
      deleteDisabled: {
        type: Boolean,
        default: false,
      },
      enableSaveImage: {
        type: Boolean,
        default: false,
      },
      inputButtonsTitle: {
        type: String,
        default: "",
      },
    },
    created() {
      this.startIntervalCurrentLoadingTime();
    },
    data() {
      return {
        showStatusInfo: false,
        transitionDone: true,
        computeTimeTotal: 0,
        killCalled: false,
      };
    },
    computed: {
      workerErrorMessage() {
        const error = this.$store.getters["worker/error"];
        if (!error) return null;
        return error.message || "Error!";
      },
      workerActionInfoMessage() {
        const msg = this.workerActionInfoError ? this.workerActionInfoError : this.workerActionInfo;

        if (!msg && this.inputBusyImage) {
          return "Loading image/s";
        }

        return msg && msg.length > 50 ? msg.substring(0, 50) : msg;
      },
      workerBusy() {
        return this.workerBusyCompute || this.workerBusyImage;
      },
      computeButtonDisabled() {
        return (
          this.actionButtonDisabledCondition ||
          this.showStatusInfo ||
          !this.workerReady ||
          (!this.multiple && !this.$store.getters["input/allImageDataValid"]) ||
          (this.multiple && this.$store.getters["multiInput/imageCount"] <= 1) ||
          //|| this.workerBusy
          (this.workerBusyCompute && this.kill == null) ||
          (this.multiple && this.inputBusyImage)
        );
      },
      currentComputeTime() {
        return this.$store.getters["worker/currentComputeTime"];
      },
      currentLoadingTime() {
        return this.$store.getters["worker/currentLoadingTime"];
      },
    },
    methods: {
      onFileChanged(name, file) {
        this.$store.dispatch("input/imageFile", { name, file });
      },
      onMultiFileChanged(files) {
        this.$emit("multi-input-files-changed", files);
      },
      afterEnter() {
        this.showStatusInfo = false;
        this.transitionDone = false;
      },
      afterLeave() {
        this.transitionDone = true;
        this.setCurrentComputeTime(null);
      },
      runKill() {
        this.killCalled = true;
        this.kill();
      },
      async runCompute() {
        this.killCalled = false;
        this.showStatusInfo = false;
        this.startIntervalCurrentComputeTime();
        const startTime = new Date();

        await this.compute();

        this.computeTimeTotal = new Date() - startTime;
        if (!this.killCalled) {
          this.showStatusInfo = true;
          setTimeout(() => {
            // just to be on the save side
            this.showStatusInfo = false;
          }, 10000);
        }
      },
      startIntervalCurrentComputeTime() {
        const startTime = new Date();
        this.setCurrentComputeTime(0);

        if (!this.showStatusInfo) {
          const intervalId = setInterval(() => {
            this.setCurrentComputeTime(new Date() - startTime);
            if (this.showStatusInfo || this.killCalled) {
              clearInterval(intervalId);
              if (this.killCalled) this.killCalled = false;
            }
          }, 100);
        }
      },
      startIntervalCurrentLoadingTime() {
        if (this.currentLoadingTime) {
          return;
        }

        const startTime = new Date();
        this.setCurrentLoadingTime(0);

        if (!this.workerReady) {
          const intervalId = setInterval(() => {
            this.setCurrentLoadingTime(new Date() - startTime);
            if (this.workerReady) {
              clearInterval(intervalId);
              this.setCurrentLoadingTime(null);
            }
          }, 150);
        }
      },
      timeStr(timeMs) {
        if (timeMs <= 0) return "";

        const timeM = Math.floor(timeMs / 60000.0);
        const timeS = timeMs / 1000.0 - timeM * 60.0;

        if (timeM >= 1) {
          return `${timeM} m ${Math.floor(timeS)} s`;
        }
        if (timeS > 10) {
          return `${timeS.toFixed(1)} s`;
        }

        return `${timeS.toFixed(2)} s`;

        // const timeS = timeMs / 1000.0;
        // const timeM = timeMs / 60000.0;

        // if(timeMs < 1000) {
        //   return timeMs + ' ms';
        // }
        // if(timeMs < 10000) {
        //   return (timeMs / 1000.0).toFixed(3) + ' s';
        // }
        // if(timeMs < 100000) {
        //   return (timeMs / 1000.0).toFixed(2) + ' s';
        // }
        // if(timeMs < 600000) {
        //   return (timeMs / 1000.0).toFixed(1) + ' s';
        // }

        // const m = (timeMs / 600000).toFixed(0);
        // const s = ((timeMs - (600000 * m)) / 1000.0).toFixed(0);

        // return `${m} m, ${s} s`;
      },
      setCurrentComputeTime(value) {
        this.$store.commit("worker/currentComputeTime", value);
      },
      setCurrentLoadingTime(value) {
        this.$store.commit("worker/currentLoadingTime", value);
      },
    },
  };
</script>

<style scoped>
  .status-info-enter {
    opacity: 1;
  }
  .status-info-enter-to {
    opacity: 0;
  }
  .status-info-leave {
    opacity: 0;
  }
  .status-info-leave-active {
    transition: opacity 0s;
  }
  .status-info-enter-active {
    transition: opacity 6s ease-in;
  }
</style>
