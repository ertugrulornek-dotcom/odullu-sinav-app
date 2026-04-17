exports.handler = async (event, context) => {
  // Sadece POST isteklerine izin ver
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Sadece POST metoduna izin verilir.' }) };
  }

  try {
    // Netlify'da veri string olarak gelir, onu JSON objesine çeviriyoruz
    const { msgData } = JSON.parse(event.body);
    
    // Senin MesajPaneli Ayarların
    const MESAJ_PANELI_API_KEY = "af68961362160d37c19bae0463b082f58539d936";
    const MESAJ_PANELI_BASLIK = "EMRGUNDOGDU"; 

    const payload = {
      user: { hash: MESAJ_PANELI_API_KEY },
      msgBaslik: MESAJ_PANELI_BASLIK,
      msgData: msgData
    };

    const encodedData = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64');
    
    const postData = new URLSearchParams();
    postData.append('data', encodedData);

    const response = await fetch("https://api.mesajpaneli.com/json_api/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: postData.toString()
    });

    const result = await response.json();
    
    // İşlem sonucunu React tarafına başarıyla gönder
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error("Netlify SMS Hatası:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "İç sunucu hatası." })
    };
  }
};