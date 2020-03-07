let socket = null;

function login() {
  socket = io({ transports: ["websocket"] });

  socket.on("hello", ({ opponentName }) =>
    console.log(`${opponentName}이 인사합니다 `)
  );

  socket.emit(
    "login",
    {
      username: document.getElementById("username").value
    },
    socketId => {
      console.log(`Login Success. My Socket ID is ${socketId}`);
    }
  );
}

function hello() {
  socket.emit("hello", {
    opponentName: document.getElementById("opponentName").value
  });
}

document.getElementById("loginButton").addEventListener("click", login);
document.getElementById("helloButton").addEventListener("click", hello);
