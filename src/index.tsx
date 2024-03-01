import { Action, ActionPanel, Icon, List } from "@raycast/api";

import { getDirData, getMusicDir } from "@/utils";
import { Promise as NodeID3 } from "node-id3";

interface CommandProps {
  path?: string;
}

async function readID3Tags(path: string) {
  const tags = await NodeID3.read(path);
  console.log("🚀 ~ tags:", tags);
}

export default function Command({ path }: CommandProps) {
  const musicDir = getMusicDir();
  const actualDir = path || musicDir;
  const files = getDirData(actualDir);

  return (
    <List searchText={actualDir}>
      {files.map((file, index) => (
        <List.Item
          key={index}
          icon={file.type === "directory" ? Icon.Folder : Icon.Music}
          title={`${index + 1}. ${file.name}`}
          subtitle={file.path}
          actions={
            <ActionPanel>
              <Action.Push
                title="Open"
                icon={Icon.Folder}
                target={file.type === "directory" ? <Command path={`${actualDir}/${file.name}`} /> : null}
                shortcut={{ modifiers: [], key: "arrowRight" }}
              />
              <Action title="Show Tags" icon={Icon.Music} onAction={() => readID3Tags(`${file.path}/${file.name}`)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
