import { Action, ActionPanel, Form, Icon, Toast, showToast, useNavigation } from "@raycast/api";
import { useForm } from "@raycast/utils";

import { readID3Tags } from "@/utils/id3";
import NodeID3, { Tags } from "node-id3";
import { useState } from "react";

interface TagsSchema extends Omit<Tags, "performerInfo"> {
  performerInfo: string[];
}

export interface EditID3TagsProps {
  file: string;
}

export const EditID3Tags = ({ file }: EditID3TagsProps) => {
  const { pop } = useNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const tags = readID3Tags(file);

  const { handleSubmit, itemProps, reset } = useForm<TagsSchema>({
    async onSubmit(values) {
      setIsLoading(true);
      const toast = await showToast({ style: Toast.Style.Animated, title: "Updating tags" });

      try {
        const payload = {
          ...values,
          performerInfo: values.performerInfo.join("/"),
        };

        const success = NodeID3.update(payload, file);

        if (success) {
          toast.style = Toast.Style.Success;
          toast.title = "Successfully updated tags 🎉";

          reset({
            title: "",
            artist: "",
            album: "",
            genre: "",
            year: "",
            performerInfo: [""],
          });

          pop();
        }
      } catch (error) {
        toast.style = Toast.Style.Failure;
        toast.title = "Failed to update tags 😥";
        toast.message = error instanceof Error ? error.message : undefined;
      } finally {
        setIsLoading(false);
      }
    },
    initialValues: {
      title: tags.title ?? "",
      artist: tags.artist ?? "",
      album: tags.album ?? "",
      genre: tags.genre ?? "",
      year: tags.year ?? "",
      performerInfo: tags.performerInfo?.split("/") ?? [""],
    },
  });

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Update Tags" onSubmit={handleSubmit} icon={Icon.Upload} />
        </ActionPanel>
      }
    >
      <Form.TextField title="Artist" placeholder="Artist" autoFocus {...itemProps.artist} />
      <Form.TextField title="Title" placeholder="Title" {...itemProps.title} />
      <Form.TextField title="Album" placeholder="Album" {...itemProps.album} />
      <Form.TextField title="Genre" placeholder="Genre" {...itemProps.genre} />
      <Form.TextField title="Year" placeholder="Year" {...itemProps.year} />
      <Form.TagPicker title="Performer Info" placeholder="Performer Info" {...itemProps.performerInfo}></Form.TagPicker>
    </Form>
  );
};
