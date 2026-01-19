"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon, User2, Bolt } from "lucide-react";
import { SignInButton, useUser } from "@clerk/nextjs";
import UsageCreditProgress from "./UsageCreditProgress";
import { doc, query, where } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useEffect, useState, useContext } from "react";
import { collection, getDocs } from "firebase/firestore";
import moment from "moment";
import axios from "axios";
import Link from "next/link";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import PricingModel from "./PricingModel";

export function AppSidebar() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [chatHistory, setChatHistory] = useState([]);
  const [freeMsgCount, setFreeMsgCount] = useState(0);
  const { aiSelectedModels, setAiSelectedModels, messages, setMessages } =
    useContext(AiSelectedModelContext);

  useEffect(() => {
    user && GetChatHistory();
  }, [user]);

  useEffect(() => {
    GetRemainingTokenMsgs();
  }, [messages]);

  const GetChatHistory = async () => {
    const q = query(
      collection(db, "chatHistory"),
      where("userEmail", "==", user?.primaryEmailAddress?.emailAddress),
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      console.log(doc.id, doc.data());
      setChatHistory((prev) => [...prev, doc.data()]);
    });
  };

  const GetLastUserMessageFromChat = (chat) => {
    const allMessages = Object.values(chat?.messages || {}).flat();
    const userMessages = allMessages.filter((msg) => msg.role === "user");

    if (userMessages.length === 0) {
      return {
        chatId: chat.chatId,
        message: null,
        lastMsgDate: moment(chat.lastUpdated || Date.now()).fromNow(),
      };
    }

    const lastUserMsg = userMessages[userMessages.length - 1].content;
    const lastUpdated = chat.lastUpdated || Date.now();

    return {
      chatId: chat.chatId,
      message: lastUserMsg,
      lastMsgDate: moment(lastUpdated).fromNow(),
    };
  };

  const GetRemainingTokenMsgs = async () => {
    const result = await axios.post("/api/user-remaining-msg", { token: 0 });
    console.log(result);
    setFreeMsgCount(result.data.remainingToken);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-3">
          <div className="flex justify-between items-center">
            <h1 className="font-bold text-red-800 text-4xl">MostiModels</h1>
          </div>
          <div>
            {theme == "light" ? (
              <Button variant={"ghost"} onClick={() => setTheme("dark")}>
                <Sun />
              </Button>
            ) : (
              <Button variant={"ghost"} onClick={() => setTheme("light")}>
                <Moon />
              </Button>
            )}
          </div>
          {user ? (
            <Link href={"/"}>
              <Button className="mt-7 w-full" size="lg">
                + New Chat
              </Button>
            </Link>
          ) : (
            <SignInButton>
              <Button className="mt-7 w-full" size="lg">
                + New Chat
              </Button>
            </SignInButton>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className="p-3">
            <h2 className="font-bold text-lg">Chat</h2>
            {!user && (
              <p className="text-sm text-gray-500">
                Start chatting with multiple AI models
              </p>
            )}
            {chatHistory.map((chat, index) => (
              <Link
                href={"?chatId=" + chat.chatId}
                key={index}
                className="mt-2"
              >
                <div className="hover:bg-gray-100 p-3">
                  <h2 className="text-sm text-gray-800 cursor-pointer">
                    {GetLastUserMessageFromChat(chat).lastMsgDate}
                  </h2>
                  <h2 className="text-lg line-clamp-1">
                    {GetLastUserMessageFromChat(chat).message}
                  </h2>
                </div>
                <hr className="my-1" />
              </Link>
            ))}
          </div>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <div className="p-3 mb-10">
          {!user ? (
            <SignInButton mode="modal">
              <Button className="w-full" size="lg">
                Sign In/Sign up
              </Button>
            </SignInButton>
          ) : (
            <div>
              <UsageCreditProgress remainingToken={freeMsgCount} />
              <PricingModel>
                <Button className="w-full mb-3 cursor-pointer">
                  <Bolt />
                  Upgrade Plan
                </Button>
              </PricingModel>
              <Button className="flex cursor-pointer" variant={"ghost"}>
                <User2 /> <h2>Settings</h2>
              </Button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
