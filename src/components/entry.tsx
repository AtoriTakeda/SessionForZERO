"use client";
import {
  useForm,
  FieldErrors,
  useFieldArray,
  useWatch,
  Controller,
  UseFormSetValue,
  type Control,
  type UseFormRegister,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema, FormData } from "./entryFormSchema";
import { useEffect, useState } from "react";
import { Member } from "@/lib/types";
import { useConfirmationStore } from "@/lib/stores/confirmationStore";
import { useRouter } from "next/navigation";
import { Autocomplete, TextField } from "@mui/material";
import { supabaseClient } from "@/lib/supabase/browser";

type Props = {
  user: { id: string; email?: string };
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
};

type MemberProps = {
  control: Control<FormData>;
  register: UseFormRegister<FormData>;
  setValue: UseFormSetValue<FormData>;
  errors: FieldErrors<FormData>;
  memberIndex: number;
  removeMember: () => void;
  members: Member[];
  memberLength: number;
};

type PartProps = {
  control: Control<FormData>;
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  memberIndex: number;
  partIndex: number;
  removePart: (partIndex: number) => void;
  partLength: number;
};

export const EntryForm = ({ user, defaultValues, onSubmit }: Props) => {
  const router = useRouter();
  const { data: storeData } = useConfirmationStore();
  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      artist: "",
      title: "",
      entries: [],
    },
  });

  const {
    fields: memberFields,
    append: appendMember,
    remove: removeMember,
  } = useFieldArray({
    control,
    name: "entries",
  });

  const [member, setMember] = useState<Member[]>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabaseClient
        .from("profile")
        .select(
          "id, last_name, first_name, last_name_kana, first_name_kana, start_time, end_time"
        );
      if (error) {
        console.error("メンバー取得に失敗しました", error.message);
        router.push("/error");
      } else {
        setMember(data);

        if (defaultValues) {
          reset(defaultValues);
        } else if (storeData) {
          reset(storeData);
        } else {
          const currentUser = data.find((m) => m.id === user.id);

          if (currentUser) {
            reset({
              artist: "",
              title: "",
              entries: [
                {
                  member: user.id,
                  fullname: `${currentUser.last_name}${currentUser.first_name}`,
                  nickname: "",
                  parts: [{ part: "ボーカル" }],
                },
              ],
            });
          }
        }
      }
    };

    fetchProfiles();
  }, []);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 p-6 max-w-4xl mx-auto"
    >
      <h1 className="text-3xl font-bold text-center mb-6">エントリー情報</h1>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-semibold mb-1">アーティスト名</label>
          <input {...register("artist")} className="border px-2 py-1 w-full" />
          {errors.artist && (
            <p className="text-red-500">{errors.artist.message}</p>
          )}
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">曲名</label>
          <input {...register("title")} className="border px-2 py-1 w-full" />
          {errors.title && (
            <p className="text-red-500">{errors.title.message}</p>
          )}
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-2">メンバー:</h2>
      {memberFields.map((memberField, memberIndex) => (
        <ParticipantEntry
          key={memberField.id}
          control={control}
          register={register}
          setValue={setValue}
          errors={errors}
          memberIndex={memberIndex}
          removeMember={() => removeMember(memberIndex)}
          members={member}
          memberLength={memberFields.length}
        />
      ))}

      <button
        type="button"
        onClick={() =>
          appendMember({
            member: "",
            fullname: "",
            nickname: "",
            parts: [{ part: "ボーカル" }],
          })
        }
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        +メンバーを追加
      </button>

      <div className="flex justify-center gap-4 mt-8">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          確認画面へ
        </button>
        <button
          type="button"
          onClick={() => history.back()}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          戻る
        </button>
      </div>
    </form>
  );
};

function ParticipantEntry({
  control,
  register,
  setValue,
  errors,
  memberIndex,
  removeMember,
  members,
  memberLength,
}: MemberProps) {
  const {
    fields: partFields,
    append: appendPart,
    remove: removePart,
  } = useFieldArray({
    control,
    name: `entries.${memberIndex}.parts`,
  });

  const fullname: string = useWatch({
    control,
    name: `entries.${memberIndex}.fullname`,
  });

  const [inputValue, setInputValue] = useState("");

  return (
    <div className="p-4 border rounded shadow mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{memberIndex + 1}人目</h3>
        {memberLength > 1 && (
          <button
            type="button"
            className="text-red-500 text-sm"
            onClick={removeMember}
          >
            削除
          </button>
        )}
      </div>

      {/* AutoComplete 選択 */}
      <div className="space-y-1">
        <h3 className="font-semibold">名前</h3>
        <Controller
          control={control}
          name={`entries.${memberIndex}.member`}
          rules={{ required: "必須項目です" }}
          render={({ field, fieldState }) => (
            <Autocomplete
              options={members}
              getOptionLabel={(option) =>
                `${option.last_name}${option.first_name}`
              }
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              filterOptions={(options) =>
                options.filter(
                  (p) =>
                    p.last_name_kana.includes(inputValue) ||
                    p.first_name_kana.includes(inputValue)
                )
              }
              value={members.find((m) => m.id === field.value) ?? null}
              inputValue={inputValue}
              onInputChange={(_, newValue) => setInputValue(newValue)}
              onChange={(_, newValue) => {
                field.onChange(newValue?.id ?? "");
                setValue(
                  `entries.${memberIndex}.fullname`,
                  newValue ? `${newValue.last_name}${newValue.first_name}` : ""
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="メンバーを選択"
                  variant="outlined"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
              noOptionsText="一致するメンバーがいません"
              clearOnEscape
            />
          )}
        />
      </div>

      {/* 表示名 */}
      <div className="space-y-1">
        <h3 className="font-semibold">表示名</h3>
        <p className="text-sm text-gray-600">
          ここに入力するとエントリーシートではこの名前で表示されます
        </p>
        <input
          {...register(`entries.${memberIndex}.nickname`)}
          type="text"
          placeholder={fullname ? fullname : "メンバーを選択してください"}
          disabled={!fullname}
          className="border px-2 py-1 w-full"
        />
      </div>

      {/* パート選択 */}
      <div className="space-y-2">
        <h3 className="font-semibold">パート（複数選択可）</h3>
        {partFields.map((part, partIndex) => (
          <PartInput
            key={part.id}
            control={control}
            register={register}
            errors={errors}
            memberIndex={memberIndex}
            partIndex={partIndex}
            removePart={removePart}
            partLength={partFields.length}
          />
        ))}
        <button
          type="button"
          onClick={() => appendPart({ part: "ボーカル" })}
          className="text-blue-500 text-sm"
        >
          +パートを追加
        </button>
      </div>
    </div>
  );
}

function PartInput({
  control,
  register,
  errors,
  memberIndex,
  partIndex,
  removePart,
  partLength,
}: PartProps) {
  const currentPart: string = useWatch({
    control,
    name: `entries.${memberIndex}.parts.${partIndex}.part`,
  });

  return (
    <div className="flex items-start gap-2 flex-wrap">
      <select
        {...register(`entries.${memberIndex}.parts.${partIndex}.part`)}
        className="border px-2 py-1"
      >
        <option value="ボーカル">ボーカル</option>
        <option value="バッキングギター">バッキングギター</option>
        <option value="リードギター">リードギター</option>
        <option value="ベース">ベース</option>
        <option value="ドラム">ドラム</option>
        <option value="キーボード">キーボード</option>
        <option value="その他">その他</option>
      </select>

      {currentPart === "その他" && (
        <div className="flex flex-col">
          <input
            {...register(`entries.${memberIndex}.parts.${partIndex}.otherPart`)}
            placeholder="その他のパートを入力"
            className="border px-2 py-1"
          />
          {errors.entries?.[memberIndex]?.parts?.[partIndex]?.otherPart && (
            <p className="text-red-500 text-sm mt-1">
              {
                errors.entries?.[memberIndex]?.parts?.[partIndex]?.otherPart
                  ?.message
              }
            </p>
          )}
        </div>
      )}

      {partLength > 1 && (
        <button
          type="button"
          onClick={() => removePart(partIndex)}
          className="text-red-500 text-sm"
        >
          削除
        </button>
      )}
    </div>
  );
}
