import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Mic, Send } from "lucide-react";
import AiMultiModels from "./AiMultiModels";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import axios from "axios";

function ChatInputBox() {
  const [userInput, setUserInput] = useState();
  const { aiSelectedModels, setAiSelectedModels, messages, setMessages } =
    useContext(AiSelectedModelContext);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    setMessages((prev) => {
      const updated = { ...prev };
      Object.keys(aiSelectedModels).forEach((modelKey, modelInfo) => {
        if (aiSelectedModels[modelKey].enable) {
          updated[modelKey] = [
            ...(updated[modelKey] ?? []),
            { role: "user", content: userInput },
          ];
        }
      });
      return updated;
    });

    const currentInput = userInput;
    setUserInput("");

    Object.entries(aiSelectedModels).forEach(
      async ([parentModel, modelInfo]) => {
        if (!modelInfo.modelId || aiSelectedModels[parentModel].enable == false)
          return;
        setMessages((prev) => ({
          ...prev,
          [parentModel]: [
            ...(prev[parentModel] ?? []),
            {
              role: "assistant",
              content: "loading",
              model: parentModel,
              loading: true,
            },
          ],
        }));

        try {
          const result = await axios.post("/api/ai-multi-model", {
            model: modelInfo.modelId,
            msg: [{ role: "user", content: currentInput }],
            parentModel,
          });
          const { aiResponse, model } = result.data;

          //Adds AI responses to the model's messages
          setMessages((prev) => {
            const updated = [...(prev[parentModel] ?? [])];
            const loadingIndex = updated.findIndex((m) => m.loading);

            if (loadingIndex !== -1) {
              updated[loadingIndex] = {
                role: "assisstant",
                content: aiResponse,
                model,
                loading: false,
              };
            } else {
              //fallbacks if no msg is found
              updated.push({
                role: "assistant",
                content: aiResponse,
                model,
                loading: false,
              });
            }
            return { ...prev, [parentModel]: updated };
          });
        } catch (err) {
          console.error(err);
          setMessages((prev) => ({
            ...prev,
            [parentModel]: [
              ...(prev[parentModel] ?? []),
              { role: "assistant", content: "Error fetching response" },
            ],
          }));
        }
      }
    );
  };

  return (
    <div className="relative min-h-screen">
      <div>
        <AiMultiModels />
      </div>
      <div className="fixed bottom-0 left-0 w-full flex justify-center px-4 pb-4">
        <div className="w-full border rounded-xl shadow-md max-w-2xl p-4">
          <input
            type="text"
            placeholder="Ask me anything"
            className="border-0 outline-none w-full"
            value={userInput}
            onChange={(event) => setUserInput(event.target.value)}
          />
          <div className="mt-3 flex justify-between items-center">
            <Button className="" variant="ghost" size="icon">
              <Paperclip className="h-5 w-5" />
            </Button>
            <div>
              <Button variant="ghost" size="icon">
                <Mic />
              </Button>
              <Button size="icon" className="bg-red-900" onClick={handleSend}>
                <Send />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInputBox;
