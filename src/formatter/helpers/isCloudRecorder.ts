import { existsSync } from "fs";

const isCloudRecorderFunc = () => {
  return existsSync("/tmp/pod_publish.sh");
};

export const isCloudRecorder = isCloudRecorderFunc();
