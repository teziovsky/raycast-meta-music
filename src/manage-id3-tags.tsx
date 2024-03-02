import { Action, ActionPanel, Icon, List } from "@raycast/api";

import { EditID3Tags } from "@/components/edit-id3-tags";
import { getDirData, getMusicDir, getParentDir } from "@/utils/files";
import { readID3Tags } from "@/utils/id3";
import { Tags } from "node-id3";
import { homedir } from "node:os";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

export default function Command() {
  const musicDir = getMusicDir();
  const [actualDir, setActualDir] = useState(musicDir);
  const [searchText, setSearchText] = useState("");

  const files = getDirData(actualDir);
  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchText.toLowerCase()));

  const [isShowingDetail, setIsShowingDetail] = useState(false);
  const [fileTags, setFileTags] = useState<Tags>();

  const onSelectionChange = useCallback(
    (id: string | null) => {
      const foundFile = files.find((file) => String(file.id) === id);
      if (!foundFile) return;
      if (foundFile.isDir) {
        setFileTags(undefined);
      } else {
        const tags = readID3Tags(`${foundFile.path}/${foundFile.name}`);
        setFileTags(tags);
      }
    },
    [files],
  );

  useEffect(() => {
    setSearchText("");
  }, [actualDir]);

  return (
    <List
      searchText={searchText}
      onSelectionChange={(id) => onSelectionChange(id)}
      onSearchTextChange={setSearchText}
      navigationTitle={actualDir}
      isShowingDetail={isShowingDetail}
    >
      {files.length ? (
        filteredFiles.map((file, index) => (
          <List.Item
            key={file.id}
            id={String(file.id)}
            icon={file.isDir ? Icon.Folder : Icon.Music}
            title={`${index + 1}. ${file.name}`}
            detail={
              <List.Item.Detail
                isLoading={true}
                metadata={
                  <List.Item.Detail.Metadata>
                    <List.Item.Detail.Metadata.Label title="Metadata" />
                    {fileTags?.artist ? (
                      <List.Item.Detail.Metadata.TagList title="Artist">
                        <List.Item.Detail.Metadata.TagList.Item text={fileTags.artist} />
                      </List.Item.Detail.Metadata.TagList>
                    ) : null}
                    {fileTags?.title ? (
                      <List.Item.Detail.Metadata.TagList title="Title">
                        <List.Item.Detail.Metadata.TagList.Item text={fileTags.title} />
                      </List.Item.Detail.Metadata.TagList>
                    ) : null}
                  </List.Item.Detail.Metadata>
                }
              />
            }
            actions={
              <ActionPanel>
                {!file.isDir ? (
                  <ActionPanel.Section>
                    <Action
                      title="Show Tags"
                      icon={Icon.Music}
                      onAction={() => readID3Tags(`${file.path}/${file.name}`)}
                    />
                    <Action.Push
                      title="Edit Tags"
                      icon={Icon.Pencil}
                      target={<EditID3Tags file={`${file.path}/${file.name}`} />}
                      shortcut={{ modifiers: ["cmd"], key: "e" }}
                    />
                  </ActionPanel.Section>
                ) : null}
                <ActionPanel.Section>
                  {file.isDir ? (
                    <Action
                      title="Open Directory"
                      icon={Icon.Folder}
                      onAction={() => setActualDir(`${file.path}/${file.name}`)}
                      shortcut={{ modifiers: [], key: "arrowRight" }}
                    />
                  ) : null}
                  {actualDir !== homedir() ? (
                    <OpenParentDirAction path={file.path} setActualDir={setActualDir} />
                  ) : null}
                </ActionPanel.Section>
                <ActionPanel.Section>
                  <Action
                    title="Toggle Detail View"
                    icon={Icon.AppWindowSidebarLeft}
                    onAction={() => setIsShowingDetail((prev) => !prev)}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "d" }}
                  />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        ))
      ) : (
        <List.Item
          title="No audio files found"
          icon={Icon.Warning}
          actions={
            <ActionPanel>
              {actualDir !== homedir() ? <OpenParentDirAction path={actualDir} setActualDir={setActualDir} /> : null}
            </ActionPanel>
          }
        />
      )}
    </List>
  );
}

interface OpenParentDirActionProps {
  path: string;
  setActualDir: Dispatch<SetStateAction<string>>;
}

function OpenParentDirAction({ path, setActualDir }: OpenParentDirActionProps) {
  return (
    <Action
      title="Open Parent Directory"
      icon={Icon.Folder}
      onAction={() => setActualDir(getParentDir(path))}
      shortcut={{ modifiers: [], key: "arrowLeft" }}
    />
  );
}
