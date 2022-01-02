import IpldController from "./ipldController";
import { NoteBlock, NoteWrap } from "./ipmm";
import IpmmType from "./ipmmType";
import Utils from "./utils";

export default class Referencer {
  static readonly PROP_TYPE_FOAMID = "prop-ipfoam-type-1630602741";
  static readonly PROP_VIEW_FOAMID = "prop-view-1612698885";
  static readonly PROP_TITLE_FOAMID = "prop-title-1612697362";
  static readonly SELF_FRIEND_ID = "x";

  static readonly basicTypeInterplanetaryText = "interplanetary-text";
  static readonly basicTypeString = "string";
  static readonly basicTypeDate = "date";
  static readonly basicTypeAbstractionReference = "abstraction-reference";
  static readonly basicTypeAbstractionReferenceList =
    "abstraction-reference-list";
  static readonly basicTypeBoolean = "boolean";
  static readonly basicTypeUrl = "url";

  static iidToCidMap: { [iid: string]: string } = {};
  static iidToTypeMap: { [iid: string]: IpmmType } = {};
  static iidToNoteWrap: { [iid: string]: NoteWrap } = {};
  
  static miidSeparatorToken = ":";

  static addIId(iid: string, cid: string): void {
    Referencer.iidToCidMap[iid] = cid;
  }

  static makeMiid = async (foamIdOrFileName: string): Promise<string> => {
    const foamId = Utils.removeFileExtension(foamIdOrFileName);
    let miid = "";

    let runs =foamId.split("/");
    //does not include friendId, therefore is the author
    if (runs.length == 1) {
      let mid = await Referencer.makeMid(Referencer.SELF_FRIEND_ID);
      let iid = await Referencer.makeIid(runs[0]);
      miid = mid + Referencer.miidSeparatorToken + iid; 
    } else if (runs.length == 2) {
      let mid = await Referencer.makeMid(runs[0]);
      let iid = await Referencer.makeIid(runs[1]);
      miid = mid + Referencer.miidSeparatorToken + iid; 
    }
    return miid;
  };

  static makeIid = async (foamId: string): Promise<string> => {
    const onlyTheTimestamp = foamId.slice(-10); //This is to prevent an IID change if the foamId changes
    const block = await IpldController.anyToDagJsonBlock(onlyTheTimestamp);
    //console.log(onlyTheTimestamp + " - " + foamId + " - " + foamIdOrFileName);
    const trunkated = block.cid.toString().slice(-8);
    return "i" + trunkated;
  };

 

  static makeMid = async (friendId: string): Promise<any> => {
    //We use the same IID function just swapping the intitial "i" for an "m"
    let x = await Referencer.makeIid(friendId);
    let mid = "m" + x.substring(1);
    return mid;
  };

  static iidExists(iid: string): boolean {
    if (Referencer.iidToCidMap[iid]) return true;
    return false;
  }

  static getCid(iid: string): string {
    return Referencer.iidToCidMap[iid];
  }

  static typeExists(iid: string): boolean {
    if (Referencer.iidToTypeMap[iid]) return true;
    return false;
  }

  static getType(iid: string): IpmmType {
    return Referencer.iidToTypeMap[iid];
  }

  static getNote(iid: string): NoteBlock {
    return Referencer.iidToNoteWrap[iid];
  }
}
