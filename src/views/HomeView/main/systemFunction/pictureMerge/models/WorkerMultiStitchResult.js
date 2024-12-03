import { WorkerResult } from "@/views/HomeView/main/systemFunction/pictureMerge/models/WorkerResult";

export class WorkerMultiStitchResult extends WorkerResult {
  constructor(name, imageDataToUrlFn) {
    super(name, imageDataToUrlFn);

    this._fieldOfView = null;
  }

  get fieldOfView() {
    return this._fieldOfView;
  }
  set fieldOfView(value) {
    this._fieldOfView = value;
  }
}
