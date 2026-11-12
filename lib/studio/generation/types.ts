export type StudioPromptSubmit = {
  topic: string;
  modelId?: string;
  /** Optional cover image data URL / remote URL from attached files. */
  cover?: string;
  /** Active prompt skill id (launch, howto, …). */
  skillId?: string;
  slidesCount?: number;
};
