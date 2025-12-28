"use client";
import React, { useContext, useState, useEffect } from "react";
import AiModelList from "./../../shared/AiModelList";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MessageSquare } from "lucide-react";
import { LockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import { useUser } from "@clerk/nextjs";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { Loader } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function AiMultiModels() {
  const { user } = useUser();
  const [aiModelList, setAiModelList] = useState(AiModelList);
  const { aiSelectedModels, setAiSelectedModels, messages, setMessages } =
    useContext(AiSelectedModelContext);

  const onToggleChange = (model, value) => {
    setAiModelList((prev) =>
      prev.map((m) => (m.model === model ? { ...m, enable: value } : m))
    );

    // setAiSelectedModels((prev) =>
    //   prev.map((m) => (m.model === model ? { ...m, enable: value } : m))
    // );
    setAiSelectedModels((prev) => ({
      ...prev,
      [model]: {
        ...(prev?.[model] ?? {}),
        enable: value,
      },
    }));
  };

  const onSelecteValue = async (parentModel, value) => {
    const updated = {
      ...aiSelectedModels,
      [parentModel]: {
        modelId: value,
      },
    };

    setAiSelectedModels(updated);

    const docRef = doc(db, "users", user?.primaryEmailAddress?.emailAddress);
    await updateDoc(docRef, { selectedModelPref: updated });
  };

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  return (
    <div className="flex flex-1 h-[75vh] border-b">
      {aiModelList.map((model) => (
        <div
          key={model.model}
          className={`flex flex-col border-r h-full overflow-auto 
            ${model.enable ? `flex-1 min-w-[400px]` : `w-[100px] flex-none`}`}
        >
          <div className="flex w-full h-[70px] gap-2 items-center justify-between border-b p-4">
            <div className="flex items-center gap-4 w-full">
              <Image
                src={model.icon}
                alt={model.model}
                width={24}
                height={24}
              />

              {model.enable && (
                <Select
                  defaultValue={aiSelectedModels[model.model].modelId}
                  onValueChange={(value) => onSelecteValue(model.model, value)}
                  disabled={model.premium}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue
                      placeholder={aiSelectedModels[model.model].modelId}
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {/* FREE MODELS */}
                    <SelectGroup className="px-3">
                      <SelectLabel className="text-sm text-gray-400">
                        Free
                      </SelectLabel>

                      {model.subModel
                        .filter((s) => !s.premium)
                        .map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>

                    {/* PREMIUM MODELS */}
                    <SelectGroup className="px-3">
                      <SelectLabel className="text-sm text-gray-400">
                        Premium
                      </SelectLabel>

                      {model.subModel
                        .filter((s) => s.premium)
                        .map((sub) => (
                          <SelectItem
                            key={sub.id}
                            value={sub.id}
                            disabled={sub.premium}
                          >
                            {sub.name}
                            <LockIcon className="h-4 w-4 ml-2" />
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              {model.enable ? (
                <Switch
                  checked={model.enable}
                  onCheckedChange={(v) => onToggleChange(model.model, v)}
                />
              ) : (
                <MessageSquare
                  onClick={() => onToggleChange(model.model, true)}
                />
              )}
            </div>
          </div>

          {model.premium && model.enable && (
            <div className="flex items-center justify-center h-full">
              <Button>
                <LockIcon /> Upgrade to unlock
              </Button>
            </div>
          )}
          {model.enable && (
            <div className="flex-1 p-4">
              <div className="flex-1 p-4 space-y-2 ">
                {messages[model.model]?.map((m, i) => (
                  <div
                    className={`p-2 rounded-md ${
                      m.role == "user"
                        ? "bg-blue-100 text-blue-900"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {m.role == "assistant" && (
                      <span className="text-sm text-gray-800">
                        {m.model ?? model.model}
                      </span>
                    )}
                    <div className="flex gap-3 items-center">
                      {m.content == "loading" && (
                        <>
                          <Loader className="animate-spin" />
                          <span>Thinking...</span>
                        </>
                      )}
                      {m.content !== "loading" && (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default AiMultiModels;
