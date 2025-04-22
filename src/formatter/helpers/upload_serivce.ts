/* eslint-disable no-console */
import FormData from "form-data";
import { createReadStream, existsSync, write, writeFileSync } from "fs";
import fs from "fs/promises";

import { JsonReport, JsonTestProgress } from "./report_generator";
import { axiosClient } from "../../configuration/axios_client";
import path from "path";
import { logReportLink } from "../bvt_analysis_formatter";
import { ActionEvents, SERVICES_URI } from "./constants";

const REPORT_SERVICE_URL = process.env.REPORT_SERVICE_URL ?? URL;
const BATCH_SIZE = 10;
const MAX_RETRIES = 3;
const REPORT_SERVICE_TOKEN = process.env.TOKEN ?? process.env.REPORT_SERVICE_TOKEN;

export interface RootCauseProps {
  status: boolean;
  analysis: string;
  failedStep: number;
  failClass: string;
}

export interface FinishTestCaseResponse {
  status: true;
  rootCause: RootCauseProps;
  report: JsonTestProgress;
}

class RunUploadService {
  constructor(private runsApiBaseURL: string, private accessToken: string) {}
  async createRunDocument(name: string) {
    try {
      const runDocResult = await axiosClient.post(
        this.runsApiBaseURL + "/cucumber-runs/create",
        {
          name: name ? name : "TEST",
        },
        {
          headers: {
            Authorization: "Bearer " + this.accessToken,
            "x-source": "cucumber_js",
          },
        }
      );
      if (runDocResult.status !== 200) {
        throw new Error("Failed to create run document in the server");
      }
      if (runDocResult.data.status !== true) {
        throw new Error("Failed to create run document in the server");
      }
      return runDocResult.data.run;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log("Warning: Your trial plan has ended. Cannot create or upload reports.");
        process.exit(1);
      }
      throw new Error("Failed to create run document in the server: " + error);
    }
  }
  async upload(formData: FormData) {
    const response = await axiosClient.post(this.runsApiBaseURL + "/cucumber-runs/upload", formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: "Bearer " + this.accessToken,
        "x-source": "cucumber_js",
      },
    });
    if (response.status === 401) {
      console.log("Warning: Your trial plan has ended. Cannot upload reports and perform retraining");
      throw new Error("Warning: Your trial plan has ended. Cannot upload reports and perform retraining");
    }
    if (response.status !== 200) {
      throw new Error("Failed to upload run to the server");
    }
    if (response.data.status !== true) {
      throw new Error("Failed to upload run to the server");
    }
  }
  async getPreSignedUrls(fileUris: string[], runId: string) {
    const response = await axiosClient.post(
      this.runsApiBaseURL + "/cucumber-runs/generateuploadurls",
      {
        fileUris,
        runId,
      },
      {
        headers: {
          Authorization: "Bearer " + this.accessToken,
          "x-source": "cucumber_js",
        },
      }
    );
    if (response.status === 403) {
      console.log("Warning: Your trial plan has ended. Cannot upload reports and perform retraining");
      throw new Error("Warning: Your trial plan has ended. Cannot upload reports and perform retraining");
    }
    if (response.status !== 200) {
      throw new Error("Failed to get pre-signed urls for the files");
    }
    if (response.data.status !== true) {
      throw new Error("Failed to get pre-signed urls for the files");
    }

    return response.data.uploadUrls;
  }

  async uploadTestCase(
    testCaseReport: JsonTestProgress,
    runId: string,
    projectId: string,
    reportFolder: string,
    rerunId?: string
  ) {
    const fileUris = [];
    //iterate over all the files in the JsonCommand.screenshotId and insert them into the fileUris array
    for (const step of testCaseReport.steps) {
      for (const command of step.commands) {
        if (command.screenshotId) {
          fileUris.push("screenshots" + "/" + String(command.screenshotId) + ".png");
        }
      }
      if (step.traceFilePath) {
        fileUris.push("trace" + "/" + step.traceFilePath);
      }
    }
    // console.log({ fileUris })
    const preSignedUrls = await this.getPreSignedUrls(fileUris, runId);
    //upload all the files in the fileUris array
    try {
      for (let i = 0; i < fileUris.length; i += BATCH_SIZE) {
        const batch = fileUris.slice(i, Math.min(i + BATCH_SIZE, fileUris.length));
        await Promise.all(
          batch
            .filter((fileUri) => preSignedUrls[fileUri])
            .map(async (fileUri) => {
              for (let j = 0; j < MAX_RETRIES; j++) {
                if (existsSync(path.join(reportFolder, fileUri))) {
                  const success = await this.uploadFile(path.join(reportFolder, fileUri), preSignedUrls[fileUri]);
                  if (success) {
                    return;
                  }
                const success = await this.uploadFile(
                  path.join(reportFolder, fileUri),
                  preSignedUrls[fileUri]
                )
                if (success) {
                  return
                }
              }
              console.error("Failed to upload file:", fileUri);
            })
        );
      }

      // writeFileSync("report.json", JSON.stringify(testCaseReport, null, 2))
      const { data } = await axiosClient.post<FinishTestCaseResponse>(
        this.runsApiBaseURL + "/cucumber-runs/createNewTestCase",
        {
          runId,
          projectId,
          testProgressReport: testCaseReport,
          mode: process.env.MODE === "cloud" ? "cloud" : "local",
          browser: process.env.BROWSER ? process.env.BROWSER : "chromium",
          rerunId,
        },
        {
          headers: {
            Authorization: "Bearer " + this.accessToken,
            "x-source": "cucumber_js",
          },
        }
      );

      try {
        await axiosClient.post(
          `${SERVICES_URI.STORAGE}/event`,
          {
            event: ActionEvents.upload_report,
          },
          {
            headers: {
              Authorization: "Bearer " + this.accessToken,
              "x-source": "cucumber_js",
              "x-bvt-project-id": projectId,
            },
          }
        );
      } catch (error) {
        // no event tracking
      }
      logReportLink(runId, projectId);
      return data;
    } catch (e) {
      console.error(`failed to upload the test case: ${testCaseReport.id} ${e}`);
      return null;
    }
  }
  async uploadFile(filePath: string, preSignedUrl: string) {
    const fileStream = createReadStream(filePath);
    let success = true;
    try {
      const fileStats = await fs.stat(filePath);
      const fileSize = fileStats.size;

      await axiosClient.put(preSignedUrl, fileStream, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": fileSize,
        },
      });
    } catch (error) {
      if (process.env.NODE_ENV_BLINQ === "dev") {
        console.error("Error uploading file:", error);
      }
      success = false;
    } finally {
      fileStream.close();
    }
    return success;
  }
  async uploadComplete(runId: string, projectId: string) {
    const response = await axiosClient.post(
      this.runsApiBaseURL + "/cucumber-runs/uploadCompletion",
      {
        runId,
        projectId,
        mode: process.env.MODE === "cloud" ? "cloud" : "local",
        browser: process.env.BROWSER ? process.env.BROWSER : "chromium",
      },
      {
        headers: {
          Authorization: "Bearer " + this.accessToken,
          "x-source": "cucumber_js",
        },
      }
    );
    if (response.status !== 200) {
      throw new Error("Failed to mark run as complete");
    }
    if (response.data.status !== true) {
      throw new Error("Failed to mark run as complete");
    }

    try {
      await axiosClient.post(
        `${SERVICES_URI.STORAGE}/event`,
        {
          event: ActionEvents.upload_report,
        },
        {
          headers: {
            Authorization: "Bearer " + this.accessToken,
            "x-source": "cucumber_js",
            "x-bvt-project-id": projectId,
          },
        }
      );
    } catch (error) {
      // no event tracking
    }
  }
  async modifyTestCase(runId: string, projectId: string, testProgressReport: JsonTestProgress) {
    try {
      const res = await axiosClient.post(
        this.runsApiBaseURL + "/cucumber-runs/modifyTestCase",
        {
          runId,
          projectId,
          testProgressReport,
        },
        {
          headers: {
            Authorization: "Bearer " + this.accessToken,
            "x-source": "cucumber_js",
          },
        }
      );
      if (res.status !== 200) {
        throw new Error("");
      }
      if (res.data.status !== true) {
        throw new Error("");
      }
      logReportLink(runId, projectId);
    } catch (e) {
      console.error(`failed to modify the test case: ${testProgressReport.id} ${e}`);
    }
  }
}

export { RunUploadService };
