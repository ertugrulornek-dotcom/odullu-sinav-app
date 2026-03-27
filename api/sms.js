export default async function handler(req, res) {
  // CORS Başlıkları: Vercel üzerinde frontend'in backend ile sorunsuz iletişim kurmasını sağlar
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONS isteği (Tarayıcının Preflight kontrolü) için hızlı yanıt döndür
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    // MesajPaneli'nin istediği formata uygun olarak Payload'ı Base64'e çeviriyoruz
    const encodedData = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64');
    
    const postData = new URLSearchParams();
    postData.append('data', encodedData);

    // MesajPaneli'ne gerçek isteği sunucu (Vercel Backend) üzerinden atıyoruz. 
    // Böylece tarayıcı engeli (CORS) tamamen ortadan kalkar!
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