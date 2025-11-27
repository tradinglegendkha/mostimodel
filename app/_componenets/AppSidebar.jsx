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

export function AppSidebar() {
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
                <Moon />{" "}
              </Button>
            )}
          </div>
          <Button className="mt-7 w-full" size="lg">
            + New Chat
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className="p-3">
            <h2 className="font-bold text-lg">Chat</h2>
            <p className="text-sm text-gray-500">
              Start chatting with multiple AI models
            </p>
          </div>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <div className="p-3 mb-10">
          <Button className="w-full" size="lg">
            Sign In/Sign up
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
