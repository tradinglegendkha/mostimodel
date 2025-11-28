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
import { Sun, Moon } from "lucide-react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { User2, Bolt } from "lucide-react";
import UsageCreditProgress from "./UsageCreditProgress";

export function AppSidebar() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
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
            <Button className="mt-7 w-full" size="lg">
              + New Chat
            </Button>
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
              <UsageCreditProgress />
              <Button className="w-full mb-3">
                <Bolt />
                Upgrade Plan
              </Button>
              <Button className="flex" variant={"ghost"}>
                <User2 /> <h2>Settings</h2>
              </Button>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
