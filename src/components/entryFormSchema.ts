import { z } from "zod";

export const schema = z.object({
  artist: z.string().min(1, { message: "必須項目です" }),
  title: z.string().min(1, { message: "必須項目です" }),
  entries: z.array(
    z.object({
      member: z.string().min(1, { message: "必須項目です" }),
      fullname: z.string(),
      nickname: z.string().optional(),
      parts: z.array(
        z
          .object({
            part: z.enum(
              [
                "ボーカル",
                "バッキングギター",
                "リードギター",
                "ベース",
                "ドラム",
                "キーボード",
                "その他",
              ],
              {
                message: "選択してください",
              }
            ),
            otherPart: z.string().optional(),
          })
          .superRefine((val, ctx) => {
            if (val.part === "その他" && !val.otherPart) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "その他を選んだ場合は詳細を入力してください",
                path: ["otherPart"],
              });
            }
          })
      ),
    })
  ),
});
export type FormData = z.infer<typeof schema>;

export const PartEnum = z.enum([
  "ボーカル",
  "バッキングギター",
  "リードギター",
  "ベース",
  "ドラム",
  "キーボード",
  "その他",
]);
export type Part = z.infer<typeof PartEnum>;
