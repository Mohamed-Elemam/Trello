import QRCode from "qrcode";

export const generateQrCode = ({ data = "" } = {}) => {
  const qrCode = QRCode.toDataURL(JSON.stringify(data), {
    errorCorrectionLevel: "H",
  });
  return qrCode;
};
