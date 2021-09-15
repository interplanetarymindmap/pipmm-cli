import * as fs from "fs";
import * as path from "path";
import Utils from "./utils";
import ErrorController, { Res } from "./errorController";

export default class LogsController {
  private static logsPath = "~/.ipmm/logs.json";

  static getComposedCommandName(
    commandName: string,
    subcommandName?: string
  ): string {
    if (!subcommandName) return commandName;
    else return commandName + "." + subcommandName;
  }

  static loadErrorLogs = (): Res[] => {
    if (fs.existsSync(LogsController.logsPath)) {
      let data = JSON.parse(fs.readFileSync(LogsController.logsPath, "utf8"));
      let logsFile: Res[] = [];
      for (let d of data) {
        logsFile.push(new Res(d.filePath, d.processName, d.error));
      }

      return logsFile;
    }
    throw new Error("No logs file for " + LogsController.logsPath + " exists");
  };

  static saveErrorLogs(errorLogs: Res[]) {
    Utils.saveFile(JSON.stringify(errorLogs), LogsController.logsPath);
  }

  static logNumberedList = (logs: Res[]) => {
    let i = 0;
    for (let l of logs) {
      console.log("  " + i + ". Error " + l.processName + ": " + l.filePath);
      i++;
    }
  };

  static logErrorIndex = (logs: Res[], errorIndex: number) => {
    let i = errorIndex; //Number.parseInt(errorIndex);
    if (i > logs.length - 1) {
      console.error(
        "Error index out of range. Largest index is " + (logs.length - 1)
      );
    }
    console.log(i + ". " + logs[i].filePath);
    console.log("   Error " + logs[i].processName);
    console.log("   " + logs[i].errContext + "\n");
  }; 

  static logAllErrors = (logs: Res[]) => {
    for (let i = 0; i < logs.length; i++) {
      console.log(i + ". " + logs[i].filePath);
      console.log("   Error " + logs[i].processName);
      console.log("   " + logs[i].errContext + "\n");
    }
  };

  static displayLogsNotice() {
    if (ErrorController.processErrors.length == 0) return;
    console.log(ErrorController.processErrors.length + " errors where found. Use the `log` command to view them. Includes the flag `-e=<error-index>` to view error details\n"
    );
  }
}