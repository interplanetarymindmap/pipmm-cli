import { Command, flags } from "@oclif/command";
import ConfigController from "../lib/configController";
import Utils from "../lib/utils";
import Filter from "../lib/filter";
import FoamController from "../lib/foamController";
import Referencer from "../lib/referencer";

export default class QueryCommand extends Command {
  static description = "Uploads repo to server";

  async run() {
    const { args, flags } = this.parse(QueryCommand);

    await FoamController.compileAll(ConfigController.ipmmRepoPath, ConfigController.foamRepoPath);
    let inputNotes = Referencer.iidToNoteWrap;

    let filterJson = Utils.getFile(ConfigController.filterPath);
    let filter = JSON.parse(filterJson);
    let outputNotes = await Filter.Filter(inputNotes,filter);

    console.log(outputNotes);
  }
}
