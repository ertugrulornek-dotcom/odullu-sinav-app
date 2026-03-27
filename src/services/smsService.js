export const SMS_FOOTER = "\n\nodullusinav.net EFECEL IPTAL LH47W yaz 4609a gonder B302";

export const sendSMS = async (msgDataArray) => {
  try {
    const response = await fetch("/api/sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msgData: msgDataArray })
    });
    
    if (response.ok) {
      return true;
    } else {
      console.error("SMS API hata döndürdü:", response.statusText);
      return false;
    }
  } catch (error) {
    console.error("SMS Gönderim Hatası:", error);
    return false;
  }
};