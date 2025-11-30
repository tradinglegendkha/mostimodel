import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { model, msg, parentModel } = await req.json();

  const response = await axios.post(
    "https://kravixstudio.com/api/v1/chat",
    {
      message: msg,
      aiModel: model,
      outputType: "text",
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.KRAVIXSTUDIO_API_KEY,
      },
    }
  );
  //Logs API response
  console.log(response.data);

  //updates user's token onto firebase
  return NextResponse.json({
    ...response.data,
    model: parentModel,
  });
}
