import { Command, flags } from "@oclif/command";
import ConfigController from "../lib/configController";
import axios from "axios";
import Referencer from "../lib/referencer";
import FoamController from "../lib/foamController";
import Utils from "../lib/utils";
import Filter from "../lib/filter";

export default class RestoreCommand extends Command {
  static description =
    "Compiles repo and uploads to the server (local or remote, depending on the flag) applying a filter";

  static args = [
    {
      name: "Password",
      required: false,
      description: "foamId of the note to update",
      hidden: false,
    },
  ];

  static flags = {
    help: flags.help({ char: "h" }),

    remote: flags.boolean({
      name: "remote",
      char: "r",
      description:
        "Restores the IPMM repo into the remote server specified in the config file using the `remoteFilter.json`. If this flag is not use it will try to restore a local server using `localFilter.json` instead.",
    }),
    repoPath: flags.string({
      name: "repoPath",
      char: "p",
      description:
        "Executes the command relative to the specified path as oppose to the working directory",
    }),
  };

  async run() {
    const { args, flags } = this.parse(RestoreCommand);

    let workingPath = process.cwd();
    if (flags.repoPath) {
      workingPath = Utils.resolveHome(flags.repoPath);
    }

    if (!ConfigController.load(workingPath)) return;

    await FoamController.compileAll(
      ConfigController.ipmmRepoPath,
      ConfigController.foamRepoPath
    );
    let repo = Referencer.iidToNoteWrap;

    let remoteEndPoint =
      "https://ipfoam-server-dc89h.ondigitalocean.app/restore/x";
    let localEndPoint = "http://localhost:8080/restore/x";

    let endpoint = "";
    let jsonFilter = "";

    if (flags.remote) {
      endpoint = remoteEndPoint;
      jsonFilter = Utils.getFile(ConfigController.remoteFilterPath);
      console.log("Restoring remote repo");
    } else {
      console.log("Applying local filter");
      endpoint = localEndPoint;
      jsonFilter = Utils.getFile(ConfigController.localFilterPath);
    }
    let filter = JSON.parse(jsonFilter);

    let filteredRepo = await Filter.filter(repo, filter);
    console.log("Total abstractions: " + repo.size);
    console.log("Filtered abstractions: " + filteredRepo.size);


    const res = await axios.put(endpoint, Utils.notesWrapToObjs(filteredRepo));

    if (res.data) {
      console.log(res.data);
    } else {
      console.log(res);
    }
  }
}
