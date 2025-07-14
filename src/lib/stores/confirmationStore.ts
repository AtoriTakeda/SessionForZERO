"use client";

import { create } from "zustand";
import { Part } from "@/components/entryFormSchema";

type FormData = {
  artist: string;
  title: string;
  entries: {
    member: string;
    fullname: string;
    nickname?: string;
    parts: { part: Part; otherPart?: string }[];
  }[];
};

type ConfirmationState = {
  data: FormData | null;
  setData: (data: FormData) => void;
  clearData: () => void;
};

export const useConfirmationStore = create<ConfirmationState>((set) => ({
  data: null,
  setData: (data) => set({ data }),
  clearData: () => set({ data: null }),
}));
