<template>
  <app-view-layout :title="'Multistitcher'" style="margin-left: 100px; width: 95%; height: 95%">
    <template slot="rightElem">
      <div :style="{ 'padding-right': '0.2rem' }">
        <span :style="{ 'white-space': 'nowrap' }">
          detector: <strong>{{ detTypeName }} </strong>
        </span>
      </div>
    </template>
    <template slot="leftElem">
      <div
        :style="{
          'padding-right': '0.2rem',
          'padding-left': '1rem',
          color: '#3f51b5',
          cursor: 'pointer',
        }"
        @click="switchSettingsDisplay"
      >
        <span :style="{ 'white-space': 'nowrap' }">
          <strong v-if="$store.getters['settings/multiStitcherSettingsOn']">▲ Settings</strong>
          <strong v-else>▼ Settings</strong>
        </span>
      </div>
    </template>

    <div>
      <app-action-bar
        :compute="multiStitch"
        :kill="() => $store.dispatch('worker/reload')"
        :compute-success="$store.getters['worker/results/success'](multiStitchName)"
        :worker-ready="$store.getters['worker/ready']"
        :worker-busy-compute="$store.getters['worker/busyCompute']"
        :worker-busy-image="$store.getters['worker/busyImage']"
        :worker-action-info="$store.getters['worker/currentActionInfo']"
        :worker-action-info-error="$store.getters['logs/currentErrorMessage']"
        :input-busy-image="$store.getters['multiInput/busy'] || $store.getters['multiInput/busyLoading']"
        :fail-text="errorText"
        :action-text="'Stitch!'"
        :result-valid="$store.getters['worker/results/imageDataValid'](multiStitchName)"
        :multiple="true"
        :delete-disabled="$store.getters['multiInput/imageCount'] == 0"
        :enable-save-image="true"
        :inputButtonsTitle="'Choose input'"
        @delete-result="deleteResult"
        @delete-click="deleteAllOrSelectedInputImages"
        @save-result="saveImage"
        @multi-input-files-changed="multiInputFilesChanged"
        @load-default-images="loadDefaultImages"
      />
      <!-- 设置栏 -->
      <div v-if="$store.getters['settings/multiStitcherSettingsOn']">
        <el-tabs v-model="activeTabIndexMultiStitcher" :style="{ height: '30px' }" @tab-click="handleTabChange" tab-position="top" type="card">
          <el-tab-pane v-for="(groupKey, index) in groupKeysMultiStitcherSettings" :key="index" :label="paramGroupName(groupKey)">
            <app-multi-stitcher-camera-settings
              v-if="groupKey === 'multiStitcherCamera'"
              :params="params(groupKey)"
              :showFieldOfView="!camEstimationOn"
              :enableFieldOfView="selectedIndices.length > 0"
              :fieldOfView="fieldOfView"
              :fieldOfViewDefaultValue="fieldOfViewDefaultValue"
              @change="paramChanged"
              @fieldOfViewChange="setFieldOfView"
            />

            <app-multi-stitcher-seams-settings v-if="groupKey === 'multiStitcherSeams'" :params="params(groupKey)" @change="paramChanged" />

            <app-multi-stitcher-image-settings v-if="groupKey === 'multiStitcherImage'" :params="params(groupKey)" @change="paramChanged" />

            <app-multi-stitcher-confidence-settings v-if="groupKey === 'multiStitcherConfidence'" :params="params(groupKey)" @change="paramChanged" />

            <app-multi-stitcher-memory-settings v-if="groupKey === 'multiStitcherMemory'" :params="params(groupKey)" @change="paramChanged" />

            <app-multi-stitcher-stitch-settings v-if="groupKey === 'multiStitcherStitchOrder'" :params="params(groupKey)" @change="paramChanged" />
          </el-tab-pane>
        </el-tabs>

        <app-view-spacer mtop="0px" />
      </div>
      <!-- 拼接结果展示 -->
      <el-row v-if="resultValid" justify-center>
        <app-image-result :image-url="$store.getters['worker/results/imageDataUrl'](multiStitchName)" :image-name="multiStitchName" :canDrag="false" />
      </el-row>
      <!-- 照片列表 -->
      <app-multi-input-images
        :imageUrlArray="$store.getters['multiInput/imageDataUrlsArray']"
        :imageKeyArray="$store.getters['multiInput/imageDataKeyArray']"
        :fieldOfViewArray="$store.getters['multiInput/imageFieldOfViewArray']"
        :indicesSelected="$store.getters['multiInput/indicesSelected']"
        @imageClicked="(index) => $store.commit('multiInput/imageClicked', index)"
        @swap="swapImagesInputImages"
      />
    </div>
  </app-view-layout>
</template>

<script>
  import ViewLayout from "./layout/ViewLayout.vue";
  import ViewSpacer from "./layout/ViewSpacer";
  import ActionBar from "./common/ActionBar";
  import MultiInputImages from "./common/MultiInputImages";
  import ImageResult from "./common/ImageResult";
  import MultiStitcherCameraSettings from "./settings/MultiStitcherCameraSettings.vue";
  import MultiStitcherImageSettings from "./settings/MultiStitcherImageSettings";
  import MultiStitcherStitchSettings from "./settings/MultiStitcherStitchSettings";
  import MultiStitcherSeamsSettings from "./settings/MultiStitcherSeamsSettings";
  import MultiStitcherMemorySettings from "./settings/MultiStitcherMemorySettings";
  import MultiStitcherConfidenceSettings from "./settings/MultiStitcherConfidenceSettings";
  import { multiStitchName } from "./models/constants/images";
  import { paramTypes, paramGroups, ParamUtils } from "./models/constants/params";

  export default {
    name: "MultiStitcher",
    components: {
      AppViewLayout: ViewLayout,
      AppViewSpacer: ViewSpacer,
      AppActionBar: ActionBar,
      AppImageResult: ImageResult,
      AppMultiInputImages: MultiInputImages,
      AppMultiStitcherImageSettings: MultiStitcherImageSettings,
      AppMultiStitcherCameraSettings: MultiStitcherCameraSettings,
      AppMultiStitcherStitchSettings: MultiStitcherStitchSettings,
      AppMultiStitcherSeamsSettings: MultiStitcherSeamsSettings,
      AppMultiStitcherMemorySettings: MultiStitcherMemorySettings,
      AppMultiStitcherConfidenceSettings: MultiStitcherConfidenceSettings,
    },
    created() {
      this.$store.dispatch("multiInput/init");
      this.$store.dispatch("worker/load");
    },
    computed: {
      multiStitchName() {
        return multiStitchName;
      },
      selectedIndices() {
        return this.$store.getters["multiInput/indicesSelected"];
      },
      fieldOfView() {
        return this.selectedIndices.length > 0 ? this.$store.getters["multiInput/imageFieldOfView"](this.selectedIndices[0]) + "" : "";
      },
      fieldOfViewDefaultValue() {
        return this.selectedIndices.length > 0 ? this.$store.getters["multiInput/imageFieldOfViewInitial"](this.selectedIndices[0]) + "" : "";
      },
      resultValid() {
        return this.$store.getters["worker/results/imageDataValid"](multiStitchName);
      },
      errorText() {
        const e = this.$store.getters["worker/error"];
        if (e && e.message) return e.message;
        return "No match found!";
      },
      detTypeName() {
        return ParamUtils.getParamName(this.$store.getters["settings/param"](paramTypes.detType.id));
      },
      camEstimationOn() {
        return this.$store.getters["settings/param"](paramTypes.multiStitch_camEstimate.id);
      },
    },
    data() {
      return {
        settingsOn: false,
        groupKeysMultiStitcherSettings: ["multiStitcherCamera", "multiStitcherSeams", "multiStitcherImage", "multiStitcherConfidence", "multiStitcherMemory", "multiStitcherStitchOrder"],
      };
    },
    methods: {
      async multiStitch() {
        await this.$store.dispatch("multiInput/reloadFilesFromDiscIf");

        await this.$store.dispatch("worker/computeMultiStitchImageInSteps", {
          images: this.$store.getters["multiInput/imageDataArray"],
          fieldsOfView: this.$store.getters["multiInput/imageFieldOfViewArray"],
          settings: this.$store.getters["settings/settings"],
        });
      },
      deleteWorkerData() {
        //this.$store.commit('worker/results/imageData', { name: multiStitchName, imageData: null });
        this.$store.dispatch("worker/multiStitchResetWorkerData");
      },
      deleteResult() {
        this.$store.commit("worker/results/imageData", { name: multiStitchName, imageData: null });
        //this.$store.dispatch('worker/multiStitchResetWorkerData');
      },
      loadDefaultImages() {
        this.$store.dispatch("multiInput/loadDefaultImages");
        this.deleteWorkerData();
      },
      deleteAllOrSelectedInputImages() {
        this.$store.dispatch("multiInput/removeAllOrSelected");
        this.deleteWorkerData();
      },
      swapImagesInputImages({ indexFrom, indexTo }) {
        this.$store.commit("multiInput/swap", { indexFrom, indexTo });
        this.deleteWorkerData();
      },
      saveImage() {
        this.$store.dispatch("worker/saveResultImage", { name: multiStitchName, imageFileName: "MultiStitcherImage.png" });
      },
      async multiInputFilesChanged(files) {
        this.deleteWorkerData();
        await this.$store.dispatch("multiInput/imageFiles", files);
      },
      params(groupKey) {
        return this.$store.getters["settings/settings"].paramsByGroupKey(groupKey);
      },
      paramGroupName(key) {
        return paramGroups[key].name;
      },
      switchSettingsDisplay() {
        if (this.$store.getters["settings/multiStitcherSettingsOn"]) {
          this.$store.dispatch("settings/multiStitcherSettingsOn", false);
        } else {
          this.$store.dispatch("settings/multiStitcherSettingsOn", true);
        }
      },
      async paramChanged(obj) {
        await this.$store.dispatch("settings/param", obj);
      },
      setFieldOfView(value) {
        this.selectedIndices.forEach((index) => {
          if (!value) {
            this.$store.commit("multiInput/imageFieldOfViewUpdate", {
              index,
              fieldOfView: this.$store.getters["multiInput/imageFieldOfViewInitial"](index),
            });
          } else {
            this.$store.commit("multiInput/imageFieldOfViewUpdate", {
              index,
              fieldOfView: +value,
            });
          }
        });
      },
    },
  };
</script>

<style lang="less" scoped></style>
