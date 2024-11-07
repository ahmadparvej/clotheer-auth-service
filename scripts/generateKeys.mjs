import crypto from "crypto";
import fs from "fs";

const keyPair = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "pkcs1",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs1",
    format: "pem",
  },
});

const publicKey = keyPair.publicKey;
const privateKey = keyPair.privateKey;

fs.writeFileSync("certs/public.pem", publicKey);
fs.writeFileSync("certs/private.pem", privateKey);
