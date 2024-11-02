import { Config } from "./config/index";

function welcome(name: string) {
  console.log("Welcome to the server!", name, Config.PORT);
}

welcome("parvej");
