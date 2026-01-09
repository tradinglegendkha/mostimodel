import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Mic, Send } from "lucide-react";
import AiMultiModels from "./AiMultiModels";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/config/FirebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

function ChatInputBox() {
  const [userInput, setUserInput] = useState("");
  const { user } = useUser();
  const { aiSelectedModels, setAiSelectedModels, messages, setMessages } =
    useContext(AiSelectedModelContext);

  const [chatId, setChatId] = useState();
  const params = useSearchParams();

  //changes chatId based on URL params
  useEffect(() => {
    const chatId_ = params.get("chatId");
    if (chatId_) {
      setChatId(chatId_);
      GetMessages(chatId_);
    } else {
      setMessages([]);
      setChatId(uuidv4());
    }
  }, [params]);

  const handleSend = async () => {
    if (!userInput?.trim()) return;

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

  useEffect(() => {
    if (messages && chatId) {
      SaveMessages();
    }
  }, [messages, chatId]);

  const SaveMessages = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    const docRef = doc(db, "chatHistory", chatId);
    await setDoc(docRef, {
      chatId: chatId,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      messages: messages,
      lastUpdated: Date.now(),
    });
  };

  const GetMessages = async () => {
    console.log("INSIDE", chatId);
    if (!user?.primaryEmailAddress?.emailAddress) return;
    const docRef = doc(db, "chatHistory", chatId);
    const docSnap = await getDoc(docRef);
    console.log(docSnap.data());
    const docData = docSnap.data();
    setMessages(docData?.messages || {});
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
