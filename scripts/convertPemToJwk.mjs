import fs from "fs";
import rsaPemToJwk from "rsa-pem-to-jwk";

const privateKey = fs.readFileSync("certs/private.pem", "utf-8");

const jwk = rsaPemToJwk(
  privateKey,
  {
    use: "sig",
  },
  "public",
);

console.log(JSON.stringify(jwk));
