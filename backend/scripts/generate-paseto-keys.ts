import { V4 } from "paseto";
import { writeFileSync } from "fs";
import { createPublicKey } from "crypto";

(async () => {
  const privateKey = await V4.generateKey("public");
  const publicKey = createPublicKey(privateKey);
  const privatePem = privateKey.export({
    type: "pkcs8",
    format: "pem",
  });

  const publicPem = publicKey.export({
    type: "spki",
    format: "pem",
  });

  console.log("PRIVATE KEY:\n", privatePem);
  console.log("PUBLIC KEY:\n", publicPem);

  writeFileSync(".paseto-private.pem", privatePem);
  writeFileSync(".paseto-public.pem", publicPem);

  console.log("\nKeys written to:");
  console.log(" - .paseto-private.pem");
  console.log(" - .paseto-public.pem");
})();
