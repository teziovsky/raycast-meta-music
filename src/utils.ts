import { getPreferenceValues } from "@raycast/api";

import { FileDataType, FileType } from "@/types";
import { lstatSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

export interface Preferences {
  musicDir: string;
}

export const DEFAULT_MUSIC_DIR = `${homedir()}/Music`;

export function getMusicDir() {
  let { musicDir = DEFAULT_MUSIC_DIR } = getPreferenceValues<Preferences>();
  if (musicDir.startsWith("~")) {
    musicDir = musicDir.replace("~", homedir());
  }

  return resolve(musicDir);
}

export function getDirData(path: string) {
  const files = readdirSync(path);

  const data: FileDataType[] = [];

  for (const file of files) {
    const fileData = lstatSync(`${path}/${file}`);
    let fileType: FileType = "other";
    if (fileData.isDirectory()) fileType = "directory";
    if (fileData.isFile()) fileType = "file";
    if (fileData.isSymbolicLink()) fileType = "symlink";

    if (fileType === "other") continue;

    const permissions = (fileData.mode & parseInt("777", 8)).toString(8);
    const size = fileData.size;

    const d: FileDataType = {
      type: fileType,
      name: file,
      size,
      permissions,
      path,
    };

    data.push(d);
  }

  const sortedData = data.sort((a, b) => {
    if (a.type === "directory" && b.type !== "directory") return -1;
    if (a.type !== "directory" && b.type === "directory") return 1;
    return a.name.localeCompare(b.name);
  });

  return sortedData;
}
