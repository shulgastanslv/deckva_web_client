export type StudioPromptAttachmentPayload = {
  name: string;
  kind: "image" | "text";
  /** data URL for images, plain text for notes. */
  payload: string;
};

export type StudioPromptSubmit = {
  topic: string;
  modelId?: string;
  /** Optional cover image data URL / remote URL from attached files. */
  cover?: string;
  /** Active prompt skill id (launch, howto, …). */
  skillId?: string;
  slidesCount?: number;
  language?: string;
  handle?: string;
  /** When false, CORA omits handle chrome on slides. */
  showHandle?: boolean;
  aspectRatio?: string;
  /** Text attachments for CORA seedText (not stuffed into topic). */
  seedText?: string;
  /** All image attachments in order (first → cover). */
  images?: string[];
  /** Full attach list for analytics / server attachments[]. */
  attachments?: StudioPromptAttachmentPayload[];
};
