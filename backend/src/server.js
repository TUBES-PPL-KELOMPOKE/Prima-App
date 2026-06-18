import app from "./app.js";

const start = async () => {
  try {
    await app.listen({ port: 3002 });
    console.log("Server jalan di http://localhost:3002");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();