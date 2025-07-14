"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { schema, FormData } from "./profileSchema";
import { useEffect } from "react";

type Props = {
  defaultValues?: Partial<FormData>;
  onSubmit: (data: FormData) => Promise<void>;
  showBackButton?: boolean;
};

export const ProfileForm = ({
  defaultValues,
  onSubmit,
  showBackButton = false,
}: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues });

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  const startTime = watch("startTime");
  const endTime = watch("endTime");

  useEffect(() => {
    trigger(["startTime", "endTime"]);
  }, [startTime, endTime]);

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block mb-1">名字</label>
            <input
              {...register("lastName")}
              className="border px-2 py-1 w-full"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>
          <div className="flex-1">
            <label className="block mb-1">名前</label>
            <input
              {...register("firstName")}
              className="border px-2 py-1 w-full"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block mb-1">名字(ひらがな)</label>
            <input
              {...register("lastName_kana")}
              className="border px-2 py-1 w-full"
            />
            {errors.lastName_kana && (
              <p className="text-red-500 text-sm mt-1">
                {errors.lastName_kana.message}
              </p>
            )}
          </div>
          <div className="flex-1">
            <label className="block mb-1">名前(ひらがな)</label>
            <input
              {...register("firstName_kana")}
              className="border px-2 py-1 w-full"
            />
            {errors.firstName_kana && (
              <p className="text-red-500 text-sm mt-1">
                {errors.firstName_kana.message}
              </p>
            )}
          </div>
        </div>
        <div className="mt-6">
          <p className="mb-2 text-gray-700 text-sm">
            来れる時間帯に制限がある人は下のフォームに時間を入力してください。
          </p>
          <div className="flex items-center gap-2">
            <select
              id="startTime"
              defaultValue=""
              {...register("startTime")}
              className="border px-2 py-1 w-full"
            >
              <option value="">-- 開始時刻 --</option>
              {Array.from({ length: 12 }, (_, i) => {
                const totalIndex = 24 + i;
                const hour = String(Math.floor(totalIndex / 2)).padStart(
                  2,
                  "0"
                );
                const min = totalIndex % 2 === 0 ? "00" : "30";
                return (
                  <option key={i} value={`${hour}:${min}`}>
                    {`${hour}:${min}`}
                  </option>
                );
              })}
            </select>

            <span className="text-gray-500">〜</span>

            <select
              id="endTime"
              defaultValue=""
              {...register("endTime")}
              className="border px-2 py-1 w-full"
            >
              <option value="">-- 終了時刻 --</option>
              {Array.from({ length: 12 }, (_, i) => {
                const totalIndex = 24 + i;
                const hour = String(Math.floor(totalIndex / 2)).padStart(
                  2,
                  "0"
                );
                const min = totalIndex % 2 === 0 ? "00" : "30";
                return (
                  <option key={i} value={`${hour}:${min}`}>
                    {`${hour}:${min}`}
                  </option>
                );
              })}
            </select>
          </div>
          {(errors.startTime || errors.endTime) && (
            <p className="text-red-500 text-sm mt-1">
              {errors.startTime?.message || errors.endTime?.message}
            </p>
          )}

          <button
            type="button"
            className="text-sm text-blue-500 underline mt-2"
            onClick={() => {
              setValue("startTime", "", { shouldValidate: true });
              setValue("endTime", "", { shouldValidate: true });
            }}
          >
            時刻をクリア
          </button>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            確定
          </button>
          {showBackButton && (
            <button
              type="button"
              onClick={() => history.back()}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
            >
              戻る
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
