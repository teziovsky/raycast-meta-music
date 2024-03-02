import { getPreferenceValues } from "@raycast/api";

import mime from "mime";
import { lstatSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";

export type FileType = "directory" | "audio" | "other";

export type FileDataType = {
  id: number;
  isDir: boolean;
  name: string;
  size: number;
  path: string;
};

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
    if (file.startsWith(".")) continue;
    const fileData = lstatSync(`${path}/${file}`);

    let fileType: FileType = "other";
    if (fileData.isDirectory()) fileType = "directory";
    if (fileData.isFile() && mime.getType(file)?.startsWith("audio")) fileType = "audio";
    if (fileType === "other") continue;

    const size = fileData.size;

    const d: FileDataType = {
      id: fileData.ino,
      isDir: fileType === "directory",
      name: file,
      size,
      path,
    };

    data.push(d);
  }

  const sortedData = data.sort((a, b) => {
    if (a.isDir && !b.isDir) return -1;
    if (!a.isDir && b.isDir) return 1;
    return a.name.localeCompare(b.name);
  });

  return sortedData;
}

export function getParentDir(path: string) {
  const pathArray = path.split("/");
  pathArray.pop();
  return pathArray.join("/");
}
