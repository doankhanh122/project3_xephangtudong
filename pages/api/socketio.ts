import { Server as NetServer } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import { Server } from "socket.io";
import { io } from "socket.io-client";
import { NextApiResponseServerIO } from "../../types/next";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (res.socket.server.io) {
    console.log("Socket is already running");
    // console.log(res.socket.server.io);
  } else {
    console.log("Socket is initializing");
    const httpServer: NetServer = res.socket.server as any;
    const io = new Server(httpServer, { path: "/api/socketio" });
    res.socket.server.io = io;
  }

  res.socket.server.io.on("connection", (socket: any) => {
    console.log("SOCKET CONNECTED!!!");

    socket.on("qrcodeRefresh", (data: any) =>
      res.socket.server.io.emit("qrcodeRefresh", "Doan Ngoc kHnah")
    );

    // console.log("Socket id is " + socket.id);
  });

  //   res?.socket?.server?.io?.emit("message", "khah");

  res.end();
}
