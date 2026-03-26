export default async function handler(req, res) {
  // Güvenlik: Sadece POST isteklerine izin ver
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST metoduna izin verilir.' });
  }

  try {
    const { msgData } = req.body;
    
    // MesajPaneli API Ayarlarınız
    const MESAJ_PANELI_API_KEY = "af68961362160d37c19bae0463b082f58539d936";
    const MESAJ_PANELI_BASLIK = "EMRGUNDOGDU"; 

    const payload = {
      user: { hash: MESAJ_PANELI_API_KEY },
      msgBaslik: MESAJ_PANELI_BASLIK,
      msgData: msgData
    };

    // Payload'ı Base64'e çeviriyoruz
    const encodedData = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64');
    
    const postData = new URLSearchParams();
    postData.append('data', encodedData);

    // MesajPaneli'ne gerçek isteği sunucu (Vercel) üzerinden atıyoruz. Böylece tarayıcı engeli (CORS) yaşanmaz!
    const response = await fetch("https://api.mesajpaneli.com/json_api/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: postData.toString()
    });

    const result = await response.json();
    
    // İşlem sonucunu React tarafına gönder
    return res.status(200).json(result);
  } catch (error) {
    console.error("Vercel SMS API Hatası:", error);
    return res.status(500).json({ error: "İç sunucu hatası." });
  }
}