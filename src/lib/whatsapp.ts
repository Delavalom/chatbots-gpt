import ws from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

export const whatsapp = new ws.Client({
  authStrategy: new ws.LocalAuth()
});

export function initializeWhatsapp() {
  whatsapp.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });
  
  whatsapp.on("remote_session_saved", () => {
    console.log("Remote Session stored!");
  });
  
  whatsapp.on("ready", () => {
    console.log("Whatsapp client is ready!");
  });
  
  whatsapp.initialize();
}