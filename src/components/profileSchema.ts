import { z } from "zod";

export const schema = z
  .object({
    lastName: z.string().min(1, { message: "必須の入力項目です" }),
    firstName: z.string().min(1, { message: "必須の入力項目です" }),
    lastName_kana: z
      .string()
      .min(1, { message: "必須の入力項目です" })
      .regex(/^[\u3040-\u309Fー]+$/, {
        message: "ひらがなのみで入力してください",
      }),
    firstName_kana: z
      .string()
      .min(1, { message: "必須の入力項目です" })
      .regex(/^[\u3040-\u309Fー]+$/, {
        message: "ひらがなのみで入力してください",
      }),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const { startTime, endTime } = data;

    const oneEntered = Boolean(startTime) !== Boolean(endTime);
    if (oneEntered) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "開始時刻と終了時刻の両方を入力してください",
        path: ["startTime"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "開始時刻と終了時刻の両方を入力してください",
        path: ["endTime"],
      });
    }
  });

export type FormData = z.infer<typeof schema>;
