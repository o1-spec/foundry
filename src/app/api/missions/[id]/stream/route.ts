import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { createSSEStream, sseResponse } from "@/lib/stream";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { readable, send, close } = createSSEStream();

  let lastMessageTime = new Date();

  // Send all past messages first so the client can build initial list
  try {
    const pastMessages = await db.agentMessage.findMany({
      where: { missionId: id },
      include: { agent: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    });

    for (const msg of pastMessages) {
      send("message", {
        id:        msg.id,
        agentId:   msg.agentId,
        agentName: msg.agent?.name || "System",
        role:      msg.role,
        type:      msg.type,
        content:   msg.content,
        createdAt: msg.createdAt.toISOString(),
      });
      if (msg.createdAt > lastMessageTime) {
        lastMessageTime = msg.createdAt;
      }
    }
  } catch (err) {
    console.error("Error sending past messages:", err);
  }

  // Poll database for new messages every 1 second
  const interval = setInterval(async () => {
    try {
      const newMessages = await db.agentMessage.findMany({
        where: {
          missionId: id,
          createdAt: { gt: lastMessageTime },
        },
        include: { agent: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      });

      for (const msg of newMessages) {
        send("message", {
          id:        msg.id,
          agentId:   msg.agentId,
          agentName: msg.agent?.name || "System",
          role:      msg.role,
          type:      msg.type,
          content:   msg.content,
          createdAt: msg.createdAt.toISOString(),
        });
        lastMessageTime = msg.createdAt;
      }

      const mission = await db.mission.findUnique({
        where: { id },
        select: { status: true },
      });

      if (
        mission &&
        (mission.status === "COMPLETED" ||
          mission.status === "FAILED" ||
          mission.status === "CANCELLED")
      ) {
        send("done", { status: mission.status });
        clearInterval(interval);
        close();
      }
    } catch (err) {
      console.error("SSE Polling loop error:", err);
      clearInterval(interval);
      close();
    }
  }, 1000);

  request.signal.addEventListener("abort", () => {
    clearInterval(interval);
    close();
  });

  return sseResponse(readable);
}
