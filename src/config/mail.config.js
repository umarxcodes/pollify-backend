import { env } from "./env.js";

export default {
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.secure,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
  from: {
    name: "Pollify Team",
    address: env.smtp.from,
  },
};
