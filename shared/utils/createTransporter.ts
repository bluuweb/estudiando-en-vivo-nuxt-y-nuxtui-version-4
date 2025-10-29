import nodemailer from "nodemailer";

interface TransporterConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

export default function ({ host, port, user, pass }: TransporterConfig) {
  return nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass,
    },
  });
}
