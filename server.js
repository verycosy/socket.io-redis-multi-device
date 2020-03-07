const cluster = require("cluster");

const run = () => {
  if (cluster.isMaster) {
    const cpus = require("os").cpus().length;
    for (let i = 0; i < cpus; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
      console.log("worker " + worker.process.pid + " died");
    });
  } else {
    const express = require("express"),
      http = require("http"),
      IO = require("socket.io"),
      redis = require("redis"),
      redisAdapter = require("socket.io-redis");

    const PORT = 5020;
    const app = express();
    const server = http.createServer(app);
    const sio = IO(server);

    sio.adapter(redisAdapter({ host: "localhost", port: 6379 }));
    const rootNamespace = sio.of("/");
    const redisClient = redis.createClient(6379, "localhost");

    app.use(express.static("public"));
    app.get("/", (req, res) => {
      res.sendFile(__dirname + "public/index.html");
    });

    const getOnlineUsers = () => {
      //   console.log(sio.of("/").adapter.rooms);

      rootNamespace.adapter.allRooms((err, rooms) => {
        for (let prop in rooms) {
          onlineUsers.push(rooms[prop].user);
        }
      });
    };

    // sio.of("/").adapter.customHook = (request, cb) => {
    //   const socket = sio.of("/").connected[request.socketId];
    //   if (socket) {
    //     console.log(`PID: ${process.pid} - ${socket.id}`);
    //     cb(socket.id);
    //   }

    //   cb();
    // };

    // const getSocketBySocketId = socketId => {
    //   sio.of("/").adapter.customRequest({ socketId }, (err, replies) => {
    //     if (err) console.error(err);
    //     console.log("REPLY" + replies);
    //   });
    // };

    sio.on("connection", socket => {
      socket.leave(socket.id);

      // const setUserToRoom = user => {
      //   const room = sio.of("/").adapter.rooms[user.username];
      //   room.user = user;

      //   redisClient.smembers("online-users", (err, set) => {
      //     redisClient.sadd("online-users", user.username);
      //     console.log(set);
      //   });
      // };

      socket.on("login", (user, cb) => {
        cb(socket.id); // 접속 성공 알림
        socket["username"] = user.username;
        socket.join(user.username);
        console.log(`${user.username} logged In :: PID ${process.pid}`);

        // setUserToRoom({ ...user, isCalling: false });
      });

      socket.on("hello", ({ opponentName }) => {
        sio
          .to(opponentName)
          .emit("hello", { opponentName: socket["username"] });
      });

      socket.on("disconnect", () => {
        redisClient.srem(
          "online-users",
          sio.of("/").adapter.rooms[user.username].user.username
        );
        console.log(`${socket["username"]} disconnected`);
      });
    });

    server.listen(PORT, () => {
      console.log(`Server running on localhost:${PORT} / PID:${process.pid}`);
    });
  }
};

run();
