"use client";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  const { setTheme } = useTheme();
  return (
    <div className="">
      <div>
        <Button onClick={() => setTheme("dark")}>Dark mode</Button>
        <Button onClick={() => setTheme("light")}>Light mode</Button>
      </div>
    </div>
  );
}
