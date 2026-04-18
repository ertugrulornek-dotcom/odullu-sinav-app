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

    // 🚀 DÜZELTME BURADA: json() yerine text() kullanıyoruz!
    // MesajPaneli bize Base64 ("eyJzdGF0...") metni dönüyor. Zorla JSON'a çevirip kodu çökertmek yerine düz metin olarak okuyoruz.
    const responseText = await response.text();
    console.log("MesajPaneli API Cevabı:", responseText);
    
    // İşlem sonucunu React tarafına çökmeden, başarıyla gönder
    return {
      statusCode: 200,
      body: JSON.stringify({
         success: true,
         message: "SMS API isteği başarıyla iletildi.",
         apiResponse: responseText // Gelen cevabı frontend'e bozmadan iletiyoruz
      })
    };
  } catch (error) {
    console.error("Netlify SMS Hatası:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "İç sunucu hatası.", details: error.message })
    };
  }
};