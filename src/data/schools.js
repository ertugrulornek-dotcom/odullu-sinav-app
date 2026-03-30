// İl, İlçe ve Okul Kademesi (ilkokul/ortaokul) bazlı otomatik okul listesi
// LÜTFEN DİKKAT: Excel/CSV dosyasından kopyaladığınız TÜM veriyi aşağıdaki `rawCSV` değişkeninin
// içindeki ters tırnaklar ( ` ) arasına yapıştırın. Sistem veriyi otomatik ayrıştıracaktır.

export const SCHOOLS = (() => {
  const rawCSV = `
KOCAELİ - BAŞİSKELE - Aydınkent İlkokulu
KOCAELİ - BAŞİSKELE - Aydınkent Ortaokulu
KOCAELİ - BAŞİSKELE - Bahçecik Damlar İlkokulu
KOCAELİ - BAŞİSKELE - Bahçecik İlkokulu
KOCAELİ - BAŞİSKELE - Bahçecik Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - BAŞİSKELE - Bahçecik Ortaokulu
KOCAELİ - BAŞİSKELE - Başiskele Altınkent İmam Hatip Ortaokulu
KOCAELİ - BAŞİSKELE - Başiskele Anadolu Lisesi
KOCAELİ - BAŞİSKELE - Başiskele Anaokulu
KOCAELİ - BAŞİSKELE - Başiskele Atatürk Ortaokulu
KOCAELİ - BAŞİSKELE - Başiskele Gübretaş İlkokulu
KOCAELİ - BAŞİSKELE - Başiskele Gübretaş Ortaokulu
KOCAELİ - BAŞİSKELE - Başiskele Halk Eğitimi Merkezi
KOCAELİ - BAŞİSKELE - Başiskele İmam Hatip Ortaokulu
KOCAELİ - BAŞİSKELE - Başiskele Kartonsan İlkokulu
KOCAELİ - BAŞİSKELE - Başiskele Kartonsan Ortaokulu
KOCAELİ - BAŞİSKELE - Başiskele Kız Anadolu İmam Hatip Lisesi
KOCAELİ - BAŞİSKELE - Başiskele Mahmutpaşa İlkokulu
KOCAELİ - BAŞİSKELE - Başiskele Mahmutpaşa Ortaokulu
KOCAELİ - BAŞİSKELE - Başiskele Ortaokulu
KOCAELİ - BAŞİSKELE - Başiskele Selim Yürekten Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - BAŞİSKELE - Başiskele Şehit Ozan Özen Kız Anadolu İmam Hatip Lisesi
KOCAELİ - BAŞİSKELE - Doğantepe İlkokulu
KOCAELİ - BAŞİSKELE - Doğantepe Ortaokulu
KOCAELİ - BAŞİSKELE - Gül Bahçesi Anaokulu
KOCAELİ - BAŞİSKELE - Karşıyaka Barbaros İlkokulu
KOCAELİ - BAŞİSKELE - Karşıyaka Tüpraş Anadolu Lisesi
KOCAELİ - BAŞİSKELE - Karşıyaka Tüpraş Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - BAŞİSKELE - Kocaeli Anadolu Lisesi
KOCAELİ - BAŞİSKELE - Kocaeli Emniyet Anaokulu
KOCAELİ - BAŞİSKELE - Kocaeli Üniversitesi Müzik ve Bale Ortaokulu
KOCAELİ - BAŞİSKELE - Kocaeli Üniversitesi Müzik ve Sahne Sanatları Lisesi
KOCAELİ - BAŞİSKELE - Kullar Hacı Mustafa Özsoy İlkokulu
KOCAELİ - BAŞİSKELE - Kullar İmam Hatip Ortaokulu
KOCAELİ - BAŞİSKELE - Kullar Kartonsan İlkokulu
KOCAELİ - BAŞİSKELE - Kullar Kartonsan Ortaokulu
KOCAELİ - BAŞİSKELE - Kullar Mustafa Kemal İlkokulu
KOCAELİ - BAŞİSKELE - Kullar Ortaokulu
KOCAELİ - BAŞİSKELE - Mehmet Süha Uçar Bahçecik Körfez İlkokulu
KOCAELİ - BAŞİSKELE - Misak-ı Milli İlkokulu
KOCAELİ - BAŞİSKELE - Misak-ı Milli Ortaokulu
KOCAELİ - BAŞİSKELE - Mustafa Bekçi Bahçecik Körfez Ortaokulu
KOCAELİ - BAŞİSKELE - Müzehhibe Fatma Aydın Kız Anadolu İmam Hatip Lisesi
KOCAELİ - BAŞİSKELE - Özka Eğitim Akademisi Mesleki Eğitim Merkezi
KOCAELİ - BAŞİSKELE - Pakize Şirin Şen Kızılay Anaokulu
KOCAELİ - BAŞİSKELE - Servetiye Cephesi Anadolu Lisesi
KOCAELİ - BAŞİSKELE - Sevgi Anaokulu
KOCAELİ - BAŞİSKELE - Seymen İlkokulu
KOCAELİ - BAŞİSKELE - Şehit Emrah Sapa Ortaokulu
KOCAELİ - BAŞİSKELE - Şehit Fatih Sultan Karaaslan Anadolu İmam Hatip Lisesi
KOCAELİ - BAŞİSKELE - Şehit Ömür Ertuğrul Sarı Anadolu Lisesi
KOCAELİ - BAŞİSKELE - Şehit Yunus Emre Ezer Ortaokulu
KOCAELİ - BAŞİSKELE - Vali İhsan Dede İlkokulu
KOCAELİ - BAŞİSKELE - Vezirçiftliği Ortaokulu
KOCAELİ - BAŞİSKELE - Yeniköy Denizdibi İlkokulu
KOCAELİ - BAŞİSKELE - Yeniköy Denizdibi Ortaokulu
KOCAELİ - BAŞİSKELE - Yeniköy Hayat İlkokulu
KOCAELİ - BAŞİSKELE - Yeniköy Hayat Ortaokulu
KOCAELİ - BAŞİSKELE - Yeniköy Sepetlipınar İlkokulu
KOCAELİ - BAŞİSKELE - Yeniköy Sepetlipınar Ortaokulu
KOCAELİ - BAŞİSKELE - Yeşil Vatan Anaokulu
KOCAELİ - BAŞİSKELE - Yeşilkent İlkokulu
KOCAELİ - BAŞİSKELE - Yeşilkent Ortaokulu
KOCAELİ - BAŞİSKELE - Yuvacık İlkokulu
KOCAELİ - BAŞİSKELE - Yuvacık İmam Hatip Ortaokulu
KOCAELİ - BAŞİSKELE - Yuvacık Levent Kırca-Oya Başar İlkokulu
KOCAELİ - BAŞİSKELE - Yuvacık Levent Kırca-Oya Başar Ortaokulu
KOCAELİ - BAŞİSKELE - Yuvacık Ortaokulu
KOCAELİ - BAŞİSKELE - Yuvacık Serdar İlkokulu
KOCAELİ - ÇAYIROVA - 15 Temmuz Şehitler Fen Lisesi
KOCAELİ - ÇAYIROVA - 24 Kasım Ortaokulu
KOCAELİ - ÇAYIROVA - Akse İlkokulu
KOCAELİ - ÇAYIROVA - Akşemsettin İmam Hatip Ortaokulu
KOCAELİ - ÇAYIROVA - Alparslan İlkokulu
KOCAELİ - ÇAYIROVA - Atatürk Ortaokulu
KOCAELİ - ÇAYIROVA - Çayırova 100. Yıl Özel Eğitim Uygulama Okulu I. Kademe
KOCAELİ - ÇAYIROVA - Çayırova 100. Yıl Özel Eğitim Uygulama Okulu II. Kademe
KOCAELİ - ÇAYIROVA - Çayırova 100. Yıl Özel Eğitim Uygulama Okulu III. Kademe
KOCAELİ - ÇAYIROVA - Çayırova Ahmet Yesevi İlkokulu
KOCAELİ - ÇAYIROVA - Çayırova Akçakoca İlkokulu
KOCAELİ - ÇAYIROVA - Çayırova Anadolu Lisesi
KOCAELİ - ÇAYIROVA - Çayırova Fevzi Çakmak Anadolu Lisesi
KOCAELİ - ÇAYIROVA - Çayırova Fuat Sezgin İlkokulu
KOCAELİ - ÇAYIROVA - Çayırova Halk Eğitimi Merkezi
KOCAELİ - ÇAYIROVA - Çayırova İlkokulu
KOCAELİ - ÇAYIROVA - Çayırova Kız Anadolu İmam Hatip Lisesi
KOCAELİ - ÇAYIROVA - Çayırova Metehan Ortaokulu
KOCAELİ - ÇAYIROVA - Çayırova Mevlana İlkokulu
KOCAELİ - ÇAYIROVA - Çayırova Ortaokulu
KOCAELİ - ÇAYIROVA - Çayırova Özel Eğitim Uygulama Okulu I. Kademe
KOCAELİ - ÇAYIROVA - Çayırova Reysaş Lojistik Ortaokulu
KOCAELİ - ÇAYIROVA - Çayırova Şekerpınar Toki Anaokulu
KOCAELİ - ÇAYIROVA - Çayırova Tahsin Tarhan Ortaokulu
KOCAELİ - ÇAYIROVA - Çayırova Yunus Ergüz İlkokulu
KOCAELİ - ÇAYIROVA - Demirsaç İlkokulu
KOCAELİ - ÇAYIROVA - Demirsaç Ortaokulu
KOCAELİ - ÇAYIROVA - Edebali 100. Yıl İlkokulu
KOCAELİ - ÇAYIROVA - Ertuğrul Kurdoğlu Anadolu Lisesi
KOCAELİ - ÇAYIROVA - GOSB-TADIM Jale Yücel Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - ÇAYIROVA - Güzeltepe İlkokulu
KOCAELİ - ÇAYIROVA - Güzeltepe Ortaokulu
KOCAELİ - ÇAYIROVA - Hanife Soykan Ortaokulu
KOCAELİ - ÇAYIROVA - Hatice Bayraktar Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - ÇAYIROVA - İstiklal İlkokulu
KOCAELİ - ÇAYIROVA - İstiklal Ortaokulu
KOCAELİ - ÇAYIROVA - Mehmet Akif İlkokulu
KOCAELİ - ÇAYIROVA - Mustafa Necati Ortaokulu
KOCAELİ - ÇAYIROVA - Öğretmen Şevket Özay İlkokulu
KOCAELİ - ÇAYIROVA - Sultan Fatih Anaokulu
KOCAELİ - ÇAYIROVA - Şehit Adem Sezgin Anaokulu
KOCAELİ - ÇAYIROVA - Şehit Davut Ali Karadağ Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - ÇAYIROVA - Şehit Er Mücahit Okur Anadolu İmam Hatip Lisesi
KOCAELİ - ÇAYIROVA - Şehit İlhan Kartal Anadolu Lisesi
KOCAELİ - ÇAYIROVA - Şehit İlhan Küçüksolak Anadolu Lisesi
KOCAELİ - ÇAYIROVA - Şehit İshak Öztürk İlkokulu
KOCAELİ - ÇAYIROVA - Şekerpınar Hasan Tahsin Ortaokulu
KOCAELİ - ÇAYIROVA - Şekerpınar İlkokulu
KOCAELİ - ÇAYIROVA - Şekerpınar İmam Hatip Ortaokulu
KOCAELİ - ÇAYIROVA - Şekerpınar Ortaokulu
KOCAELİ - ÇAYIROVA - Toki Çayırova İmam Hatip Ortaokulu
KOCAELİ - ÇAYIROVA - Türkan Göktürk İlkokulu
KOCAELİ - ÇAYIROVA - Yapı ve Kredi Bankası Kız Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - ÇAYIROVA - Yenimahalle İlkokulu
KOCAELİ - ÇAYIROVA - Yenimahalle İmam Hatip Ortaokulu
KOCAELİ - ÇAYIROVA - Yenimahalle Ortaokulu
KOCAELİ - DARICA - Ahmet Parmaksızoğlu İlkokulu
KOCAELİ - DARICA - Azize Rabia Kocaman Anaokulu
KOCAELİ - DARICA - Barış İlkokulu
KOCAELİ - DARICA - Barış Manço Özel Eğitim Anaokulu
KOCAELİ - DARICA - Borsa İstanbul Darıca Ticaret Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - DARICA - Can Murat Çeliker Anaokulu
KOCAELİ - DARICA - Darıca 100. Yıl Atatürk Ortaokulu
KOCAELİ - DARICA - Darıca 60. Yıl Ortaokulu
KOCAELİ - DARICA - Darıca Anaokulu
KOCAELİ - DARICA - Darıca Aslan Çimento İlkokulu
KOCAELİ - DARICA - Darıca Aslan Çimento Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - DARICA - Darıca Ayfer - Gazanfer Güngör İlkokulu
KOCAELİ - DARICA - Darıca Bağlarbaşı Ortaokulu
KOCAELİ - DARICA - Darıca Barbaros Anaokulu
KOCAELİ - DARICA - Darıca Barbaros İlkokulu
KOCAELİ - DARICA - Darıca Bilim ve Sanat Merkezi
KOCAELİ - DARICA - Darıca Cemil Meriç İlkokulu
KOCAELİ - DARICA - Darıca Dede Korkut İlkokulu
KOCAELİ - DARICA - Darıca Deniz Yıldızları Ortaokulu
KOCAELİ - DARICA - Darıca Fen Lisesi
KOCAELİ - DARICA - Darıca Gökşen Mustafa Yücel Anadolu Lisesi
KOCAELİ - DARICA - Darıca Halide Edip İlkokulu
KOCAELİ - DARICA - Darıca Halk Eğitimi Merkezi
KOCAELİ - DARICA - Darıca İmam Hatip Ortaokulu
KOCAELİ - DARICA - Darıca Kazım Karabekir İlkokulu
KOCAELİ - DARICA - Darıca Kemal Ali Gül İlkokulu
KOCAELİ - DARICA - Darıca Mehmet Akif Ortaokulu
KOCAELİ - DARICA - Darıca Menekşe Anaokulu
KOCAELİ - DARICA - Darıca Mesleki Eğitim Merkezi
KOCAELİ - DARICA - Darıca Mustafa Kemal İlkokulu
KOCAELİ - DARICA - Darıca Namık Kemal İlkokulu
KOCAELİ - DARICA - Darıca Nenehatun İlkokulu
KOCAELİ - DARICA - Darıca Neşet Yalçın Anadolu Lisesi
KOCAELİ - DARICA - Darıca Ortaokulu
KOCAELİ - DARICA - Darıca Osmangazi İlkokulu
KOCAELİ - DARICA - Darıca Özel Eğitim Uygulama Okulu I. Kademe
KOCAELİ - DARICA - Darıca Rehberlik ve Araştırma Merkezi
KOCAELİ - DARICA - Darıca Ressam Osman Hamdi Bey İlkokulu
KOCAELİ - DARICA - Darıca Ressam Osman Hamdi Bey Ortaokulu
KOCAELİ - DARICA - Darıca Servet Çambol İlkokulu
KOCAELİ - DARICA - Darıca Servet Yalçın Ortaokulu
KOCAELİ - DARICA - Darıca Süreyya Yalçın Ortaokulu
KOCAELİ - DARICA - Darıca TOKİ Kız Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - DARICA - Darıca Ülkün Yalçın Anadolu Lisesi
KOCAELİ - DARICA - Darıca Yunus Emre İlkokulu
KOCAELİ - DARICA - Darıca Zeki Gezer Ortaokulu
KOCAELİ - DARICA - Deniz Yıldızları Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - DARICA - Faik Şahenk İlkokulu
KOCAELİ - DARICA - Fevzi Çakmak Anadolu Lisesi
KOCAELİ - DARICA - Kazım Karabekir Anaokulu
KOCAELİ - DARICA - Neşet Yalçın Ortaokulu
KOCAELİ - DARICA - Osmangazi İmam Hatip Ortaokulu
KOCAELİ - DARICA - Öğretmen Füsun Erdemir Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - DARICA - Piri Reis İlkokulu
KOCAELİ - DARICA - Sarkuysan İlkokulu
KOCAELİ - DARICA - Sırasöğütler Anadolu Lisesi
KOCAELİ - DARICA - Şehit Edip Zengin Anadolu Lisesi
KOCAELİ - DARICA - Şehit Hasan Kaya Kız Anadolu İmam Hatip Lisesi
KOCAELİ - DARICA - Şehit Murat Tevlim Anadolu İmam Hatip Lisesi
KOCAELİ - DARICA - Şehit Yakup Gitmez Ortaokulu
KOCAELİ - DARICA - Tacirler Eğitim Vakfı Özel Eğitim Uygulama Okulu II. Kademe
KOCAELİ - DARICA - Tacirler Eğitim Vakfı Özel Eğitim Uygulama Okulu III. Kademe
KOCAELİ - DARICA - Tevfik İleri İmam Hatip Ortaokulu
KOCAELİ - DARICA - Tomris Hatun Anaokulu
KOCAELİ - DARICA - Yusuf Savaş İlkokulu
KOCAELİ - DERİNCE - 15. Kolordu İlkokulu
KOCAELİ - DERİNCE - 15. Kolordu Ortaokulu
KOCAELİ - DERİNCE - 19 Mayis Anadolu Lisesi
KOCAELİ - DERİNCE - Alparslan Ortaokulu
KOCAELİ - DERİNCE - Atatürk Anaokulu
KOCAELİ - DERİNCE - Bekir Sıtkı Özer İlkokulu
KOCAELİ - DERİNCE - Bekir Sıtkı Özer Ortaokulu
KOCAELİ - DERİNCE - Bülent Türker Anaokulu
KOCAELİ - DERİNCE - Cumhuriyet İlkokulu
KOCAELİ - DERİNCE - Cumhuriyet Ortaokulu
KOCAELİ - DERİNCE - Çakabey İlkokulu
KOCAELİ - DERİNCE - Çakabey Ortaokulu
KOCAELİ - DERİNCE - Çenesuyu İlkokulu
KOCAELİ - DERİNCE - Çenesuyu Ortaokulu
KOCAELİ - DERİNCE - Çınarlı İlkokulu
KOCAELİ - DERİNCE - Çınarlı Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - DERİNCE - Çınarlı Ortaokulu
KOCAELİ - DERİNCE - Derince Anadolu Lisesi
KOCAELİ - DERİNCE - Derince Bilim ve Sanat Merkezi
KOCAELİ - DERİNCE - Derince Halk Eğitimi Merkezi
KOCAELİ - DERİNCE - Derince İbni Sina İlkokulu
KOCAELİ - DERİNCE - Derince Kız Anadolu İmam Hatip Lisesi
KOCAELİ - DERİNCE - Derince Necip Fazıl Anadolu Lisesi
KOCAELİ - DERİNCE - Derince Özel Eğitim Uygulama Okulu I. Kademe
KOCAELİ - DERİNCE - Derince Özel Eğitim Uygulama Okulu II. Kademe
KOCAELİ - DERİNCE - Derince Özel Eğitim Uygulama Okulu III. Kademe
KOCAELİ - DERİNCE - Derince Pakmaya Abidin Pak İlkokulu
KOCAELİ - DERİNCE - Derince Pakmaya Abidin Pak Ortaokulu
KOCAELİ - DERİNCE - Derince Pakmaya Huriye Pak İlkokulu
KOCAELİ - DERİNCE - Derince Pakmaya Huriye Pak Ortaokulu
KOCAELİ - DERİNCE - Derince Piri Reis Ortaokulu
KOCAELİ - DERİNCE - Derince Ticaret Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - DERİNCE - Dumlupınar Ortaokulu
KOCAELİ - DERİNCE - Fatih İlkokulu
KOCAELİ - DERİNCE - Fatih Ortaokulu
KOCAELİ - DERİNCE - Gül Bahçesi Anaokulu
KOCAELİ - DERİNCE - Hamit ÖZDAĞ İmam Hatip Ortaokulu
KOCAELİ - DERİNCE - Hayme Ana Anaokulu
KOCAELİ - DERİNCE - Hikmet Uluğbay Ortaokulu
KOCAELİ - DERİNCE - İshakcılar İlkokulu
KOCAELİ - DERİNCE - İshakcılar Ortaokulu
KOCAELİ - DERİNCE - Kocaeli Anneleri Derneği Anaokulu
KOCAELİ - DERİNCE - Kocaeli Öğretmenler İlkokulu
KOCAELİ - DERİNCE - Melikşah Anadolu Lisesi
KOCAELİ - DERİNCE - Merkez Bankası Derince Anadolu Lisesi
KOCAELİ - DERİNCE - Mevlana İmam Hatip Ortaokulu
KOCAELİ - DERİNCE - Minik Adımlar Anaokulu
KOCAELİ - DERİNCE - Nene Hatun İlkokulu
KOCAELİ - DERİNCE - Nene Hatun Ortaokulu
KOCAELİ - DERİNCE - Sabancı Ortakları ve Çalışanları İlkokulu
KOCAELİ - DERİNCE - Seka Çocuk Dostları Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - DERİNCE - Sırrıpaşa Ortaokulu
KOCAELİ - DERİNCE - Şehit Mahmut Top Ortaokulu
KOCAELİ - DERİNCE - Şehit Osman Gazi ÇETİNGÖZ Anadolu İmam Hatip Lisesi
KOCAELİ - DERİNCE - Şehit Serdar Gökbayrak İmam Hatip Ortaokulu
KOCAELİ - DERİNCE - Şükrü Aracı İlkokulu
KOCAELİ - DERİNCE - Turgut Reis İlkokulu
KOCAELİ - DERİNCE - Turgut Reis Ortaokulu
KOCAELİ - DERİNCE - Utku Anaokulu
KOCAELİ - DERİNCE - Yenikent Anadolu Lisesi
KOCAELİ - DERİNCE - Yunus Emre İlkokulu
KOCAELİ - DERİNCE - Zehra-Emine Öçgüder Kız Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - DİLOVASI - Can Gülmen İlkokulu
KOCAELİ - DİLOVASI - Çerkeşli Nuh Çimento İlkokulu
KOCAELİ - DİLOVASI - Çerkeşli Nuh Çimento Ortaokulu
KOCAELİ - DİLOVASI - Diliskelesi Fatma Seher Anaokulu
KOCAELİ - DİLOVASI - Dilovası Akşemseddin İlkokulu
KOCAELİ - DİLOVASI - Dilovası Halk Eğitimi Merkezi
KOCAELİ - DİLOVASI - Dilovası Hasan Ali Yücel İlkokulu
KOCAELİ - DİLOVASI - Dilovası Hasan Ali Yücel Ortaokulu
KOCAELİ - DİLOVASI - Dilovası Makine İhtisas Organize Sanayi Bölgesi Mesleki Eğitim Merkezi
KOCAELİ - DİLOVASI - Dilovası Mehmet Zeki Obdan İlkokulu
KOCAELİ - DİLOVASI - Dilovası Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - DİLOVASI - Dilovası Mübeccel Çolakoğlu Ortaokulu
KOCAELİ - DİLOVASI - Dilovası Özel Eğitim Uygulama Okulu I. Kademe
KOCAELİ - DİLOVASI - Dilovası Özel Eğitim Uygulama Okulu II. Kademe
KOCAELİ - DİLOVASI - Dilovası Polisan Ortaokulu
KOCAELİ - DİLOVASI - Dilovası Solventaş İlkokulu
KOCAELİ - DİLOVASI - Dilovası Şerife Bacı Anaokulu
KOCAELİ - DİLOVASI - Dilovası Yahya Kaptan Anadolu Lisesi
KOCAELİ - DİLOVASI - Gebkim Anaokulu
KOCAELİ - DİLOVASI - GEBKİM Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - DİLOVASI - Hacı Seyit Taşan İlkokulu
KOCAELİ - DİLOVASI - İMES Organize Sanayi Bölgesi Sercan Sağlam Anaokulu
KOCAELİ - DİLOVASI - Köseler İlkokulu
KOCAELİ - DİLOVASI - Köseler Ortaokulu
KOCAELİ - DİLOVASI - Mehmet Akif Ersoy İmam Hatip Ortaokulu
KOCAELİ - DİLOVASI - Mehmet Akif Ersoy Ortaokulu
KOCAELİ - DİLOVASI - Nene Hatun Anaokulu
KOCAELİ - DİLOVASI - Şehit Can Duyar İlkokulu
KOCAELİ - DİLOVASI - Şehit İlimdar Atasoy Anadolu İmam Hatip Lisesi
KOCAELİ - DİLOVASI - Şehit İzzettin İnceoğlu İlkokulu
KOCAELİ - DİLOVASI - Şehit Mehmet Kocabay İmam Hatip Ortaokulu
KOCAELİ - DİLOVASI - Şehit Mehmet Kocabay Ortaokulu
KOCAELİ - DİLOVASI - Şehit Ömer Özavcı Ortaokulu
KOCAELİ - DİLOVASI - Tavşancıl Marshall Boya Ticaret Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - DİLOVASI - Tavşancıl Ziya Toplan İlkokulu
KOCAELİ - DİLOVASI - Tavşancıl Ziya Toplan Ortaokulu
KOCAELİ - DİLOVASI - TOKİ Osmangazi İlkokulu
KOCAELİ - DİLOVASI - TOKİ Osmangazi Ortaokulu
KOCAELİ - DİLOVASI - TOKİ Selahaddin Eyyubi Anadolu Lisesi
KOCAELİ - DİLOVASI - Yılport Ulaştırma Hizmetleri Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - GEBZE - 50. Yıl Chrysler İlkokulu
KOCAELİ - GEBZE - 50. Yıl Chrysler Ortaokulu
KOCAELİ - GEBZE - Adem Yavuz İlkokulu
KOCAELİ - GEBZE - Alaettin Kurt Anadolu Lisesi
KOCAELİ - GEBZE - Atatürk Anadolu Lisesi
KOCAELİ - GEBZE - Atatürk Anaokulu
KOCAELİ - GEBZE - Atatürk İlkokulu
KOCAELİ - GEBZE - Ayşe Sıdıka Alışan İlkokulu
KOCAELİ - GEBZE - Aziz Sancar Ortaokulu
KOCAELİ - GEBZE - Balçık İlkokulu
KOCAELİ - GEBZE - Balçık Ortaokulu
KOCAELİ - GEBZE - Beylikbağı İlkokulu
KOCAELİ - GEBZE - Beylikbağı Ortaokulu
KOCAELİ - GEBZE - Bilgi İlkokulu
KOCAELİ - GEBZE - Cumhuriyet Anadolu Lisesi
KOCAELİ - GEBZE - Cumhuriyet İlkokulu
KOCAELİ - GEBZE - Çelik İhracatçıları Birliği Ali Nuri Çolakoğlu Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - GEBZE - Çoban Mustafa Paşa İmam Hatip Ortaokulu
KOCAELİ - GEBZE - Çolakoğlu Kız Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - GEBZE - Denizli İlkokulu
KOCAELİ - GEBZE - Denizli Ortaokulu
KOCAELİ - GEBZE - Diler Demir Ortaokulu
KOCAELİ - GEBZE - Dumlupınar İmam Hatip Ortaokulu
KOCAELİ - GEBZE - Emlak Konutları Alparslan İlkokulu
KOCAELİ - GEBZE - Emlak Konutları Alparslan Ortaokulu
KOCAELİ - GEBZE - Ertuğrulgazi İlkokulu
KOCAELİ - GEBZE - Eşrefbey İlkokulu
KOCAELİ - GEBZE - Farabi İlkokulu
KOCAELİ - GEBZE - FARABİ ORTAOKULU
KOCAELİ - GEBZE - Fatih İmam Hatip Ortaokulu
KOCAELİ - GEBZE - Fatih Sultan Mehmet Anadolu Lisesi
KOCAELİ - GEBZE - Fatih Ticaret Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - GEBZE - Fevzi Çakmak İlkokulu
KOCAELİ - GEBZE - Gayrettepe Rotary Kulübü İlkokulu
KOCAELİ - GEBZE - Gebze 100. Yıl Ortaokulu
KOCAELİ - GEBZE - Gebze 23 Nisan Bilim ve Sanat Merkezi
KOCAELİ - GEBZE - GEBZE ADALET ANAOKULU
KOCAELİ - GEBZE - GEBZE ADLİYESİ ANAOKULU
KOCAELİ - GEBZE - Gebze Ahmet Zeki Büyükkuşoğlu Ortaokulu
KOCAELİ - GEBZE - Gebze Anadolu İmam Hatip Lisesi
KOCAELİ - GEBZE - Gebze Anadolu Lisesi
KOCAELİ - GEBZE - GEBZE ANAOKULU
KOCAELİ - GEBZE - Gebze Anibal Anadolu Lisesi
KOCAELİ - GEBZE - Gebze Arif Nihat Asya Ortaokulu
KOCAELİ - GEBZE - Gebze Cumaköy Ortaokulu
KOCAELİ - GEBZE - Gebze Eğitim Vakfı İlkokulu
KOCAELİ - GEBZE - Gebze Emlak Konutları İlkokulu
KOCAELİ - GEBZE - Gebze Emlak Konutları Ortaokulu
KOCAELİ - GEBZE - Gebze Hadiye Cemre Altıntaş Anaokulu
KOCAELİ - GEBZE - Gebze Halk Eğitimi Merkezi
KOCAELİ - GEBZE - Gebze Kız Anadolu İmam Hatip Lisesi
KOCAELİ - GEBZE - Gebze Kirazpınar İlkokulu
KOCAELİ - GEBZE - Gebze Kirazpınar Ortaokulu
KOCAELİ - GEBZE - Gebze Kocatepe Ortaokulu
KOCAELİ - GEBZE - Gebze Mehmet Alp Tiryakioğlu İlkokulu
KOCAELİ - GEBZE - Gebze Mesleki Eğitim Merkezi
KOCAELİ - GEBZE - Gebze Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - GEBZE - Gebze Mesude İşman Ortaokulu
KOCAELİ - GEBZE - Gebze Muallimköy Turizm Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - GEBZE - Gebze Muzaffer Altıntaş İmam Hatip Ortaokulu
KOCAELİ - GEBZE - Gebze Nasrettin Hoca Anaokulu
KOCAELİ - GEBZE - Gebze Öğretmenevi ve Akşam Sanat Okulu
KOCAELİ - GEBZE - GEBZE ÖZEL EĞİTİM İŞ UYGULAMA MERKEZİ (OKULU)
KOCAELİ - GEBZE - Gebze Özel Eğitim Meslek Okulu
KOCAELİ - GEBZE - Gebze Özel Eğitim Uygulama Merkezi II. Kademe
KOCAELİ - GEBZE - Gebze Özel Eğitim Uygulama Okulu I. Kademe
KOCAELİ - GEBZE - Gebze Rehberlik ve Araştırma Merkezi
KOCAELİ - GEBZE - Gebze STFA Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - GEBZE - Gebze Sultan Ayhan İlkokulu
KOCAELİ - GEBZE - Gebze Sultanorhan Anaokulu
KOCAELİ - GEBZE - Gebze Süleyman Demirel Anadolu Lisesi
KOCAELİ - GEBZE - Gebze Yunus Emre Anaokulu
KOCAELİ - GEBZE - Hacı Ayvacıoğlu İsmail Başaran Ortaokulu
KOCAELİ - GEBZE - Hacı Meliha-Mustafa Başaran Özel Eğitim Anaokulu
KOCAELİ - GEBZE - Hürriyet İlkokulu
KOCAELİ - GEBZE - Hürriyet Ortaokulu
KOCAELİ - GEBZE - İbn-i Sina Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - GEBZE - İl Genel Meclisi İlkokulu
KOCAELİ - GEBZE - İl Genel Meclisi Ortaokulu
KOCAELİ - GEBZE - İlyasbey Ortaokulu
KOCAELİ - GEBZE - İnönü Ortaokulu
KOCAELİ - GEBZE - Kadıllı İlkokulu
KOCAELİ - GEBZE - Kanuni Sosyal Bilimler Lisesi
KOCAELİ - GEBZE - Kargalı İlkokulu
KOCAELİ - GEBZE - Kargalı Ortaokulu
KOCAELİ - GEBZE - Koç Ortaokulu
KOCAELİ - GEBZE - Kroman Çelik İlkokulu
KOCAELİ - GEBZE - Mehmet Akif Ersoy İlkokulu
KOCAELİ - GEBZE - Mehmet Tuğrul Tekbulut Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - GEBZE - Mevlana Meslekî ve Teknik Anadolu Lisesi
KOCAELİ - GEBZE - Mimar Sinan İlkokulu
KOCAELİ - GEBZE - Mimar Sinan Ortaokulu
KOCAELİ - GEBZE - Molla Fenari Anadolu İmam Hatip Lisesi
KOCAELİ - GEBZE - Mollafenari İlkokulu
KOCAELİ - GEBZE - Mollafenari Ortaokulu
KOCAELİ - GEBZE - Muallimköy İlkokulu
KOCAELİ - GEBZE - Mudarlı İlkokulu
KOCAELİ - GEBZE - Mustafa Paşa İlkokulu
KOCAELİ - GEBZE - Mustafa Paşa Ortaokulu
KOCAELİ - GEBZE - Mustafa Üstündağ Ortaokulu
KOCAELİ - GEBZE - Mustafapaşa Anadolu Lisesi
KOCAELİ - GEBZE - Mutlukent İlkokulu
KOCAELİ - GEBZE - Necip Fazıl Kısakürek İmam Hatip Ortaokulu
KOCAELİ - GEBZE - Necip Fazıl Kısakürek Ortaokulu
KOCAELİ - GEBZE - Nene Hatun Özel Eğitim Anaokulu
KOCAELİ - GEBZE - Orhangazi İlkokulu
KOCAELİ - GEBZE - Osmangazi Ortaokulu
KOCAELİ - GEBZE - Ovacık İlkokulu
KOCAELİ - GEBZE - PAGEV Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - GEBZE - Pelitli Halil Çelik İlkokulu
KOCAELİ - GEBZE - Pelitli Halil Çelik Ortaokulu
KOCAELİ - GEBZE - Sarkuysan Anadolu Lisesi
KOCAELİ - GEBZE - Sultanorhan Ortaokulu
KOCAELİ - GEBZE - Şehit İlker Ağçay İlkokulu
KOCAELİ - GEBZE - Şehit Kadir Kasa İmam Hatip Ortaokulu
KOCAELİ - GEBZE - Şehit Öğretmen Necmeddin Kuyucu Anadolu Lisesi
KOCAELİ - GEBZE - Şehit Ömer Can Açıkgöz Kız Anadolu İmam Hatip Lisesi
KOCAELİ - GEBZE - Şehit Polat Özbek İlkokulu
KOCAELİ - GEBZE - Şehit Ümit İnan İlkokulu
KOCAELİ - GEBZE - Şükran Kayabay Anaokulu
KOCAELİ - GEBZE - Tavşanlı İlkokulu
KOCAELİ - GEBZE - Tavşanlı Ortaokulu
KOCAELİ - GEBZE - Ticaret Odası Vakfı Ticaret Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - GEBZE - TÜBİTAK Fen Lisesi
KOCAELİ - GEBZE - Ulus Ortaokulu
KOCAELİ - GEBZE - Ülkem İlkokulu
KOCAELİ - GEBZE - Vilayetler Hizmet Birliği Anaokulu
KOCAELİ - GEBZE - Yahya Kemal Beyatlı İlkokulu
KOCAELİ - GEBZE - Yavuz Selim Anaokulu
KOCAELİ - GEBZE - Yavuz Selim İlkokulu
KOCAELİ - GEBZE - Yavuz Selim Ortaokulu
KOCAELİ - GEBZE - Yıldırım Beyazıt Ortaokulu
KOCAELİ - GEBZE - Yumrukaya Özel Eğitim Uygulama Okulu I. Kademe
KOCAELİ - GEBZE - Yumrukaya Özel Eğitim Uygulama Okulu II. Kademe
KOCAELİ - GEBZE - Yumrukaya Özel Eğitim Uygulama Okulu III. Kademe
KOCAELİ - GEBZE - Yunus Emre Ortaokulu
KOCAELİ - GEBZE - Yücel Boru Fen Lisesi
KOCAELİ - GEBZE - Zafer İlkokulu
KOCAELİ - GEBZE - Ziya Gökalp Kız Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - GEBZE - Zübeyde Hanım Ortaokulu
KOCAELİ - GÖLCÜK - Anadolu Kalkınma Vakfı Kız Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - GÖLCÜK - Barbaros Hayrettin Anadolu Lisesi
KOCAELİ - GÖLCÜK - Barbaros İlkokulu
KOCAELİ - GÖLCÜK - Cahit Külebi Ortaokulu
KOCAELİ - GÖLCÜK - Cumhuriyet İlkokulu
KOCAELİ - GÖLCÜK - Değirmendere Atatürk Ortaokulu
KOCAELİ - GÖLCÜK - Değirmendere Müfit Saner İlkokulu
KOCAELİ - GÖLCÜK - Değirmendere Şehit Cengiz Topel İlkokulu
KOCAELİ - GÖLCÜK - Değirmendere Uğur Mumcu Ortaokulu
KOCAELİ - GÖLCÜK - Donanma Anaokulu
KOCAELİ - GÖLCÜK - Donanma İlkokulu
KOCAELİ - GÖLCÜK - Düzağaç Anaokulu
KOCAELİ - GÖLCÜK - Eyüp Sultan Anadolu İmam Hatip Lisesi
KOCAELİ - GÖLCÜK - Eyüp Sultan İmam Hatip Ortaokulu
KOCAELİ - GÖLCÜK - Gölcük 15 Temmuz Şehitleri Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - GÖLCÜK - Gölcük Adnan Menderes Anadolu İmam Hatip Lisesi
KOCAELİ - GÖLCÜK - Gölcük Anadolu Lisesi
KOCAELİ - GÖLCÜK - Gölcük Atatürk Anadolu Lisesi
KOCAELİ - GÖLCÜK - Gölcük Çakabey Anadolu Lisesi
KOCAELİ - GÖLCÜK - Gölcük Fatih Sultan Mehmet Anadolu Lisesi
KOCAELİ - GÖLCÜK - Gölcük Fen Lisesi
KOCAELİ - GÖLCÜK - Gölcük Goncagüller Anaokulu
KOCAELİ - GÖLCÜK - Gölcük Halk Eğitimi Merkezi
KOCAELİ - GÖLCÜK - Gölcük İhsaniye Ticaret Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - GÖLCÜK - Gölcük İmam Hatip Ortaokulu
KOCAELİ - GÖLCÜK - Gölcük Kız Anadolu İmam Hatip Lisesi
KOCAELİ - GÖLCÜK - Gölcük Mecit Kavan İmam Hatip Ortaokulu
KOCAELİ - GÖLCÜK - Gölcük Mesleki Eğitim Merkezi
KOCAELİ - GÖLCÜK - Gölcük Ortaokulu
KOCAELİ - GÖLCÜK - Gölcük Öğretmenevi ve Akşam Sanat Okulu
KOCAELİ - GÖLCÜK - Gölcük Özel Eğitim Meslek Okulu
KOCAELİ - GÖLCÜK - Gölcük Rehberlik ve Araştırma Merkezi
KOCAELİ - GÖLCÜK - Gölcük Rheinland Pfalz İlkokulu
KOCAELİ - GÖLCÜK - Gölcük Rotterdam İlkokulu
KOCAELİ - GÖLCÜK - Gölcük Saraylı Yunus Emre Anaokulu
KOCAELİ - GÖLCÜK - Gölcük Şirinköy Anaokulu
KOCAELİ - GÖLCÜK - Gölcük Turgut Özal İlkokulu
KOCAELİ - GÖLCÜK - Gölcük Yenimahalle İmam Hatip Ortaokulu
KOCAELİ - GÖLCÜK - Hacı Halit Erkut Meslekî ve Teknik Anadolu Lisesi
KOCAELİ - GÖLCÜK - Halıdere İlkokulu
KOCAELİ - GÖLCÜK - Halıdere Ortaokulu
KOCAELİ - GÖLCÜK - Hamidiye İlkokulu
KOCAELİ - GÖLCÜK - Hamidiye Ortaokulu
KOCAELİ - GÖLCÜK - Hisareyn İlkokulu
KOCAELİ - GÖLCÜK - Hisareyn Ortaokulu
KOCAELİ - GÖLCÜK - İhsaniye Anadolu Lisesi
KOCAELİ - GÖLCÜK - İhsaniye Çiftlik İlkokulu
KOCAELİ - GÖLCÜK - İhsaniye Fidanlık İlkokulu
KOCAELİ - GÖLCÜK - İhsaniye Fidanlık Ortaokulu
KOCAELİ - GÖLCÜK - İhsaniye İlkokulu
KOCAELİ - GÖLCÜK - İhsaniye Ortaokulu
KOCAELİ - GÖLCÜK - İhsaniye Yazlık Ics-Opel Uluslararası Dostluk Ortaokulu
KOCAELİ - GÖLCÜK - Kavaklı Şehit Onbaşı Adem Başoğlu Ortaokulu
KOCAELİ - GÖLCÜK - Kocaeli Sanayi Odası Dumlupınar Ortaokulu
KOCAELİ - GÖLCÜK - Kocatepe Ortaokulu
KOCAELİ - GÖLCÜK - Mehmet Akif İlkokulu
KOCAELİ - GÖLCÜK - Mehmet Akif Ortaokulu
KOCAELİ - GÖLCÜK - Ömer Seyfettin Ortaokulu
KOCAELİ - GÖLCÜK - ÖZ-DE-BİR Özel Eğitim Uygulama Okulu I. Kademe
KOCAELİ - GÖLCÜK - ÖZ-DE-BİR Özel Eğitim Uygulama Okulu II. Kademe
KOCAELİ - GÖLCÜK - Piri Reis İlkokulu
KOCAELİ - GÖLCÜK - Piyalepaşa İlkokulu
KOCAELİ - GÖLCÜK - Saraylı İlkokulu
KOCAELİ - GÖLCÜK - Saraylı Ortaokulu
KOCAELİ - GÖLCÜK - Şehit Bülent Albayrak İlkokulu
KOCAELİ - GÖLCÜK - Şehit İsmail Demircan İlkokulu
KOCAELİ - GÖLCÜK - Şehit İzzet Emir İmam Hatip Ortaokulu
KOCAELİ - GÖLCÜK - Şehit Kamuran Ablak Ortaokulu
KOCAELİ - GÖLCÜK - Şehit Volkan TANTÜRK Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - GÖLCÜK - Tersane İlkokulu
KOCAELİ - GÖLCÜK - Ulaşlı Nuri Bermek İlkokulu
KOCAELİ - GÖLCÜK - Ulaşlı Nuri Bermek Ortaokulu
KOCAELİ - GÖLCÜK - Yaşama Sevinci Özel Eğitim Uygulama Okulu I. Kademe
KOCAELİ - GÖLCÜK - Yaşama Sevinci Özel Eğitim Uygulama Okulu II. Kademe
KOCAELİ - GÖLCÜK - Yaşama Sevinci Özel Eğitim Uygulama Okulu III. Kademe
KOCAELİ - GÖLCÜK - Yazlık Tabosan İlkokulu
KOCAELİ - GÖLCÜK - Yazlık Tabosan Ortaokulu
KOCAELİ - GÖLCÜK - Yücel Koyuncu Bilim ve Sanat Merkezi
KOCAELİ - İZMİT - 23 Nisan İlkokulu
KOCAELİ - İZMİT - 24 Kasım Anadolu Lisesi
KOCAELİ - İZMİT - 28 Haziran İlkokulu
KOCAELİ - İZMİT - 28 Haziran Ortaokulu
KOCAELİ - İZMİT - 29 Ekim Ortaokulu
KOCAELİ - İZMİT - 30 Ağustos İlkokulu
KOCAELİ - İZMİT - 30 Ağustos Ortaokulu
KOCAELİ - İZMİT - 50. Yıl Cumhuriyet Ortaokulu
KOCAELİ - İZMİT - 7. Boru Ortaokulu
KOCAELİ - İZMİT - 75. Yıl Cumhuriyet İlkokulu
KOCAELİ - İZMİT - 75. Yıl Cumhuriyet Ortaokulu
KOCAELİ - İZMİT - Akçakoca İlkokulu
KOCAELİ - İZMİT - Akmeşe İlkokulu
KOCAELİ - İZMİT - Akmeşe Ortaokulu
KOCAELİ - İZMİT - Akşemsettin İlkokulu
KOCAELİ - İZMİT - Albay İbrahim Karaoğlanoğlu İlkokulu
KOCAELİ - İZMİT - Alikahya Fatih Ortaokulu
KOCAELİ - İZMİT - Alikahya İlkokulu
KOCAELİ - İZMİT - Ana Sultan Anaokulu
KOCAELİ - İZMİT - Anakucağı Anaokulu
KOCAELİ - İZMİT - Atatürk Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - İZMİT - Atatürk Ortaokulu
KOCAELİ - İZMİT - Atılım Anaokulu
KOCAELİ - İZMİT - Banu Çiçek Anaokulu
KOCAELİ - İZMİT - Bayraktar İlkokulu
KOCAELİ - İZMİT - Bayraktar Ortaokulu
KOCAELİ - İZMİT - Bilgün Dereli Anaokulu
KOCAELİ - İZMİT - Cahit Elginkan Anadolu Lisesi
KOCAELİ - İZMİT - Çubuklu Osmaniye İlkokulu
KOCAELİ - İZMİT - Çubuklu Osmaniye Ortaokulu
KOCAELİ - İZMİT - Dr. Ferdi Koçal İlkokulu
KOCAELİ - İZMİT - Edebali Ortaokulu
KOCAELİ - İZMİT - Elma Şekeri Anaokulu
KOCAELİ - İZMİT - Emek Dayanışması İlkokulu
KOCAELİ - İZMİT - Ertuğrulgazi İlkokulu
KOCAELİ - İZMİT - Fahreddin Paşa Ortaokulu
KOCAELİ - İZMİT - Farabi İlkokulu
KOCAELİ - İZMİT - Farabi Ortaokulu
KOCAELİ - İZMİT - Fatih Anaokulu
KOCAELİ - İZMİT - Fatih İmam Hatip Ortaokulu
KOCAELİ - İZMİT - Fatma Ana Anaokulu
KOCAELİ - İZMİT - Fatma Seher İlkokulu
KOCAELİ - İZMİT - Fatma Seher Ortaokulu
KOCAELİ - İZMİT - Fevzi Çakmak İlkokulu
KOCAELİ - İZMİT - Ford Otosan Ortaokulu
KOCAELİ - İZMİT - Gültepe İlkokulu
KOCAELİ - İZMİT - Gündoğdu İlkokulu
KOCAELİ - İZMİT - Hacı Bektaş Veli Ortaokulu
KOCAELİ - İZMİT - Hacı Birsen-İrfan Çepni İlkokulu
KOCAELİ - İZMİT - Hacı Zehra- Hacı Ahmet Hamdi Çepni İlkokulu
KOCAELİ - İZMİT - Hakkaniye İlkokulu
KOCAELİ - İZMİT - Hakkaniye Ortaokulu
KOCAELİ - İZMİT - Hızır Reis İlkokulu
KOCAELİ - İZMİT - İbni Sina Anadolu İmam Hatip Lisesi
KOCAELİ - İZMİT - İbrahim Süreyya Yiğit İlkokulu
KOCAELİ - İZMİT - İlkadım Anaokulu
KOCAELİ - İZMİT - İnkılap Ortaokulu
KOCAELİ - İZMİT - İSU Anaokulu
KOCAELİ - İZMİT - İzmit Anadolu İmam Hatip Lisesi
KOCAELİ - İZMİT - İzmit Atılım Anadolu Lisesi
KOCAELİ - İZMİT - İzmit Başöğretmen Ticaret Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - İZMİT - İzmit Bilim ve Sanat Merkezi
KOCAELİ - İZMİT - İzmit Evliya Çelebi Kız Anadolu İmam Hatip Lisesi
KOCAELİ - İZMİT - İzmit Halk Eğitimi Merkezi
KOCAELİ - İZMİT - İzmit Lisesi
KOCAELİ - İZMİT - İzmit Mesleki Eğitim Merkezi
KOCAELİ - İZMİT - İzmit Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - İZMİT - İzmit Muallim Naci Anadolu Lisesi
KOCAELİ - İZMİT - İzmit Nuh Çimento Özel Eğitim Meslek Okulu
KOCAELİ - İZMİT - İzmit Ortaokulu
KOCAELİ - İZMİT - İzmit Öğretmenevi ve Akşam Sanat Okulu
KOCAELİ - İZMİT - İZMİT ÖZEL EĞİTİM UYGULAMA MERKEZİ II. KADEME
KOCAELİ - İZMİT - İzmit Özel Eğitim Uygulama Okulu I. Kademe
KOCAELİ - İZMİT - İzmit Özel Eğitim Uygulama Okulu III. Kademe
KOCAELİ - İZMİT - İzmit Rehberlik ve Araştırma Merkezi
KOCAELİ - İZMİT - Kanuni Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - İZMİT - Kardelen Anaokulu
KOCAELİ - İZMİT - Kazım Karabekir Ortaokulu
KOCAELİ - İZMİT - Kılıçarslan İlkokulu
KOCAELİ - İZMİT - Kılıçarslan Ortaokulu
KOCAELİ - İZMİT - Kocaeli Fen Lisesi
KOCAELİ - İZMİT - Kocaeli Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - İZMİT - Kocatepe İlkokulu
KOCAELİ - İZMİT - Kocatepe Ortaokulu
KOCAELİ - İZMİT - Kuvayi Milliye İlkokulu
KOCAELİ - İZMİT - Leyla Atakan İlkokulu
KOCAELİ - İZMİT - Mehmet Akif Ersoy Kız Anadolu İmam Hatip Lisesi
KOCAELİ - İZMİT - Mehmet Akif İlkokulu
KOCAELİ - İZMİT - Mehmet Akif Ortaokulu
KOCAELİ - İZMİT - Mehmet Sinan Dereli Ortaokulu
KOCAELİ - İZMİT - Mehmetçik İlkokulu
KOCAELİ - İZMİT - Mesut Barış Anadolu İmam Hatip Lisesi
KOCAELİ - İZMİT - Mesut Barış Anaokulu
KOCAELİ - İZMİT - Milli Eğitim Yayınevi
KOCAELİ - İZMİT - Mimar Sinan Anadolu Lisesi
KOCAELİ - İZMİT - Mimar Sinan İmam Hatip Ortaokulu
KOCAELİ - İZMİT - Mimar Sinan Ortaokulu
KOCAELİ - İZMİT - Muammer Aksoy İlkokulu
KOCAELİ - İZMİT - Muammer Dereli Fen Lisesi
KOCAELİ - İZMİT - Namık Kemal Anadolu Lisesi
KOCAELİ - İZMİT - Necip Fazıl Kısakürek Anadolu İmam Hatip Lisesi
KOCAELİ - İZMİT - Nuh Çimento İmam Hatip Ortaokulu
KOCAELİ - İZMİT - Nuh Çimento Kız Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - İZMİT - Sabancı Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - İZMİT - Saraybahçe Anaokulu
KOCAELİ - İZMİT - Saraybahçe İlkokulu
KOCAELİ - İZMİT - Solaklar İlkokulu
KOCAELİ - İZMİT - Solaklar Ortaokulu
KOCAELİ - İZMİT - Şehit Alper Al Ortaokulu
KOCAELİ - İZMİT - Şehit İskender Ercan İlkokulu
KOCAELİ - İZMİT - Şehit Kadir Hasan Tanrıverdi İlkokulu
KOCAELİ - İZMİT - Şehit Öğretmen Ergin Komut Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - İZMİT - Şehit Öğretmen Erkan Aydın İlkokulu
KOCAELİ - İZMİT - Şehit Öğretmen Erkan Aydın Ortaokulu
KOCAELİ - İZMİT - Şehit Özcan Kan Fen Lisesi
KOCAELİ - İZMİT - Şehit Polis Volkan Sabaz İlkokulu
KOCAELİ - İZMİT - Şehit Selçuk Gökdağ İlkokulu
KOCAELİ - İZMİT - Şehit Selçuk Gökdağ Ortaokulu
KOCAELİ - İZMİT - Şehit Ümit Balkan İlkokulu
KOCAELİ - İZMİT - Şehit Ümit Balkan Ortaokulu
KOCAELİ - İZMİT - Tavşantepe İlkokulu
KOCAELİ - İZMİT - Tevfik Seno Arda Anadolu Lisesi
KOCAELİ - İZMİT - Topçular İlkokulu
KOCAELİ - İZMİT - Türk Pirelli Ortaokulu
KOCAELİ - İZMİT - Türkan Dereli İlkokulu
KOCAELİ - İZMİT - Türkiye Büyük Millet Meclisi İlkokulu
KOCAELİ - İZMİT - Ulubatlı Hasan Ortaokulu
KOCAELİ - İZMİT - Ulugazi İlkokulu
KOCAELİ - İZMİT - Uluğbey Anadolu Lisesi
KOCAELİ - İZMİT - Ulusal Egemenlik İlkokulu
KOCAELİ - İZMİT - Ulusal Egemenlik Ortaokulu
KOCAELİ - İZMİT - Yahya Kaptan Anadolu Lisesi
KOCAELİ - İZMİT - Yahya Kaptan İlkokulu
KOCAELİ - İZMİT - Yahya Kaptan Ortaokulu
KOCAELİ - İZMİT - Yarbay Refik Cesur İlkokulu
KOCAELİ - İZMİT - Yenimahalle İlkokulu
KOCAELİ - İZMİT - Yenimahalle Ortaokulu
KOCAELİ - İZMİT - Yenituran Anaokulu
KOCAELİ - İZMİT - Yıldırım Ticaret Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - İZMİT - Yunus Emre Kız Anadolu İmam Hatip Lisesi
KOCAELİ - İZMİT - Ziya Gökalp İlkokulu
KOCAELİ - İZMİT - Zübeyde Hanım İlkokulu
KOCAELİ - İZMİT - Zübeyde Hanım Kız Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - KANDIRA - Adalet Anaokulu
KOCAELİ - KANDIRA - Akçakoca İlkokulu
KOCAELİ - KANDIRA - Akçaova İlkokulu
KOCAELİ - KANDIRA - Akçaova Ortaokulu
KOCAELİ - KANDIRA - Anadolu Kalkınma Vakfı Bağırganlı İlkokulu
KOCAELİ - KANDIRA - Anadolu Kalkınma Vakfı Bağırganlı Ortaokulu
KOCAELİ - KANDIRA - Anadolu Kalkınma Vakfı Ballar İlkokulu
KOCAELİ - KANDIRA - Anadolu Kalkınma Vakfı Ballar Ortaokulu
KOCAELİ - KANDIRA - Çerçili Sefa Sirmen İlkokulu
KOCAELİ - KANDIRA - Çerçilli Sefa Sirmen Ortaokulu
KOCAELİ - KANDIRA - Eğercili Namık Kemal İlkokulu
KOCAELİ - KANDIRA - Eğercili Namık Kemal Ortaokulu
KOCAELİ - KANDIRA - Kandıra Akçakoca Anadolu Lisesi
KOCAELİ - KANDIRA - Kandıra Anadolu İmam Hatip Lisesi
KOCAELİ - KANDIRA - Kandıra Anadolu Lisesi
KOCAELİ - KANDIRA - Kandıra Bozburun İlkokulu
KOCAELİ - KANDIRA - Kandıra Bozburun Ortaokulu
KOCAELİ - KANDIRA - Kandıra Çamkonak İlkokulu
KOCAELİ - KANDIRA - Kandıra Halk Eğitimi Merkezi
KOCAELİ - KANDIRA - Kandıra İmam Hatip Ortaokulu
KOCAELİ - KANDIRA - Kandıra Kız Anadolu İmam Hatip Lisesi
KOCAELİ - KANDIRA - Kandıra Öğretmenevi ve Akşam Sanat Okulu
KOCAELİ - KANDIRA - Kandıra Özel Eğitim Uygulama Okulu I. Kademe
KOCAELİ - KANDIRA - Kandıra Özel Eğitim Uygulama Okulu II. Kademe
KOCAELİ - KANDIRA - Kandıra Selma-Orhon Atameriç Anaokulu
KOCAELİ - KANDIRA - Karaağaç İlkokulu
KOCAELİ - KANDIRA - Karaağaç Ortaokulu
KOCAELİ - KANDIRA - Kaymaz Araman İlkokulu
KOCAELİ - KANDIRA - Kaymaz Araman Ortaokulu
KOCAELİ - KANDIRA - Kefken İmam Hatip Ortaokulu
KOCAELİ - KANDIRA - Kefken Şehit Oğuz Kır İlkokulu
KOCAELİ - KANDIRA - Kefken Şehit Oğuz Kır Ortaokulu
KOCAELİ - KANDIRA - Kırkarmut Şehit Er Ahsen Budak İlkokulu
KOCAELİ - KANDIRA - Kocaeli Adalet Mesleki Eğitim Merkezi
KOCAELİ - KANDIRA - Kocakaymaz Yunus Emre İlkokulu
KOCAELİ - KANDIRA - Kocakaymaz Yunus Emre Ortaokulu
KOCAELİ - KANDIRA - Mehmet Akif Ersoy İlkokulu
KOCAELİ - KANDIRA - Özbey İlkokulu
KOCAELİ - KANDIRA - Özbey Ortaokulu
KOCAELİ - KANDIRA - Perihan - Ahsen Akalın Anaokulu
KOCAELİ - KANDIRA - Safalı İlkokulu
KOCAELİ - KANDIRA - Safalı Ortaokulu
KOCAELİ - KANDIRA - Seyitaliler Atatürk İlkokulu
KOCAELİ - KANDIRA - Seyitaliler Atatürk Ortaokulu
KOCAELİ - KANDIRA - Şehit Abdulsamet Özen Ortaokulu
KOCAELİ - KANDIRA - Şehit Yavuz Sonat Güzel Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - KANDIRA - Tasvire Hurşit Güneş Ortaokulu
KOCAELİ - KANDIRA - Yusufça Şehit İrfan Yaman İlkokulu
KOCAELİ - KANDIRA - Yusufça Şehit İrfan Yaman Ortaokulu
KOCAELİ - KANDIRA - Zafer İlkokulu
KOCAELİ - KARAMÜRSEL - 4 Temmuz Şehit Hüseyin Güldal Ortaokulu
KOCAELİ - KARAMÜRSEL - A.Gazanfer Bilge İşitme Engelliler İlkokulu
KOCAELİ - KARAMÜRSEL - A.Gazanfer Bilge İşitme Engelliler Ortaokulu
KOCAELİ - KARAMÜRSEL - Ahmet Gazanfer Bilge İlkokulu
KOCAELİ - KARAMÜRSEL - Ahmet Gazanfer Bilge Ortaokulu
KOCAELİ - KARAMÜRSEL - Akçat İlkokulu
KOCAELİ - KARAMÜRSEL - Amiral Karamürsel İlkokulu
KOCAELİ - KARAMÜRSEL - Atatürk Ortaokulu
KOCAELİ - KARAMÜRSEL - Bekir İlhami - Fatma Nedime Calp İlkokulu
KOCAELİ - KARAMÜRSEL - Bekir İlhami - Fatma Nedime Calp Ortaokulu
KOCAELİ - KARAMÜRSEL - Dr. Pembe Müjgan Calp Gökçora Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - KARAMÜRSEL - Güzelkıyı İlkokulu
KOCAELİ - KARAMÜRSEL - Güzelkıyı Ortaokulu
KOCAELİ - KARAMÜRSEL - Karamürsel 100. Yıl Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - KARAMÜRSEL - Karamürsel Akçakoca Anadolu İmam Hatip Lisesi
KOCAELİ - KARAMÜRSEL - Karamürsel Alp Anadolu Lisesi
KOCAELİ - KARAMÜRSEL - Karamürsel Anadolu İmam Hatip Lisesi
KOCAELİ - KARAMÜRSEL - Karamürsel Anadolu Lisesi
KOCAELİ - KARAMÜRSEL - Karamürsel Anaokulu
KOCAELİ - KARAMÜRSEL - Karamürsel Halk Eğitimi Merkezi
KOCAELİ - KARAMÜRSEL - Karamürsel Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - KARAMÜRSEL - Karamürsel Öğretmenevi ve Akşam Sanat Okulu
KOCAELİ - KARAMÜRSEL - Karapınar İlkokulu
KOCAELİ - KARAMÜRSEL - Kaymakam Hikmet Özbağcı İlkokulu
KOCAELİ - KARAMÜRSEL - Kızderbent İlkokulu
KOCAELİ - KARAMÜRSEL - Mürsel Gazi Ticaret Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - KARAMÜRSEL - Nazmi Oğuz Ortaokulu
KOCAELİ - KARAMÜRSEL - Necdet Calp İlkokulu
KOCAELİ - KARAMÜRSEL - Uçan Balon Anaokulu
KOCAELİ - KARAMÜRSEL - Yalakdere İlkokulu
KOCAELİ - KARAMÜRSEL - Yalakdere Ortaokulu
KOCAELİ - KARTEPE - 17 Ağustos İlkokulu
KOCAELİ - KARTEPE - Akçakoca Turizm Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - KARTEPE - Ali Güneri İlkokulu
KOCAELİ - KARTEPE - Ali Güneri Ortaokulu
KOCAELİ - KARTEPE - Arslanbey İlkokulu
KOCAELİ - KARTEPE - Arslanbey Ortaokulu
KOCAELİ - KARTEPE - Ataevler Ortaokulu
KOCAELİ - KARTEPE - Avluburun İlkokulu
KOCAELİ - KARTEPE - Avluburun Ortaokulu
KOCAELİ - KARTEPE - Avni Akyol İlkokulu
KOCAELİ - KARTEPE - Balaban İlkokulu
KOCAELİ - KARTEPE - Balaban Ortaokulu
KOCAELİ - KARTEPE - Derbent Anaokulu
KOCAELİ - KARTEPE - Derbent Ata İlkokulu
KOCAELİ - KARTEPE - Derbent Ortaokulu
KOCAELİ - KARTEPE - Dumlupınar İlkokulu
KOCAELİ - KARTEPE - Dumlupınar Ortaokulu
KOCAELİ - KARTEPE - Dürdane Özdilek İlkokulu
KOCAELİ - KARTEPE - Dürdane Özdilek Ortaokulu
KOCAELİ - KARTEPE - Ertuğrulgazi Anadolu Lisesi
KOCAELİ - KARTEPE - ERTUĞRULGAZİ ANAOKULU
KOCAELİ - KARTEPE - Eşme İlkokulu
KOCAELİ - KARTEPE - Eşme Ortaokulu
KOCAELİ - KARTEPE - Eşme Yeni Yüksektepe Anaokulu
KOCAELİ - KARTEPE - Eşref Uslu İlkokulu
KOCAELİ - KARTEPE - Eşref Uslu Ortaokulu
KOCAELİ - KARTEPE - Fatih Sultan Mehmet Ortaokulu
KOCAELİ - KARTEPE - Fevziye Tezcan Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - KARTEPE - Gülbahar Hatun Anaokulu
KOCAELİ - KARTEPE - Gülbahar Hatun İlkokulu
KOCAELİ - KARTEPE - Gülbahar Hatun Kız Anadolu İmam Hatip Lisesi
KOCAELİ - KARTEPE - Hacı Halim Karslı İlkokulu
KOCAELİ - KARTEPE - Hacı Halim Karslı Ortaokulu
KOCAELİ - KARTEPE - Halise Türkkan Ortaokulu
KOCAELİ - KARTEPE - Hasanpaşa İlkokulu
KOCAELİ - KARTEPE - Hasanpaşa Ortaokulu
KOCAELİ - KARTEPE - Hüma Hatun Anaokulu
KOCAELİ - KARTEPE - İstasyon İlkokulu
KOCAELİ - KARTEPE - İstasyon Ortaokulu
KOCAELİ - KARTEPE - Kamer Öncel Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - KARTEPE - Karatepe İlkokulu
KOCAELİ - KARTEPE - Karatepe Ortaokulu
KOCAELİ - KARTEPE - Kartepe Anadolu İmam Hatip Lisesi
KOCAELİ - KARTEPE - Kartepe Anadolu Lisesi
KOCAELİ - KARTEPE - Kartepe Esma Ay Anaokulu
KOCAELİ - KARTEPE - Kartepe Halk Eğitimi Merkezi
KOCAELİ - KARTEPE - Kartepe Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - KARTEPE - Kartepe Özel Eğitim Uygulama Okulu I. Kademe
KOCAELİ - KARTEPE - Kartepe Özel Eğitim Uygulama Okulu II. Kademe
KOCAELİ - KARTEPE - Kartepe Özel Eğitim Uygulama Okulu III. Kademe
KOCAELİ - KARTEPE - Kartepe Pakmaya Muzaffer İncekara İlkokulu
KOCAELİ - KARTEPE - Kartepe Pakmaya Muzaffer İncekara Ortaokulu
KOCAELİ - KARTEPE - Kocaeli Ali Fuat Başgil Sosyal Bilimler Lisesi
KOCAELİ - KARTEPE - Kocaeli Güzel Sanatlar Lisesi
KOCAELİ - KARTEPE - Kocaeli Hayrettin Gürsoy Spor Lisesi
KOCAELİ - KARTEPE - Köseköy Gazi İlkokulu
KOCAELİ - KARTEPE - Kubilay İlkokulu
KOCAELİ - KARTEPE - Kubilay Ortaokulu
KOCAELİ - KARTEPE - Leyla Sarıgöl İlkokulu
KOCAELİ - KARTEPE - Leyla Sarıgöl Ortaokulu
KOCAELİ - KARTEPE - Maşukiye Anadolu Lisesi
KOCAELİ - KARTEPE - Mavi Boncuk Anaokulu
KOCAELİ - KARTEPE - Nusretiye İlkokulu
KOCAELİ - KARTEPE - Osmangazi İlkokulu
KOCAELİ - KARTEPE - Ömer Nasuhi Bilmen Kız Anadolu İmam Hatip Lisesi
KOCAELİ - KARTEPE - Pakmaya Ortaokulu
KOCAELİ - KARTEPE - Pirelli Anadolu Lisesi
KOCAELİ - KARTEPE - Rabak İlkokulu
KOCAELİ - KARTEPE - Rabak Ortaokulu
KOCAELİ - KARTEPE - Rahmiye İlkokulu
KOCAELİ - KARTEPE - Rahmiye Ortaokulu
KOCAELİ - KARTEPE - Sarımeşe İlkokulu
KOCAELİ - KARTEPE - Suadiye Barbaros İlkokulu
KOCAELİ - KARTEPE - Suadiye Barbaros Ortaokulu
KOCAELİ - KARTEPE - Suadiye İlkokulu
KOCAELİ - KARTEPE - Suadiye Ortaokulu
KOCAELİ - KARTEPE - Süleyman Şah İlkokulu
KOCAELİ - KARTEPE - Şehit Piyade Üsteğmen Murat Hasırcıoğlu Ortaokulu
KOCAELİ - KARTEPE - Şevkatiye İlkokulu
KOCAELİ - KARTEPE - Şirinsulhiye İlkokulu
KOCAELİ - KARTEPE - Türk Fransız Kardeşlik İlkokulu
KOCAELİ - KARTEPE - Türk Fransız Kardeşlik Ortaokulu
KOCAELİ - KARTEPE - Veli Akgün İlkokulu
KOCAELİ - KARTEPE - Yeşiltepe Anaokulu
KOCAELİ - KARTEPE - Yıldız Entegre Anadolu Lisesi
KOCAELİ - KARTEPE - Yıldız Entegre İmam Hatip Ortaokulu
KOCAELİ - KARTEPE - Yıldız Entegre Ticaret Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - KÖRFEZ - 100. Yıl Atatürk İlkokulu
KOCAELİ - KÖRFEZ - Ahmet Taner Kışlalı İlkokulu
KOCAELİ - KÖRFEZ - Anadolu İlkokulu
KOCAELİ - KÖRFEZ - Atatürk Ortaokulu
KOCAELİ - KÖRFEZ - Barbaros İmam Hatip Ortaokulu
KOCAELİ - KÖRFEZ - Çamlıtepe Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - KÖRFEZ - Çelik Sanayi Ortaokulu
KOCAELİ - KÖRFEZ - Fatih İlkokulu
KOCAELİ - KÖRFEZ - General Edip Bayoğlu İlkokulu
KOCAELİ - KÖRFEZ - Halide Edip Adıvar Ortaokulu
KOCAELİ - KÖRFEZ - Hereke Anadolu İmam Hatip Lisesi
KOCAELİ - KÖRFEZ - Hereke Anadolu Lisesi
KOCAELİ - KÖRFEZ - Hereke Kışladüzü İlkokulu
KOCAELİ - KÖRFEZ - Hereke Kışladüzü Ortaokulu
KOCAELİ - KÖRFEZ - Hereke Nuh Çimento Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - KÖRFEZ - Hereke Nuh Çimento Ortaokulu
KOCAELİ - KÖRFEZ - Hereke Özel Eğitim Uygulama Okulu I. Kademe
KOCAELİ - KÖRFEZ - Hereke Özel Eğitim Uygulama Okulu II. Kademe
KOCAELİ - KÖRFEZ - Hereke Özel Eğitim Uygulama Okulu III. Kademe
KOCAELİ - KÖRFEZ - Hereke Sümer İlkokulu
KOCAELİ - KÖRFEZ - İgsaş Ortaokulu
KOCAELİ - KÖRFEZ - İlimtepe 17 Ağustos İlkokulu
KOCAELİ - KÖRFEZ - İlimtepe 17 Ağustos Ortaokulu
KOCAELİ - KÖRFEZ - İlimtepe Anadolu Lisesi
KOCAELİ - KÖRFEZ - İlimtepe İlkokulu
KOCAELİ - KÖRFEZ - İlimtepe Ortaokulu
KOCAELİ - KÖRFEZ - Kaşgarlı Mahmut İmam Hatip Ortaokulu
KOCAELİ - KÖRFEZ - Kirazlıyalı Tevfik Fikret İlkokulu
KOCAELİ - KÖRFEZ - Kirazlıyalı Tevfik Fikret Ortaokulu
KOCAELİ - KÖRFEZ - Körfez Anaokulu
KOCAELİ - KÖRFEZ - Körfez Atatürk Anadolu Lisesi
KOCAELİ - KÖRFEZ - Körfez Bilim ve Sanat Merkezi
KOCAELİ - KÖRFEZ - Körfez Emlak Konut Anadolu İmam Hatip Lisesi
KOCAELİ - KÖRFEZ - Körfez Halk Eğitimi Merkezi
KOCAELİ - KÖRFEZ - Körfez Hedise Evyap İlkokulu
KOCAELİ - KÖRFEZ - Körfez Hereke Uzunpınar İlkokulu
KOCAELİ - KÖRFEZ - KÖRFEZ HEREKE UZUNPINAR ORTAOKULU
KOCAELİ - KÖRFEZ - Körfez İmam Hatip Ortaokulu
KOCAELİ - KÖRFEZ - Körfez Mesleki Eğitim Merkezi
KOCAELİ - KÖRFEZ - Körfez Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - KÖRFEZ - Körfez Nene Hatun İlkokulu
KOCAELİ - KÖRFEZ - Körfez Orhangazi Anadolu Lisesi
KOCAELİ - KÖRFEZ - Körfez Özel Eğitim Uygulama Okulu I. Kademe
KOCAELİ - KÖRFEZ - Körfez Özel Eğitim Uygulama Okulu II. Kademe
KOCAELİ - KÖRFEZ - Körfez Özel Eğitim Uygulama Okulu III. Kademe
KOCAELİ - KÖRFEZ - Körfez Rehberlik ve Araştırma Merkezi
KOCAELİ - KÖRFEZ - Körfezkent Emlak Konut İlkokulu
KOCAELİ - KÖRFEZ - Körfezkent Emlak Konut Ortaokulu
KOCAELİ - KÖRFEZ - Med Marine Tuncer Şen Fen Lisesi
KOCAELİ - KÖRFEZ - Milangaz Hacer Demirören Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - KÖRFEZ - Mimar Sinan İlkokulu
KOCAELİ - KÖRFEZ - Mustafa Kemal Mesleki ve Teknik Anadolu Lisesi
KOCAELİ - KÖRFEZ - Nuh Çimento Vatan İlkokulu
KOCAELİ - KÖRFEZ - Nuh Çimento Vatan Ortaokulu
KOCAELİ - KÖRFEZ - Oruç Reis Anadolu Lisesi
KOCAELİ - KÖRFEZ - Petkim Ortaokulu
KOCAELİ - KÖRFEZ - Rıfat Ilgaz İlkokulu
KOCAELİ - KÖRFEZ - Rıfat Ilgaz Ortaokulu
KOCAELİ - KÖRFEZ - Seka Çocuk Dostları Ortaokulu
KOCAELİ - KÖRFEZ - Sevindikli İlkokulu
KOCAELİ - KÖRFEZ - Sevindikli Ortaokulu
KOCAELİ - KÖRFEZ - Tuğrul Bey İlkokulu
KOCAELİ - KÖRFEZ - Tüpraş 50. Yil Anadolu Lisesi
KOCAELİ - KÖRFEZ - Tüpraş İlkokulu
KOCAELİ - KÖRFEZ - Uluğbey Ortaokulu
KOCAELİ - KÖRFEZ - Yarımca Anadolu Lisesi
KOCAELİ - KÖRFEZ - Yarımca Anaokulu
KOCAELİ - KÖRFEZ - Yarımca Ortaokulu
KOCAELİ - KÖRFEZ - Yavuz Selim İlkokulu
KOCAELİ - KÖRFEZ - Yeniyalı Fahri Korutürk İlkokulu
KOCAELİ - KÖRFEZ - Yukarı Hereke İlkokulu
KOCAELİ - KÖRFEZ - Yukarı Hereke Ortaokulu
SAKARYA - TARAKLI - Yenidoğan Ortaokulu
SAKARYA - TARAKLI - Yenidoğan İlkokulu
SAKARYA - TARAKLI - Taraklı Zübeydehanım Anaokulu
SAKARYA - TARAKLI - Taraklı Öğretmenevi ve Akşam Sanat Okulu
SAKARYA - TARAKLI - Taraklı Ortaokulu
SAKARYA - TARAKLI - Taraklı İmam Hatip Ortaokulu
SAKARYA - TARAKLI - Taraklı Halk Eğitimi Merkezi
SAKARYA - TARAKLI - Taraklı Çok Programlı Anadolu Lisesi
SAKARYA - TARAKLI - Atatürk İlkokulu
SAKARYA - SÖĞÜTLÜ - Yeniköy İlkokulu
SAKARYA - SÖĞÜTLÜ - Türk Fransız Kardeşlik İlkokulu
SAKARYA - SÖĞÜTLÜ - Türk - Fransız Kardeşlik Ortaokulu
SAKARYA - SÖĞÜTLÜ - Söğütlü Öğretmenevi ve Akşam Sanat Okulu
SAKARYA - SÖĞÜTLÜ - Söğütlü İlkokulu
SAKARYA - SÖĞÜTLÜ - Söğütlü Halk Eğitimi Merkezi
SAKARYA - SÖĞÜTLÜ - Söğütlü Çok Programlı Anadolu Lisesi
SAKARYA - SÖĞÜTLÜ - Söğütlü Anadolu İmam Hatip Lisesi
SAKARYA - SÖĞÜTLÜ - Söğütlü 15 Temmuz Ortaokulu
SAKARYA - SÖĞÜTLÜ - Sakarya 3. OSB Anaokulu
SAKARYA - SÖĞÜTLÜ - Merkez İlkokulu
SAKARYA - SÖĞÜTLÜ - Halime Çavuş Anaokulu
SAKARYA - SÖĞÜTLÜ - Fındıklı Ortaokulu
SAKARYA - SÖĞÜTLÜ - Akçakamış İlkokulu
SAKARYA - SERDİVAN - Zübeyde Hanım Ortaokulu
SAKARYA - SERDİVAN - Yunus Emre İlkokulu
SAKARYA - SERDİVAN - Yukarıdere İlkokulu
SAKARYA - SERDİVAN - Yazlık İlkokulu
SAKARYA - SERDİVAN - Vilayetler Hizmet Birliği Şefkat Anaokulu
SAKARYA - SERDİVAN - Vilayetler Hizmet Birliği Anaokulu
SAKARYA - SERDİVAN - TOBB Kız Mesleki ve Teknik Anadolu Lisesi
SAKARYA - SERDİVAN - Şehit Yılmaz Ercan Kız Anadolu İmam Hatip Lisesi
SAKARYA - SERDİVAN - Şehit Üsteğmen Selçuk Esedoğlu Anadolu Lisesi
SAKARYA - SERDİVAN - Şehit Fethi Sekin İlkokulu
SAKARYA - SERDİVAN - Şehit Erol Olçok Anadolu Lisesi
SAKARYA - SERDİVAN - Şehit Ali Borinli Özel Eğitim Meslek Okulu
SAKARYA - SERDİVAN - Serdivan Şehit Mehmet Öztürk Kız Anadolu İmam Hatip Lisesi
SAKARYA - SERDİVAN - Serdivan Rehberlik ve Araştırma Merkezi
SAKARYA - SERDİVAN - Serdivan Özel Eğitim Anaokulu
SAKARYA - SERDİVAN - Serdivan Ortaokulu
SAKARYA - SERDİVAN - Serdivan Halk Eğitimi Merkezi
SAKARYA - SERDİVAN - Serdivan Farabi Ticaret Mesleki ve Teknik Anadolu Lisesi
SAKARYA - SERDİVAN - Serdivan Anadolu Lisesi
SAKARYA - SERDİVAN - Serdivan Anadolu İmam Hatip Lisesi
SAKARYA - SERDİVAN - Sakarya Anadolu Lisesi
SAKARYA - SERDİVAN - Nilüfer Özel Eğitim Uygulama Okulu III. Kademe
SAKARYA - SERDİVAN - Nilüfer Özel Eğitim Uygulama Okulu II. Kademe
SAKARYA - SERDİVAN - Neyyir Hanım Ortaokulu
SAKARYA - SERDİVAN - Neyyir Hanım İlkokulu
SAKARYA - SERDİVAN - Mina Özdoğancı Anaokulu
SAKARYA - SERDİVAN - Mevlana İmam Hatip Ortaokulu
SAKARYA - SERDİVAN - Mehmet Zumra Kuş Ortaokulu
SAKARYA - SERDİVAN - Mehmet Zorlu İlkokulu
SAKARYA - SERDİVAN - Mehmet Sadık Eratik Ortaokulu
SAKARYA - SERDİVAN - Mehmet Demir İlkokulu
SAKARYA - SERDİVAN - Kazımpaşa Ortaokulu
SAKARYA - SERDİVAN - Kazımpaşa İlkokulu
SAKARYA - SERDİVAN - Kanada Özel Eğitim Uygulama Okulu I. Kademe
SAKARYA - SERDİVAN - İstiklal Anaokulu
SAKARYA - SERDİVAN - Hakkı Demir Ortaokulu
SAKARYA - SERDİVAN - Hacı Emine Oba Ortaokulu
SAKARYA - SERDİVAN - Hacı Emine Oba İlkokulu
SAKARYA - SERDİVAN - Fevzi Çakmak İlkokulu
SAKARYA - SERDİVAN - Fatma Özkan Ortaokulu
SAKARYA - SERDİVAN - Fatma Özkan İlkokulu
SAKARYA - SERDİVAN - Çubuklu İlkokulu
SAKARYA - SERDİVAN - Çevre Dostu Anaokulu
SAKARYA - SERDİVAN - Bahçelievler Gazi İlkokulu
SAKARYA - SERDİVAN - Aydın Gürdamar Ortaokulu
SAKARYA - SERDİVAN - Aşağıdere Ortaokulu
SAKARYA - SERDİVAN - Aşağıdere İlkokulu
SAKARYA - SERDİVAN - 15 Temmuz Şehitler Fen Lisesi
SAKARYA - SAPANCA - Tepebaşı Aktar İlkokulu
SAKARYA - SAPANCA - Şehit Albay Güner Ekici Anadolu İmam Hatip Lisesi
SAKARYA - SAPANCA - Sinan Göksun Ortaokulu
SAKARYA - SAPANCA - Sinan Göksun İlkokulu
SAKARYA - SAPANCA - Sapanca Özel Eğitim Uygulama Okulu II. Kademe
SAKARYA - SAPANCA - Sapanca Özel Eğitim Uygulama Okulu I. Kademe
SAKARYA - SAPANCA - Sapanca Nene Hatun Anaokulu
SAKARYA - SAPANCA - Sapanca Mesleki ve Teknik Anadolu Lisesi
SAKARYA - SAPANCA - Sapanca Lokman Hekim Mesleki ve Teknik Anadolu Lisesi
SAKARYA - SAPANCA - Sapanca Kız Anadolu İmam Hatip Lisesi
SAKARYA - SAPANCA - Sapanca İlkokulu
SAKARYA - SAPANCA - Sapanca Halk Eğitimi Merkezi
SAKARYA - SAPANCA - Sapanca Anadolu Lisesi
SAKARYA - SAPANCA - Nebiye Ertan İlkokulu
SAKARYA - SAPANCA - Nazmiye-Ömer Sözer Ortaokulu
SAKARYA - SAPANCA - Nazmiye-Ömer Sözer İlkokulu
SAKARYA - SAPANCA - Muazzez Sabri Gündoğar Ortaokulu
SAKARYA - SAPANCA - Muazzez Sabri Gündoğar İlkokulu
SAKARYA - SAPANCA - Kemalettin Samipaşa Ortaokulu
SAKARYA - SAPANCA - Kemal Yener Ortaokulu
SAKARYA - SAPANCA - Kemal Yener İlkokulu
SAKARYA - SAPANCA - Gazipaşa İlkokulu
SAKARYA - SAPANCA - Elmas Dereli Anaokulu
SAKARYA - SAPANCA - Bilgin Özkaynak Ortaokulu
SAKARYA - SAPANCA - Bilgin Özkaynak İlkokulu
SAKARYA - SAPANCA - Alaçam Ortaokulu
SAKARYA - SAPANCA - Alaçam İlkokulu
SAKARYA - PAMUKOVA - Yenice Ortaokulu
SAKARYA - PAMUKOVA - Yenice İlkokulu
SAKARYA - PAMUKOVA - Turgutlu İlkokulu
SAKARYA - PAMUKOVA - Şeyhvarmaz İlkokulu
SAKARYA - PAMUKOVA - Şehit Peyami Altun Ortaokulu
SAKARYA - PAMUKOVA - Pınarlıbacı Ortaokulu
SAKARYA - PAMUKOVA - Pınarlıbacı İlkokulu
SAKARYA - PAMUKOVA - Pamukova Özel Eğitim Uygulama Okulu I. Kademe
SAKARYA - PAMUKOVA - Pamukova Öğretmenevi ve Akşam Sanat Okulu
SAKARYA - PAMUKOVA - Pamukova Mesleki ve Teknik Anadolu Lisesi
SAKARYA - PAMUKOVA - Pamukova İmam Hatip Ortaokulu
SAKARYA - PAMUKOVA - Pamukova Halk Eğitimi Merkezi
SAKARYA - PAMUKOVA - Pamukova Anadolu İmam Hatip Lisesi
SAKARYA - PAMUKOVA - Pamukova Akhisar Anadolu Lisesi
SAKARYA - PAMUKOVA - Mekece Ortaokulu
SAKARYA - PAMUKOVA - Mekece İlkokulu
SAKARYA - PAMUKOVA - Mehmet Atıf Aydın İmam Hatip Ortaokulu
SAKARYA - PAMUKOVA - Kemaliye Ortaokulu
SAKARYA - PAMUKOVA - Kemaliye İlkokulu
SAKARYA - PAMUKOVA - Görsev ve Ersev İnanç Kılıç İlkokulu
SAKARYA - PAMUKOVA - Gazi Ortaokulu
SAKARYA - PAMUKOVA - Fatmahanım Ortaokulu
SAKARYA - PAMUKOVA - Fatmahanım İlkokulu
SAKARYA - PAMUKOVA - Ertuğrul Gazi Ortaokulu
SAKARYA - PAMUKOVA - Ertaylan İlkokulu
SAKARYA - PAMUKOVA - Elbirlik İlkokulu
SAKARYA - PAMUKOVA - Cumhuriyet İlkokulu
SAKARYA - PAMUKOVA - Anakucağı Anaokulu
SAKARYA - PAMUKOVA - 75. Yıl İlkokulu
SAKARYA - KOCAALİ - Şerbetpınarı İlkokulu
SAKARYA - KOCAALİ - Sakarya Denizcilik Mesleki ve Teknik Anadolu Lisesi
SAKARYA - KOCAALİ - Osman Salihoğlu İlkokulu
SAKARYA - KOCAALİ - Nazım Üner Ortaokulu
SAKARYA - KOCAALİ - Nazım Üner İlkokulu
SAKARYA - KOCAALİ - Kocaali Şehit Şerife Bacı Anaokulu
SAKARYA - KOCAALİ - Kocaali İmam Hatip Ortaokulu
SAKARYA - KOCAALİ - Kocaali Halk Eğitimi Merkezi
SAKARYA - KOCAALİ - Kocaali Anadolu Lisesi
SAKARYA - KOCAALİ - Kocaali Anadolu İmam Hatip Lisesi
SAKARYA - KOCAALİ - Kirazlı Ortaokulu
SAKARYA - KOCAALİ - Kirazlı İlkokulu
SAKARYA - KOCAALİ - Karşımahalle Ortaokulu
SAKARYA - KOCAALİ - Hürriyet İlkokulu
SAKARYA - KOCAALİ - Gümüşoluk Ortaokulu
SAKARYA - KOCAALİ - Gümüşoluk İlkokulu
SAKARYA - KOCAALİ - Gazi Ortaokulu
SAKARYA - KOCAALİ - Beşevler Ortaokulu
SAKARYA - KOCAALİ - Beşevler İlkokulu
SAKARYA - KOCAALİ - Atatürk Ortaokulu
SAKARYA - KOCAALİ - Abidin Serhoş Mesleki ve Teknik Anadolu Lisesi
SAKARYA - KAYNARCA - Yeşilova Ortaokulu
SAKARYA - KAYNARCA - Yeşilova İlkokulu
SAKARYA - KAYNARCA - Topçu Dağağzı İlkokulu
SAKARYA - KAYNARCA - Şehit Sercan Gedikli Ortaokulu
SAKARYA - KAYNARCA - Şehit Sercan Gedikli İlkokulu
SAKARYA - KAYNARCA - Şehit Mansur Cansız Anadolu İmam Hatip Lisesi
SAKARYA - KAYNARCA - Orhangazi Ortaokulu
SAKARYA - KAYNARCA - Orhangazi İlkokulu
SAKARYA - KAYNARCA - Müşerref Sabri Köseoğlu Ortaokulu
SAKARYA - KAYNARCA - Müşerref Sabri Köseoğlu İlkokulu
SAKARYA - KAYNARCA - Mimar Sinan Ortaokulu
SAKARYA - KAYNARCA - Mimar Sinan İlkokulu
SAKARYA - KAYNARCA - Mehmet Akif Ersoy Ortaokulu
SAKARYA - KAYNARCA - Mehmet Akif Ersoy İlkokulu
SAKARYA - KAYNARCA - Kulaklı Ortaokulu
SAKARYA - KAYNARCA - Kulaklı İlkokulu
SAKARYA - KAYNARCA - Kaynarca Şehit Ömer Akkuş Anadolu Lisesi
SAKARYA - KAYNARCA - Kaynarca Seyfettin Selim Mesleki ve Teknik Anadolu Lisesi
SAKARYA - KAYNARCA - Kaynarca Halk Eğitimi Merkezi
SAKARYA - KAYNARCA - Kaynarca Anaokulu
SAKARYA - KAYNARCA - Hacı Osman Akgün Ortaokulu
SAKARYA - KAYNARCA - Hacı Osman Akgün İlkokulu
SAKARYA - KAYNARCA - Fatih Ortaokulu
SAKARYA - KAYNARCA - Fatih İlkokulu
SAKARYA - KAYNARCA - Esenbel Ortaokulu
SAKARYA - KAYNARCA - Esenbel İlkokulu
SAKARYA - KAYNARCA - Atatürk Ortaokulu
SAKARYA - KAYNARCA - Atatürk İlkokulu
SAKARYA - KARASU - Yuvalıdere İlkokulu
SAKARYA - KARASU - Yassıgeçit Ortaokulu
SAKARYA - KARASU - Yassıgeçit İlkokulu
SAKARYA - KARASU - Yalı İlkokulu
SAKARYA - KARASU - TOKİ Demokrasi Ortaokulu
SAKARYA - KARASU - TOKİ Demokrasi İlkokulu
SAKARYA - KARASU - Tepetarla İlkokulu
SAKARYA - KARASU - Şehit Üsteğmen İbrahim Abanoz Anadolu Lisesi
SAKARYA - KARASU - Şehit Teğmen Ömer Faruk Civelek Anaokulu
SAKARYA - KARASU - Şehit Serkan Sağır Ortaokulu
SAKARYA - KARASU - Şehit Serkan Sağır İlkokulu
SAKARYA - KARASU - Şehit Oktay Demirci Ortaokulu
SAKARYA - KARASU - Şehit Oktay Demirci İlkokulu
SAKARYA - KARASU - Şehit İsmail Hakkı Yılmaz Ortaokulu
SAKARYA - KARASU - Şehit İsmail Hakkı Yılmaz İlkokulu
SAKARYA - KARASU - Şehit Hasan Keleş Mesleki ve Teknik Anadolu Lisesi
SAKARYA - KARASU - Şehit Ferhat Sözer Ortaokulu
SAKARYA - KARASU - Şehit Ferhat Sözer İlkokulu
SAKARYA - KARASU - Şehit Ahmet Baş Anadolu İmam Hatip Lisesi
SAKARYA - KARASU - Sezi Eratik Ortaokulu
SAKARYA - KARASU - Sahil Anaokulu
SAKARYA - KARASU - Namık Kemal İmam Hatip Ortaokulu
SAKARYA - KARASU - Mehmet Akif Ersoy Ortaokulu
SAKARYA - KARASU - Mehmet Akif Ersoy İlkokulu
SAKARYA - KARASU - Manavpınarı Ortaokulu
SAKARYA - KARASU - Manavpınarı İlkokulu
SAKARYA - KARASU - Limandere İlkokulu
SAKARYA - KARASU - Kurudere Ortaokulu
SAKARYA - KARASU - Kurudere İlkokulu
SAKARYA - KARASU - Kızılcık Ortaokulu
SAKARYA - KARASU - Kızılcık İlkokulu
SAKARYA - KARASU - KARASU ZÜBEYDE HANIM ANAOKULU
SAKARYA - KARASU - Karasu Yeni Mahalle Özel Eğitim Uygulama Okulu II. Kademe
SAKARYA - KARASU - Karasu Rehberlik ve Araştırma Merkezi
SAKARYA - KARASU - Karasu Özel Eğitim Uygulama Okulu I. Kademe
SAKARYA - KARASU - Karasu Öğretmenevi ve Akşam Sanat Okulu
SAKARYA - KARASU - Karasu Mesleki ve Teknik Anadolu Lisesi
SAKARYA - KARASU - Karasu Mesleki Eğitim Merkezi
SAKARYA - KARASU - Karasu İmam Hatip Ortaokulu
SAKARYA - KARASU - Karasu İlkokulu
SAKARYA - KARASU - Karasu Halk Eğitimi Merkezi
SAKARYA - KARASU - Karasu Atatürk Anadolu Lisesi
SAKARYA - KARASU - Karasu Anaokulu
SAKARYA - KARASU - Karasu Anadolu Lisesi
SAKARYA - KARASU - Karapınar Ortaokulu
SAKARYA - KARASU - Karapınar İlkokulu
SAKARYA - KARASU - Karadeniz Kız Mesleki ve Teknik Anadolu Lisesi
SAKARYA - KARASU - İnönü İlkokulu
SAKARYA - KARASU - Gazi Ortaokulu
SAKARYA - KARASU - Gazi İlkokulu
SAKARYA - KARASU - Fatih Sultan Mehmet Ortaokulu
SAKARYA - KARASU - Fatih Sultan Mehmet İlkokulu
SAKARYA - KARASU - Denizköy Ortaokulu
SAKARYA - KARASU - Denizköy İlkokulu
SAKARYA - KARASU - Cumhuriyet Ortaokulu
SAKARYA - KARASU - Aziziye İlkokulu
SAKARYA - KARASU - Adatepe Ortaokulu
SAKARYA - KARASU - Adatepe İlkokulu
SAKARYA - KARAPÜRÇEK - Yüksel Ortaokulu
SAKARYA - KARAPÜRÇEK - Yüksel İlkokulu
SAKARYA - KARAPÜRÇEK - Teketaban Ortaokulu
SAKARYA - KARAPÜRÇEK - Teketaban İlkokulu
SAKARYA - KARAPÜRÇEK - Şehit Mustafa Geyve Ortaokulu
SAKARYA - KARAPÜRÇEK - Şehit Mustafa Geyve İlkokulu
SAKARYA - KARAPÜRÇEK - Şehit Mehmet Selim Kiraz İmam Hatip Ortaokulu
SAKARYA - KARAPÜRÇEK - Şehit Hüseyin Zorlu Ortaokulu
SAKARYA - KARAPÜRÇEK - Şehit Hüseyin Zorlu İlkokulu
SAKARYA - KARAPÜRÇEK - Şehit Abdullah Tayyip Olçok İmam Hatip Ortaokulu
SAKARYA - KARAPÜRÇEK - Necip Fazıl Kısakürek Anaokulu
SAKARYA - KARAPÜRÇEK - Mehmet Akif Ersoy Çok Programlı Anadolu Lisesi
SAKARYA - KARAPÜRÇEK - Mecidiye İlkokulu
SAKARYA - KARAPÜRÇEK - Karapürçek Halk Eğitimi Merkezi
SAKARYA - KARAPÜRÇEK - Atatürk Ortaokulu
SAKARYA - KARAPÜRÇEK - Atatürk İlkokulu
SAKARYA - HENDEK - Ziya Gökalp Ortaokulu
SAKARYA - HENDEK - Ziya Gökalp İlkokulu
SAKARYA - HENDEK - Yeşilyurt Ortaokulu
SAKARYA - HENDEK - Yeşilyurt İmam Hatip Ortaokulu
SAKARYA - HENDEK - Yeşilyurt İlkokulu
SAKARYA - HENDEK - Yeşilvadi Ortaokulu
SAKARYA - HENDEK - Yeşilvadi İlkokulu
SAKARYA - HENDEK - Yeşiller İlkokulu
SAKARYA - HENDEK - Yeniyüzyıl İlkokulu
SAKARYA - HENDEK - Yenimahalle Kız Mesleki ve Teknik Anadolu Lisesi
SAKARYA - HENDEK - Yenimahalle Anaokulu
SAKARYA - HENDEK - Uzuncaorman Murat Nişancı Ortaokulu
SAKARYA - HENDEK - Uzuncaorman Murat Nişancı İlkokulu
SAKARYA - HENDEK - Tuzak İlkokulu
SAKARYA - HENDEK - Şehit Mahmutbey Ortaokulu
SAKARYA - HENDEK - Şehit Ali Gaffar Okkan Ortaokulu
SAKARYA - HENDEK - Şehit Ahmet Özsoy İmam Hatip Ortaokulu
SAKARYA - HENDEK - Soğuksu Ortaokulu
SAKARYA - HENDEK - Soğuksu İlkokulu
SAKARYA - HENDEK - Prof.Dr.İsmail Cerrahoğlu İmam Hatip Ortaokulu
SAKARYA - HENDEK - Prof. Dr. İsmail Cerrahoğlu İlkokulu
SAKARYA - HENDEK - Nuriye İlkokulu
SAKARYA - HENDEK - Noksel İlkokulu
SAKARYA - HENDEK - Nene Hatun İmam Hatip Ortaokulu
SAKARYA - HENDEK - Mustafa Asım İlkokulu
SAKARYA - HENDEK - Kurtuluş Ortaokulu
SAKARYA - HENDEK - Kurtuluş İlkokulu
SAKARYA - HENDEK - Kocatöngel Anadolu Kalkınma Vakfı İmam Hatip Ortaokulu
SAKARYA - HENDEK - Kocatöngel Anadolu Kalkınma Vakfı İlkokulu
SAKARYA - HENDEK - Kazımiye Cumhuriyet Ortaokulu
SAKARYA - HENDEK - Kazımiye Cumhuriyet İlkokulu
SAKARYA - HENDEK - Karadere İlkokulu
SAKARYA - HENDEK - Hendek Rehberlik ve Araştırma Merkezi
SAKARYA - HENDEK - Hendek Özel Eğitim Uygulama Okulu III. Kademe
SAKARYA - HENDEK - Hendek Özel Eğitim Uygulama Okulu II. Kademe
SAKARYA - HENDEK - Hendek Özel Eğitim Anaokulu
SAKARYA - HENDEK - Hendek Öğretmenevi ve Akşam Sanat Okulu
SAKARYA - HENDEK - Hendek Orhangazi Anadolu Lisesi
SAKARYA - HENDEK - Hendek Nilüfer Hatun Anaokulu
SAKARYA - HENDEK - Hendek Mesleki ve Teknik Anadolu Lisesi
SAKARYA - HENDEK - Hendek Mesleki Eğitim Merkezi
SAKARYA - HENDEK - Hendek Kız Anadolu İmam Hatip Lisesi
SAKARYA - HENDEK - Hendek İmam Hatip Ortaokulu
SAKARYA - HENDEK - Hendek Halk Eğitimi Merkezi
SAKARYA - HENDEK - Hendek Fatih Özel Eğitim Uygulama Okulu I. Kademe
SAKARYA - HENDEK - Hendek Anaokulu
SAKARYA - HENDEK - Hendek Anadolu Lisesi
SAKARYA - HENDEK - Hendek Anadolu Kalkınma Vakfı Mesleki ve Teknik Anadolu Lisesi
SAKARYA - HENDEK - Hendek Anadolu İmam Hatip Lisesi
SAKARYA - HENDEK - Hendek Akşemsettin Mesleki ve Teknik Anadolu Lisesi
SAKARYA - HENDEK - Hamitli İlkokulu
SAKARYA - HENDEK - Fatih Ortaokulu
SAKARYA - HENDEK - Fatih İlkokulu
SAKARYA - HENDEK - Dikmen Ortaokulu
SAKARYA - HENDEK - Dikmen İlkokulu
SAKARYA - HENDEK - Devlet Bahçeli Fen Lisesi
SAKARYA - HENDEK - Dereköy Ortaokulu
SAKARYA - HENDEK - Dereköy İlkokulu
SAKARYA - HENDEK - Çamlıca Ortaokulu
SAKARYA - HENDEK - Çamlıca İlkokulu
SAKARYA - HENDEK - Çağlayan İlkokulu
SAKARYA - HENDEK - Cumhuriyet İlkokulu
SAKARYA - HENDEK - Beylice Ortaokulu
SAKARYA - HENDEK - Beylice İlkokulu
SAKARYA - HENDEK - Atikehanım Ortaokulu
SAKARYA - HENDEK - Atike Hanım Anadolu Lisesi
SAKARYA - HENDEK - Aşağı Çalıca Ortaokulu
SAKARYA - HENDEK - Aşağı Çalıca İlkokulu
SAKARYA - HENDEK - Akova İlkokulu
SAKARYA - HENDEK - Abdurrahman Gürses İmam Hatip Ortaokulu
SAKARYA - HENDEK - 100. Yıl Anaokulu
SAKARYA - GEYVE - Umurbey İlkokulu
SAKARYA - GEYVE - Şehit Recep Demir Ortaokulu
SAKARYA - GEYVE - Şehit Recep Demir İlkokulu
SAKARYA - GEYVE - Süleyman Gülsüm Odabaş Ortaokulu
SAKARYA - GEYVE - Süleyman Gülsüm Odabaş İlkokulu
SAKARYA - GEYVE - Safibey İlkokulu
SAKARYA - GEYVE - Osmangazi Ortaokulu
SAKARYA - GEYVE - Necip Fazıl Kısakürek İlkokulu
SAKARYA - GEYVE - Mehmet Ayşe Akgül Ortaokulu
SAKARYA - GEYVE - Mehmet Ayşe Akgül İlkokulu
SAKARYA - GEYVE - Kızılkaya İlkokulu
SAKARYA - GEYVE - Kazımpaşa İlkokulu
SAKARYA - GEYVE - Hasan Melih Can İlkokulu
SAKARYA - GEYVE - Geyve Şehit Serdar Gökbayrak Kız Anadolu İmam Hatip Lisesi
SAKARYA - GEYVE - Geyve Şehit Atanur Bulut Ortaokulu
SAKARYA - GEYVE - Geyve Sinan Bey Mesleki ve Teknik Anadolu Lisesi
SAKARYA - GEYVE - Geyve Özel Eğitim Uygulama Okulu II. Kademe
SAKARYA - GEYVE - Geyve Özel Eğitim Uygulama Okulu I. Kademe
SAKARYA - GEYVE - Geyve Özel Eğitim Anaokulu
SAKARYA - GEYVE - Geyve Öğretmenevi ve Akşam Sanat Okulu
SAKARYA - GEYVE - Geyve Mesleki ve Teknik Anadolu Lisesi
SAKARYA - GEYVE - Geyve İlkokulu
SAKARYA - GEYVE - Geyve Halk Eğitimi Merkezi
SAKARYA - GEYVE - Geyve Elvan Bey Anadolu Lisesi
SAKARYA - GEYVE - Geyve Anaokulu
SAKARYA - GEYVE - Geyve Anadolu Lisesi
SAKARYA - GEYVE - Geyve Anadolu İmam Hatip Lisesi
SAKARYA - GEYVE - Gazipaşa Ortaokulu
SAKARYA - GEYVE - Eşme Ortaokulu
SAKARYA - GEYVE - Eşme İlkokulu
SAKARYA - GEYVE - Doğantepe Şehit Erkan Eren Ortaokulu
SAKARYA - GEYVE - Doğantepe İlkokulu
SAKARYA - GEYVE - Cumhuriyet Ortaokulu
SAKARYA - GEYVE - Cumhuriyet İlkokulu
SAKARYA - GEYVE - Bayat İlkokulu
SAKARYA - GEYVE - Ayva Çiçeği Anaokulu
SAKARYA - GEYVE - Atatürk Ortaokulu
SAKARYA - GEYVE - Atatürk İlkokulu
SAKARYA - GEYVE - Alifuatpaşa Ortaokulu
SAKARYA - GEYVE - Alifuatpaşa Anaokulu
SAKARYA - GEYVE - Ali Fuat Paşa İlkokulu
SAKARYA - GEYVE - Akdoğan Ortaokulu
SAKARYA - GEYVE - Akdoğan İlkokulu
SAKARYA - GEYVE - Ahmet Yesevi İlkokulu
SAKARYA - FERİZLİ - Tekstil İşverenler Sendikası Halit Narin Ortaokulu
SAKARYA - FERİZLİ - Tekstil İşverenler Sendikası Halit Narin İlkokulu
SAKARYA - FERİZLİ - Şehit Hakan Bayram Anadolu İmam Hatip Lisesi
SAKARYA - FERİZLİ - Şehit Hacı Uzun İlkokulu
SAKARYA - FERİZLİ - Rüveyde Güneş Ortaokulu
SAKARYA - FERİZLİ - Rüveyde Güneş İlkokulu
SAKARYA - FERİZLİ - Konuklu Ortaokulu
SAKARYA - FERİZLİ - Konuklu İlkokulu
SAKARYA - FERİZLİ - Hatice Aslan Ortaokulu
SAKARYA - FERİZLİ - Hatice Aslan İlkokulu
SAKARYA - FERİZLİ - Gölkent Ortaokulu
SAKARYA - FERİZLİ - Gölkent İlkokulu
SAKARYA - FERİZLİ - Ferizli Özel Eğitim Uygulama Okulu I. Kademe
SAKARYA - FERİZLİ - Ferizli Ortaokulu
SAKARYA - FERİZLİ - Ferizli Kız Mesleki ve Teknik Anadolu Lisesi
SAKARYA - FERİZLİ - Ferizli İhsan Eratik Anaokulu
SAKARYA - FERİZLİ - Ferizli Halk Eğitimi Merkezi
SAKARYA - FERİZLİ - Ferizli Fikret-İsmet Aktekin Anadolu Lisesi
SAKARYA - FERİZLİ - Borsa İstanbul Recepbey Mesleki ve Teknik Anadolu Lisesi
SAKARYA - FERİZLİ - Bakırlı Ortaokulu
SAKARYA - FERİZLİ - Bakırlı İlkokulu
SAKARYA - ERENLER - Zinnet Dilmen Anaokulu
SAKARYA - ERENLER - Yücel Ballık Ortaokulu
SAKARYA - ERENLER - Yunus Çiloğlu Ortaokulu
SAKARYA - ERENLER - Yeşiltepe İlkokulu
SAKARYA - ERENLER - Yeşiltepe Anaokulu
SAKARYA - ERENLER - Vali Mustafa Cahit Kıraç Anadolu Lisesi
SAKARYA - ERENLER - TEV Esat Egesoy Bedia Başgöz Ortaokulu
SAKARYA - ERENLER - TEV Esat Egesoy Bedia Başgöz İlkokulu
SAKARYA - ERENLER - Şen Piliç Mesleki ve Teknik Anadolu Lisesi
SAKARYA - ERENLER - Şehit Mehmet Solak Ortaokulu
SAKARYA - ERENLER - Şehit Mehmet Solak İlkokulu
SAKARYA - ERENLER - Şehit Gülşah Güler Anaokulu
SAKARYA - ERENLER - Şehit Bülent Yurtseven İmam Hatip Ortaokulu
SAKARYA - ERENLER - Süleyman Şah Ortaokulu
SAKARYA - ERENLER - Süleyman Şah İlkokulu
SAKARYA - ERENLER - Sarıcalar İlkokulu
SAKARYA - ERENLER - Sakarya Mesleki Eğitim Merkezi
SAKARYA - ERENLER - Sakarya Bilim ve Sanat Merkezi
SAKARYA - ERENLER - Nurettin Tepe İlkokulu
SAKARYA - ERENLER - Mehmet Gölhan Ortaokulu
SAKARYA - ERENLER - Mehmet Gölhan İlkokulu
SAKARYA - ERENLER - Küpçüler Ortaokulu
SAKARYA - ERENLER - Küpçüler İlkokulu
SAKARYA - ERENLER - Kut-ul Amare Zaferi İlkokulu
SAKARYA - ERENLER - Kayalar Reşitbey İlkokulu
SAKARYA - ERENLER - Halit Evin Kız Anadolu İmam Hatip Lisesi
SAKARYA - ERENLER - Halit Evin Anadolu İmam Hatip Lisesi
SAKARYA - ERENLER - Hacı Mehmet Akkoç Ortaokulu
SAKARYA - ERENLER - Figen Sakallıoğlu Anadolu Lisesi
SAKARYA - ERENLER - Fevzi Kılıç Ortaokulu
SAKARYA - ERENLER - Erenler Rehberlik ve Araştırma Merkezi
SAKARYA - ERENLER - Erenler Özel Eğitim Anaokulu
SAKARYA - ERENLER - Erenler Ortaokulu
SAKARYA - ERENLER - Erenler İlkokulu
SAKARYA - ERENLER - Erenler Halk Eğitimi Merkezi
SAKARYA - ERENLER - Erenler Anaokulu
SAKARYA - ERENLER - Ekinli Ortaokulu
SAKARYA - ERENLER - Ekinli İlkokulu
SAKARYA - ERENLER - Çaybaşı Yeşiltepe İlkokulu
SAKARYA - ERENLER - Çaybaşı Yeniköy İmam Hatip Ortaokulu
SAKARYA - ERENLER - Çaybaşı Yeniköy İlkokulu
SAKARYA - ERENLER - Büyükesence Ortaokulu
SAKARYA - ERENLER - Büyükesence İlkokulu
SAKARYA - ERENLER - Ali Dilmen İlkokulu
SAKARYA - ERENLER - Ali Dilmen Anadolu Lisesi
SAKARYA - ERENLER - Akşemsettin Ortaokulu
SAKARYA - ERENLER - Akşemsettin İlkokulu
SAKARYA - ERENLER - Abdullah Esma Kocabıyık Ortaokulu
SAKARYA - ERENLER - Abdullah Esma Kocabıyık İlkokulu
SAKARYA - BÜYÜKŞEHİR - Büyükşehir Öğretmenevi ve Akşam Sanat Okulu
SAKARYA - ARİFİYE - Üzeyir Garih Ortaokulu
SAKARYA - ARİFİYE - Ümit Erdal Mesleki ve Teknik Anadolu Lisesi
SAKARYA - ARİFİYE - Şehit Muhammet Fatih Safitürk Anadolu Lisesi
SAKARYA - ARİFİYE - Sakarya Ticaret ve Sanayi Odası Motorlu Araçlar Teknolojisi Mesleki ve Teknik Anadolu Lisesi
SAKARYA - ARİFİYE - Prof.Dr.Osman Öztürk İmam Hatip Ortaokulu
SAKARYA - ARİFİYE - Prof. Dr. Osman Öztürk Anadolu İmam Hatip Lisesi
SAKARYA - ARİFİYE - Neviye Özel Eğitim Uygulama Okulu III. Kademe
SAKARYA - ARİFİYE - Neviye Özel Eğitim Uygulama Okulu II. Kademe
SAKARYA - ARİFİYE - Neviye İlkokulu
SAKARYA - ARİFİYE - Necmettin Erbakan Fen Lisesi
SAKARYA - ARİFİYE - Milli Egemenlik Ortaokulu
SAKARYA - ARİFİYE - Milli Egemenlik İlkokulu
SAKARYA - ARİFİYE - Kemaliye Ortaokulu
SAKARYA - ARİFİYE - Kemaliye İlkokulu
SAKARYA - ARİFİYE - Kazım Karabekir Ortaokulu
SAKARYA - ARİFİYE - Kazım Karabekir İlkokulu
SAKARYA - ARİFİYE - Kazım Karabekir Anaokulu
SAKARYA - ARİFİYE - Hanlı Ortaokulu
SAKARYA - ARİFİYE - Hanlı İlkokulu
SAKARYA - ARİFİYE - Hacıköy Ortaokulu
SAKARYA - ARİFİYE - Hacıköy İlkokulu
SAKARYA - ARİFİYE - Fatih Anaokulu
SAKARYA - ARİFİYE - Ekrem Oba Ortaokulu
SAKARYA - ARİFİYE - Ekrem Oba İlkokulu
SAKARYA - ARİFİYE - Ege Kimya Ortaokulu
SAKARYA - ARİFİYE - Cumhuriyet Ortaokulu
SAKARYA - ARİFİYE - Cumhuriyet İlkokulu
SAKARYA - ARİFİYE - Cumhuriyet Anaokulu
SAKARYA - ARİFİYE - Aşağı Kirazca İlkokulu
SAKARYA - ARİFİYE - Arifiye Özel Eğitim Uygulama Okulu I. Kademe
SAKARYA - ARİFİYE - Arifiye Özel Eğitim Anaokulu
SAKARYA - ARİFİYE - Arifiye Ortaokulu
SAKARYA - ARİFİYE - Arifiye Mesleki ve Teknik Anadolu Lisesi
SAKARYA - ARİFİYE - Arifiye Mesleki Eğitim Merkezi
SAKARYA - ARİFİYE - Arifiye Kız Anadolu İmam Hatip Lisesi
SAKARYA - ARİFİYE - Arifiye İlkokulu
SAKARYA - ARİFİYE - Arifiye Halk Eğitimi Merkezi
SAKARYA - ARİFİYE - Arifiye Anaokulu
SAKARYA - ARİFİYE - Arifbey Bekir Sıtkı Durgun İlkokulu
SAKARYA - ARİFİYE - Açmalar Ortaokulu
SAKARYA - ARİFİYE - Açmalar İlkokulu
SAKARYA - AKYAZI - Yörükyeri İlkokulu
SAKARYA - AKYAZI - Yağcılar İlkokulu
SAKARYA - AKYAZI - Vakıf Ortaokulu
SAKARYA - AKYAZI - Vakıf İlkokulu
SAKARYA - AKYAZI - Topçusırtı Anadolu Kalkınma Vakfı Ortaokulu
SAKARYA - AKYAZI - Topçusırtı Anadolu Kalkınma Vakfı İlkokulu
SAKARYA - AKYAZI - Topağaç İmam Hatip Ortaokulu
SAKARYA - AKYAZI - Topağaç İlkokulu
SAKARYA - AKYAZI - TOBB Hüsamettin Bayraktar Ortaokulu
SAKARYA - AKYAZI - Taşyatak İlkokulu
SAKARYA - AKYAZI - Taşburun Mehdi Kalkan İmam Hatip Ortaokulu
SAKARYA - AKYAZI - Taşburun İlkokulu
SAKARYA - AKYAZI - Taşağıl Ortaokulu
SAKARYA - AKYAZI - Taşağıl İlkokulu
SAKARYA - AKYAZI - Şerefiye İlkokulu
SAKARYA - AKYAZI - Şehit Yüzbaşı Halil İbrahim Sert Anadolu Lisesi
SAKARYA - AKYAZI - Şehit İhsan Ünlütürk Ortaokulu
SAKARYA - AKYAZI - Şehit İhsan Ünlütürk İlkokulu
SAKARYA - AKYAZI - Şehit Halil Üleç İlkokulu
SAKARYA - AKYAZI - Şehit Ahmet Çondul Ortaokulu
SAKARYA - AKYAZI - Şehit Ahmet Çondul İlkokulu
SAKARYA - AKYAZI - Reşadiye Ortaokulu
SAKARYA - AKYAZI - Reşadiye İlkokulu
SAKARYA - AKYAZI - Pazarköy Ortaokulu
SAKARYA - AKYAZI - Pazarköy İmam Hatip Ortaokulu
SAKARYA - AKYAZI - Pazarköy İlkokulu
SAKARYA - AKYAZI - Paris Ortaokulu
SAKARYA - AKYAZI - Paris İlkokulu
SAKARYA - AKYAZI - Nevruz Banoğlu İlkokulu
SAKARYA - AKYAZI - Nahit Menteşe Ortaokulu
SAKARYA - AKYAZI - Nahit Menteşe İlkokulu
SAKARYA - AKYAZI - Mehmet Soykan İlkokulu
SAKARYA - AKYAZI - Mehmet Kaya Ortaokulu
SAKARYA - AKYAZI - Mehmet Kaya İlkokulu
SAKARYA - AKYAZI - Mehmet Akif Ersoy İlkokulu
SAKARYA - AKYAZI - Madenler İlkokulu
SAKARYA - AKYAZI - Madanoğlu İlkokulu
SAKARYA - AKYAZI - Küçücek Ortaokulu
SAKARYA - AKYAZI - Küçücek İlkokulu
SAKARYA - AKYAZI - Küçücek Cumhuriyet Ortaokulu
SAKARYA - AKYAZI - Küçücek Cumhuriyet İlkokulu
SAKARYA - AKYAZI - Kuzuluk İlkokulu
SAKARYA - AKYAZI - Kuzuluk Dr. Enver Ören Ortaokulu
SAKARYA - AKYAZI - Kuzuluk Akşemsettin İmam Hatip Ortaokulu
SAKARYA - AKYAZI - Kumköprü İlkokulu
SAKARYA - AKYAZI - Kızılcıkorman İlkokulu
SAKARYA - AKYAZI - Karaçalılık İlkokulu
SAKARYA - AKYAZI - Kabakulak Anadolu Kalkınma Vakfı Ortaokulu
SAKARYA - AKYAZI - Kabakulak Anadolu Kalkınma Vakfı İlkokulu
SAKARYA - AKYAZI - J ve J Konuralp İlkokulu
SAKARYA - AKYAZI - İSMONT Halil Bildirici Mesleki ve Teknik Anadolu Lisesi
SAKARYA - AKYAZI - İnönü Ortaokulu
SAKARYA - AKYAZI - İnönü İlkokulu
SAKARYA - AKYAZI - İnönü Anaokulu
SAKARYA - AKYAZI - Fatih İlkokulu
SAKARYA - AKYAZI - Erdoğdu Ortaokulu
SAKARYA - AKYAZI - Erdoğdu İlkokulu
SAKARYA - AKYAZI - Düzyazı İlkokulu
SAKARYA - AKYAZI - Dokurcun Ortaokulu
SAKARYA - AKYAZI - Dokurcun İmam Hatip Ortaokulu
SAKARYA - AKYAZI - Dokurcun İlkokulu
SAKARYA - AKYAZI - Dokurcun Çok Programlı Anadolu Lisesi
SAKARYA - AKYAZI - Dedeler İlkokulu
SAKARYA - AKYAZI - Cumhuriyet Ortaokulu
SAKARYA - AKYAZI - Cumhuriyet Anaokulu
SAKARYA - AKYAZI - Atatürk Ortaokulu
SAKARYA - AKYAZI - Atatürk İlkokulu
SAKARYA - AKYAZI - Ali Altıparmak Ortaokulu
SAKARYA - AKYAZI - Ali Altıparmak İmam Hatip Ortaokulu
SAKARYA - AKYAZI - Alaağaç Ortaokulu
SAKARYA - AKYAZI - Alaağaç İlkokulu
SAKARYA - AKYAZI - Akyazı Rehberlik ve Araştırma Merkezi
SAKARYA - AKYAZI - Akyazı Özel Eğitim Uygulama Okulu II. Kademe
SAKARYA - AKYAZI - Akyazı Özel Eğitim Uygulama Okulu I. Kademe
SAKARYA - AKYAZI - Akyazı Özel Eğitim Meslek Okulu
SAKARYA - AKYAZI - Akyazı Özel Eğitim Anaokulu
SAKARYA - AKYAZI - Akyazı Öğretmenevi ve Akşam Sanat Okulu
SAKARYA - AKYAZI - Akyazı Nilüfer Hatun Kız Mesleki ve Teknik Anadolu Lisesi
SAKARYA - AKYAZI - Akyazı Mesleki ve Teknik Anadolu Lisesi
SAKARYA - AKYAZI - Akyazı Mesleki Eğitim Merkezi
SAKARYA - AKYAZI - Akyazı Konuralp Anadolu Lisesi
SAKARYA - AKYAZI - Akyazı Kız Anadolu İmam Hatip Lisesi
SAKARYA - AKYAZI - Akyazı İmam Hatip Ortaokulu
SAKARYA - AKYAZI - Akyazı Eyyup Genç Fen Lisesi
SAKARYA - AKYAZI - Akyazı Anadolu Lisesi
SAKARYA - AKYAZI - Akyazı Anadolu Kalkınma Vakfı Halk Eğitimi Merkezi
SAKARYA - AKYAZI - Akyazı Anadolu İmam Hatip Lisesi
SAKARYA - AKYAZI - Ahmet Hasnun Tunçsoy İlkokulu
SAKARYA - AKYAZI - Ahi Evran Ticaret Mesleki ve Teknik Anadolu Lisesi
SAKARYA - ADAPAZARI - Yunus Emre Anadolu Lisesi
SAKARYA - ADAPAZARI - Yenikent Özel Eğitim Anaokulu
SAKARYA - ADAPAZARI - Yenikent Kız Anadolu İmam Hatip Lisesi
SAKARYA - ADAPAZARI - Yenikent Anadolu İmam Hatip Lisesi
SAKARYA - ADAPAZARI - Yenigün Ortaokulu
SAKARYA - ADAPAZARI - Yavuz Selim Ortaokulu
SAKARYA - ADAPAZARI - Yavuz Selim İlkokulu
SAKARYA - ADAPAZARI - Vali Mustafa Uygur Ortaokulu
SAKARYA - ADAPAZARI - Vali Mustafa Uygur İlkokulu
SAKARYA - ADAPAZARI - Vali Mustafa Büyük Kız Anadolu İmam Hatip Lisesi
SAKARYA - ADAPAZARI - Vakıfkent TOKİ İmam Hatip Ortaokulu
SAKARYA - ADAPAZARI - Vakıfkent Toki İlkokulu
SAKARYA - ADAPAZARI - Türk-İş İlkokulu
SAKARYA - ADAPAZARI - Toki İlkokulu
SAKARYA - ADAPAZARI - Tevfik İleri Anadolu İmam Hatip Lisesi
SAKARYA - ADAPAZARI - Tes-İş Adapazarı Anadolu Lisesi
SAKARYA - ADAPAZARI - Tepekum Anaokulu
SAKARYA - ADAPAZARI - Tepekum Anadolu Lisesi
SAKARYA - ADAPAZARI - Taşkısığı Ortaokulu
SAKARYA - ADAPAZARI - Talat Tömekçe İlkokulu
SAKARYA - ADAPAZARI - Şirinevler Ortaokulu
SAKARYA - ADAPAZARI - Şeker Anaokulu
SAKARYA - ADAPAZARI - Şehit Mustafa Özen İlkokulu
SAKARYA - ADAPAZARI - Şehit Lokman Eker Ortaokulu
SAKARYA - ADAPAZARI - Şehit Fatih Kemal Yarar Ortaokulu
SAKARYA - ADAPAZARI - Şehit Fatih Kemal Yarar İmam Hatip Ortaokulu
SAKARYA - ADAPAZARI - Şehit Ahmet Akyol İlkokulu
SAKARYA - ADAPAZARI - Şehit Adil Arslan Özel Eğitim Uygulama Okulu III. Kademe
SAKARYA - ADAPAZARI - Şehit Abdullah Ömür İlkokulu
SAKARYA - ADAPAZARI - Şarık Tara İlkokulu
SAKARYA - ADAPAZARI - Sezginler Turizm Mesleki ve Teknik Anadolu Lisesi
SAKARYA - ADAPAZARI - Selçukbey İlkokulu
SAKARYA - ADAPAZARI - Sakarya Ticaret ve Sanayi Odası Ticaret Mesleki ve Teknik Anadolu Lisesi
SAKARYA - ADAPAZARI - Sakarya Ticaret Borsası Özel Eğitim Uygulama Okulu II. Kademe
SAKARYA - ADAPAZARI - Sakarya Ticaret Borsası Özel Eğitim Uygulama Okulu I. Kademe
SAKARYA - ADAPAZARI - Sakarya Spor Lisesi
SAKARYA - ADAPAZARI - Sakarya İlkokulu
SAKARYA - ADAPAZARI - Sakarya Güzel Sanatlar Lisesi
SAKARYA - ADAPAZARI - Sakarya Cevat Ayhan Fen Lisesi
SAKARYA - ADAPAZARI - Sakarya Cemil Meriç Sosyal Bilimler Lisesi
SAKARYA - ADAPAZARI - Sait Faik Abasıyanık Ortaokulu
SAKARYA - ADAPAZARI - Sabihahanım Ortaokulu
SAKARYA - ADAPAZARI - Ozanlar Ortaokulu
SAKARYA - ADAPAZARI - Ozanlar Anaokulu
SAKARYA - ADAPAZARI - Ozanlar Anadolu Lisesi
SAKARYA - ADAPAZARI - Osmanbey İlkokulu
SAKARYA - ADAPAZARI - Orhangazi İlkokulu
SAKARYA - ADAPAZARI - Nuri Bayar Ortaokulu
SAKARYA - ADAPAZARI - Nuri Bayar İmam Hatip Ortaokulu
SAKARYA - ADAPAZARI - Nehir Anaokulu
SAKARYA - ADAPAZARI - Necdet Islar İlkokulu
SAKARYA - ADAPAZARI - Namık Kemal Ortaokulu
SAKARYA - ADAPAZARI - Mustafa Kemalpaşa İmam Hatip Ortaokulu
SAKARYA - ADAPAZARI - Mustafa Kemalpaşa İlkokulu
SAKARYA - ADAPAZARI - Mustafa Kemal Atatürk Ortaokulu
SAKARYA - ADAPAZARI - Murtaza Erdoğan Ortaokulu
SAKARYA - ADAPAZARI - Murtaza Erdoğan İlkokulu
SAKARYA - ADAPAZARI - Mithatpaşa Ortaokulu
SAKARYA - ADAPAZARI - Mithatpaşa Anadolu Lisesi
SAKARYA - ADAPAZARI - Mehmet Nuri İlkokulu
SAKARYA - ADAPAZARI - Mehmet Akif Ersoy İlkokulu
SAKARYA - ADAPAZARI - Medine Müdafii Fahreddin Paşa İmam Hatip Ortaokulu
SAKARYA - ADAPAZARI - Kurtuluş Ortaokulu
SAKARYA - ADAPAZARI - Kurtuluş İlkokulu
SAKARYA - ADAPAZARI - Kurtuluş Anaokulu
SAKARYA - ADAPAZARI - Korucuk Anaokulu
SAKARYA - ADAPAZARI - Karaosman İlkokulu
SAKARYA - ADAPAZARI - Karaman İlkokulu
SAKARYA - ADAPAZARI - Karakamış Ortaokulu
SAKARYA - ADAPAZARI - Karakamış İlkokulu
SAKARYA - ADAPAZARI - Karadere Ortaokulu
SAKARYA - ADAPAZARI - Karadere İlkokulu
SAKARYA - ADAPAZARI - İstiklal Ortaokulu
SAKARYA - ADAPAZARI - İsmet İnönü İlkokulu
SAKARYA - ADAPAZARI - Hızırtepe Ortaokulu
SAKARYA - ADAPAZARI - Hacı Sahure Koç Kızılay Anaokulu
SAKARYA - ADAPAZARI - Güneşler Anaokulu
SAKARYA - ADAPAZARI - Güneşler Anadolu Lisesi
SAKARYA - ADAPAZARI - Fatmana Okutan Anaokulu
SAKARYA - ADAPAZARI - Fatih Mesleki ve Teknik Anadolu Lisesi
SAKARYA - ADAPAZARI - Fatih İmam Hatip Ortaokulu
SAKARYA - ADAPAZARI - Fatih İlkokulu
SAKARYA - ADAPAZARI - Evrenköy Ortaokulu
SAKARYA - ADAPAZARI - Evrenköy İlkokulu
SAKARYA - ADAPAZARI - Eser İlkokulu
SAKARYA - ADAPAZARI - Çökekler İlkokulu
SAKARYA - ADAPAZARI - Çınar Anaokulu
SAKARYA - ADAPAZARI - Çark Anaokulu
SAKARYA - ADAPAZARI - Çamyolu Ortaokulu
SAKARYA - ADAPAZARI - Çamyolu İlkokulu
SAKARYA - ADAPAZARI - Cumhuriyet Anadolu Lisesi
SAKARYA - ADAPAZARI - Cengiz Topel Ortaokulu
SAKARYA - ADAPAZARI - Cengiz Topel İlkokulu
SAKARYA - ADAPAZARI - Camili Şehit Yaşar Atay Anaokulu
SAKARYA - ADAPAZARI - Camili Anaokulu
SAKARYA - ADAPAZARI - Budaklar İlkokulu
SAKARYA - ADAPAZARI - Borsa İstanbul Sakarya Mesleki ve Teknik Anadolu Lisesi
SAKARYA - ADAPAZARI - Borsa İstanbul Mehmet Akif Ersoy Mesleki ve Teknik Anadolu Lisesi
SAKARYA - ADAPAZARI - Berna Yılmaz Ortaokulu
SAKARYA - ADAPAZARI - Berna Yılmaz İlkokulu
SAKARYA - ADAPAZARI - Bayraktar İlkokulu
SAKARYA - ADAPAZARI - Aykut Yiğit Ortaokulu
SAKARYA - ADAPAZARI - Atatürk İlkokulu
SAKARYA - ADAPAZARI - Atatürk Anadolu Lisesi
SAKARYA - ADAPAZARI - Arif Nihat Asya Ortaokulu
SAKARYA - ADAPAZARI - Ahmet Akkoç Ortaokulu
SAKARYA - ADAPAZARI - Adapazarı Yenikent Halk Eğitimi Merkezi
SAKARYA - ADAPAZARI - Adapazarı Rehberlik ve Araştırma Merkezi
SAKARYA - ADAPAZARI - Adapazarı Prof. Dr.Tansu Çiller Ticaret Mesleki ve Teknik Anadolu Lisesi
SAKARYA - ADAPAZARI - Adapazarı Özel Eğitim Uygulama Okulu I. Kademe
SAKARYA - ADAPAZARI - Adapazarı Özel Eğitim Anaokulu
SAKARYA - ADAPAZARI - Adapazarı Ortaokulu
SAKARYA - ADAPAZARI - Adapazarı Mesleki Eğitim Merkezi
SAKARYA - ADAPAZARI - Adapazarı Kız Mesleki ve Teknik Anadolu Lisesi
SAKARYA - ADAPAZARI - Adapazarı İmam Hatip Ortaokulu
SAKARYA - ADAPAZARI - Adapazarı İlkokulu
SAKARYA - ADAPAZARI - Adapazarı Halk Eğitimi Merkezi
SAKARYA - ADAPAZARI - Adapazarı Hacı Zehra Akkoç Kız Anadolu Lisesi
SAKARYA - ADAPAZARI - Adapazarı Bilim ve Sanat Merkezi
SAKARYA - ADAPAZARI - Adapazarı Anaokulu
SAKARYA - ADAPAZARI - Adapazarı Anadolu İmam Hatip Lisesi
SAKARYA - ADAPAZARI - Ada Anaokulu
SAKARYA - ADAPAZARI - Abdülhamit Han Anaokulu
SAKARYA - ADAPAZARI - 75. Yıl Cumhuriyet Mesleki ve Teknik Anadolu Lisesi
SAKARYA - ADAPAZARI - 21 Haziran İlkokulu
SAKARYA - ADAPAZARI - 17 Ağustos İlkokulu
YALOVA - TERMAL - Yenimahalle Gümüşdere Ortaokulu
YALOVA - TERMAL - Yenimahalle Enver Üstün İlkokulu
YALOVA - TERMAL - Üvezpınar İlkokulu
YALOVA - TERMAL - Termal Ortaokulu
YALOVA - TERMAL - Termal İmam Hatip Ortaokulu
YALOVA - TERMAL - Termal İlkokulu
YALOVA - TERMAL - Termal Halk Eğitimi Merkezi
YALOVA - TERMAL - Akköy Ortaokulu
YALOVA - TERMAL - Akköy İlkokulu
YALOVA - MERKEZ - Zübeyde Hanım Ortaokulu
YALOVA - MERKEZ - Zübeyde Hanım Anaokulu
YALOVA - MERKEZ - Zehra Ekşinozlugil Kız Anadolu İmam Hatip Lisesi
YALOVA - MERKEZ - Yalova-Termal Fen Lisesi
YALOVA - MERKEZ - Yalova Rehberlik ve Araştırma Merkezi
YALOVA - MERKEZ - Yalova Özel Eğitim Anaokulu
YALOVA - MERKEZ - Yalova Öğretmenevi ve Akşam Sanat Okulu
YALOVA - MERKEZ - Yalova Nene Hatun Kız Mesleki ve Teknik Anadolu Lisesi
YALOVA - MERKEZ - Yalova Necmettin Erbakan Sosyal Bilimler Lisesi
YALOVA - MERKEZ - Yalova Lisesi
YALOVA - MERKEZ - Yalova İmam Hatip Ortaokulu
YALOVA - MERKEZ - Yalova İlkokulu
YALOVA - MERKEZ - Yalova Halk Eğitimi Merkezi
YALOVA - MERKEZ - Yalova Hafız İmam Hatip Ortaokulu
YALOVA - MERKEZ - Yalova Güzel Sanatlar Lisesi
YALOVA - MERKEZ - Yalova Abdülhamid Han Ortaokulu
YALOVA - MERKEZ - Vehice Turna Anaokulu
YALOVA - MERKEZ - TOBB Mesleki ve Teknik Anadolu Lisesi
YALOVA - MERKEZ - Şehit Zeynep Sağır Kız Anadolu İmam Hatip Lisesi
YALOVA - MERKEZ - Şehit Sercan Yazar Mesleki ve Teknik Anadolu Lisesi
YALOVA - MERKEZ - Şehit Osman Altınkuyu Anadolu Lisesi
YALOVA - MERKEZ - Şehit Kübra Doğanay İmam Hatip Ortaokulu
YALOVA - MERKEZ - Şehit Ahmet Uzun Ortaokulu
YALOVA - MERKEZ - Şaban Temuge Turizm Mesleki ve Teknik Anadolu Lisesi
YALOVA - MERKEZ - Suzan Tuna İlkokulu
YALOVA - MERKEZ - Suna Binicioğlu Anaokulu
YALOVA - MERKEZ - Sugören İsmet Koçhan Ortaokulu
YALOVA - MERKEZ - Sugören İsmet Koçhan İlkokulu
YALOVA - MERKEZ - Sevim Göğez Ortaokulu
YALOVA - MERKEZ - Samanlı Rebia Şenavcen Ortaokulu
YALOVA - MERKEZ - Samanlı İlkokulu
YALOVA - MERKEZ - Safran Ortaokulu
YALOVA - MERKEZ - Safran İlkokulu
YALOVA - MERKEZ - Saffet Çam Ortaokulu
YALOVA - MERKEZ - Sabri Ekşinozlugil Anadolu İmam Hatip Lisesi
YALOVA - MERKEZ - Rahmiye Palabıyık İmam Hatip Ortaokulu
YALOVA - MERKEZ - Rahmi Tokay Ortaokulu
YALOVA - MERKEZ - Rahmi Tokay İlkokulu
YALOVA - MERKEZ - Prof. Dr. Halil İnalcık Anadolu Lisesi
YALOVA - MERKEZ - Öğretmen Yusuf Ziya İlkokulu
YALOVA - MERKEZ - Orgeneral Selahattin Risalet Demircioğlu Ortaokulu
YALOVA - MERKEZ - Nadide Üstündağ Yıldırım Özel Eğitim Ortaokulu
YALOVA - MERKEZ - Nadide Üstündağ Yıldırım Özel Eğitim İlkokulu
YALOVA - MERKEZ - Nadide Üstündağ Yıldırım Özel Eğitim Anaokulu
YALOVA - MERKEZ - Müfettiş Hamdi Girgin İlkokulu
YALOVA - MERKEZ - Mevlana İlkokulu
YALOVA - MERKEZ - Mehmet Akif Ersoy Ortaokulu
YALOVA - MERKEZ - Mareşal Fevzi Çakmak İlkokulu
YALOVA - MERKEZ - Kurtköy İlkokulu
YALOVA - MERKEZ - Kirazlı Orhun Üstel İlkokulu
YALOVA - MERKEZ - Kardelen Ortaokulu
YALOVA - MERKEZ - Kardelen İlkokulu
YALOVA - MERKEZ - Kadıköy İlkokulu
YALOVA - MERKEZ - İsmetpaşa Mazlum Palabıyık Ortaokulu
YALOVA - MERKEZ - İsmetpaşa Mazlum Palabıyık İlkokulu
YALOVA - MERKEZ - Hüseyin Alkaş İlkokulu
YALOVA - MERKEZ - Hayme Hatun Anaokulu
YALOVA - MERKEZ - Gaziosmanpaşa İlkokulu
YALOVA - MERKEZ - Fatih Sultan Mehmet Anadolu Lisesi
YALOVA - MERKEZ - Esvet Sabri Aytaşman Özel Eğitim Meslek Okulu
YALOVA - MERKEZ - Elmalık Salim Delen Ortaokulu
YALOVA - MERKEZ - Elmalık Salim Delen İlkokulu
YALOVA - MERKEZ - Cumhuriyet Ortaokulu
YALOVA - MERKEZ - Bahçelievler İlkokulu
YALOVA - MERKEZ - Aydede Anaokulu
YALOVA - MERKEZ - Atatürk İlkokulu
YALOVA - MERKEZ - Atatürk Bilim ve Sanat Merkezi
YALOVA - MERKEZ - Alime Paşa Özel Eğitim Uygulama Okulu III. Kademe
YALOVA - MERKEZ - Alime Paşa Özel Eğitim Uygulama Okulu II. Kademe
YALOVA - MERKEZ - Alime Paşa Özel Eğitim Uygulama Okulu I. Kademe
YALOVA - MERKEZ - Adnan Menderes Ticaret Mesleki ve Teknik Anadolu Lisesi
YALOVA - MERKEZ - 75.Yıl Ziya Gökalp İlkokulu
YALOVA - MERKEZ - 700.Yıl Osmangazi Ortaokulu
YALOVA - MERKEZ - 700.Yıl Osmangazi İlkokulu
YALOVA - MERKEZ - 19 Temmuz İlkokulu
YALOVA - MERKEZ - 100. Yıl Bahçelievler Anaokulu
YALOVA - ÇİFTLİKKÖY - Taşköprü Ortaokulu
YALOVA - ÇİFTLİKKÖY - Taşköprü İlkokulu
YALOVA - ÇİFTLİKKÖY - Taşköprü Belediyesi Anaokulu
YALOVA - ÇİFTLİKKÖY - Şehit Talha Bahadır Ortaokulu
YALOVA - ÇİFTLİKKÖY - Şehit Ömer Halisdemir Ortaokulu
YALOVA - ÇİFTLİKKÖY - Şehit Muhammed İslam Altuğ Anadolu İmam Hatip Lisesi
YALOVA - ÇİFTLİKKÖY - Şehit Abdülhamit Kaya İmam Hatip Ortaokulu
YALOVA - ÇİFTLİKKÖY - Sultaniye Şehit Baçerettin Özgür İlkokulu
YALOVA - ÇİFTLİKKÖY - Ruhsar Aksoy İlkokulu
YALOVA - ÇİFTLİKKÖY - Ragıp Naile Saraç Anaokulu
YALOVA - ÇİFTLİKKÖY - Mehmet Akif İnan Ortaokulu
YALOVA - ÇİFTLİKKÖY - Kılıç Ortaokulu
YALOVA - ÇİFTLİKKÖY - Kılıç İlkokulu
YALOVA - ÇİFTLİKKÖY - Giyim Sanayicileri Derneği Eğitim Vakfı Çiftlikköy İlkokulu
YALOVA - ÇİFTLİKKÖY - Gazi Abdurrahman İlkokulu
YALOVA - ÇİFTLİKKÖY - Çiftlikköy Mustafa Kemal Anadolu Lisesi
YALOVA - ÇİFTLİKKÖY - Çiftlikköy Mesleki ve Teknik Anadolu Lisesi
YALOVA - ÇİFTLİKKÖY - Çiftlikköy Mesleki Eğitim Merkezi
YALOVA - ÇİFTLİKKÖY - Çiftlikköy Halk Eğitimi Merkezi
YALOVA - ÇİFTLİKKÖY - Çiftlikköy Atatürk Anadolu Lisesi
YALOVA - ÇİFTLİKKÖY - Aksa Mesleki ve Teknik Anadolu Lisesi
YALOVA - ÇİFTLİKKÖY - 75.Yıl Namık Kemal Ortaokulu
YALOVA - ÇİFTLİKKÖY - 75.Yıl Namık Kemal İlkokulu
YALOVA - ÇINARCIK - Yalova Esenköy Hizmetiçi Eğitim Enstitüsü ve Akşam Sanat Okulu
YALOVA - ÇINARCIK - Yalova Esenköy Eğitim ve Uygulama Merkezi
YALOVA - ÇINARCIK - Teşvikiye Cumhuriyet Ortaokulu
YALOVA - ÇINARCIK - Teşvikiye Cumhuriyet İlkokulu
YALOVA - ÇINARCIK - Koruköy Ortaokulu
YALOVA - ÇINARCIK - Koruköy İlkokulu
YALOVA - ÇINARCIK - Kocadere Ortaokulu
YALOVA - ÇINARCIK - Kocadere İlkokulu
YALOVA - ÇINARCIK - Hüdaverdi Aydın Ortaokulu
YALOVA - ÇINARCIK - Hüdaverdi Aydın İlkokulu
YALOVA - ÇINARCIK - Gülkent Ortaokulu
YALOVA - ÇINARCIK - Gülkent İlkokulu
YALOVA - ÇINARCIK - Gazi Mustafa Kemal Mesleki ve Teknik Anadolu Lisesi
YALOVA - ÇINARCIK - Esenköy Adnan Kaptan Ortaokulu
YALOVA - ÇINARCIK - Esenköy Adnan Kaptan İlkokulu
YALOVA - ÇINARCIK - Çiçek Yuvası Anaokulu
YALOVA - ÇINARCIK - Çınarcık Ortaokulu
YALOVA - ÇINARCIK - Çınarcık Mesleki ve Teknik Anadolu Lisesi
YALOVA - ÇINARCIK - Çınarcık İlkokulu
YALOVA - ÇINARCIK - Çınarcık Halk Eğitimi Merkezi
YALOVA - ÇINARCIK - Çınarcık Füruzan Kınal Ortaokulu
YALOVA - ÇINARCIK - Çınarcık Füruzan Kınal İlkokulu
YALOVA - ÇINARCIK - Çınarcık Atatürk Anadolu Lisesi
YALOVA - ÇINARCIK - Çınarcık Anadolu İmam Hatip Lisesi
YALOVA - ARMUTLU - Tanşu Aksoy Ortaokulu
YALOVA - ARMUTLU - Kapaklı Tülay İlgen Ortaokulu
YALOVA - ARMUTLU - Kapaklı Tülay İlgen İlkokulu
YALOVA - ARMUTLU - Fıstıklı Ortaokulu
YALOVA - ARMUTLU - Fıstıklı İlkokulu
YALOVA - ARMUTLU - Dursun Dumangöz Ortaokulu
YALOVA - ARMUTLU - Armutlu Vilayetler Birliği Hafize Sakız Anaokulu
YALOVA - ARMUTLU - Armutlu Halk Eğitimi Merkezi
YALOVA - ARMUTLU - Armutlu Çok Programlı Anadolu Lisesi
YALOVA - ARMUTLU - Armutlu Avukat Necati Toker İlkokulu
YALOVA - ARMUTLU - Armutlu Anadolu İmam Hatip Lisesi
YALOVA - ARMUTLU - 15 Temmuz İstiklal İlkokulu
YALOVA - ALTINOVA - Yalova Altınova Tersane Girişimcileri A.Ş. Denizcilik Mesleki ve Teknik Anadolu Lisesi
YALOVA - ALTINOVA - Vakıfbank İlkokulu
YALOVA - ALTINOVA - Tokmak Ortaokulu
YALOVA - ALTINOVA - Tokmak İlkokulu
YALOVA - ALTINOVA - Tavşanlı Şehitlik Ortaokulu
YALOVA - ALTINOVA - Tavşanlı Şehitlik İlkokulu
YALOVA - ALTINOVA - Subaşı Ortaokulu
YALOVA - ALTINOVA - Subaşı İlkokulu
YALOVA - ALTINOVA - Selahattin Aslan Anadolu Lisesi
YALOVA - ALTINOVA - Piyalepaşa Ortaokulu
YALOVA - ALTINOVA - Piyalepaşa İlkokulu
YALOVA - ALTINOVA - Piyalepaşa Anaokulu
YALOVA - ALTINOVA - Kaytazdere Tetaş Tekstil Ortaokulu
YALOVA - ALTINOVA - Kaytazdere Tetaş Tekstil İlkokulu
YALOVA - ALTINOVA - Kaytazdere Anaokulu
YALOVA - ALTINOVA - İbrahim Nuh Paksu Mesleki ve Teknik Anadolu Lisesi
YALOVA - ALTINOVA - Hacı Ali Saruhan Ortaokulu
YALOVA - ALTINOVA - Hacı Ali Saruhan İlkokulu
YALOVA - ALTINOVA - Fatih Sultan Mehmet Ortaokulu
YALOVA - ALTINOVA - Fatih Sultan Mehmet İlkokulu
YALOVA - ALTINOVA - Ayhan Cahit Gülan Kızılay Anaokulu
YALOVA - ALTINOVA - Altınova İlkokulu
YALOVA - ALTINOVA - Altınova Hürriyet Ortaokulu
YALOVA - ALTINOVA - Altınova Halk Eğitimi Merkezi
YALOVA - ALTINOVA - Altınova Bülent Özyürük Çok Programlı Anadolu Lisesi
YALOVA - ALTINOVA - Altınova Anadolu İmam Hatip Lisesi

// LÜTFEN 1755 SATIRIN TAMAMINI BURAYA ALT ALTA YAPIŞTIRIN...
// (Yukarıdaki örnek satırları silip kendi kopyaladığınızı yapıştırabilirsiniz)

  `;

  // Büyük harfli (KOCAELİ vs.) yazıları baş harfi büyük (Kocaeli) şekline getiren akıllı fonksiyon
  function toTitleCase(str) {
    if (!str) return '';
    return str.toLocaleLowerCase('tr-TR').split(' ').map(word => 
      word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1)
    ).join(' ');
  }

  const lines = rawCSV.split('\n');
  const parsedSchools = [];

  lines.forEach(line => {
    // Sondaki gereksiz virgülleri (,,) ve boşlukları temizle
    const cleanLine = line.replace(/,,+$/, '').trim(); 
    
    // Geçerli bir satır değilse atla
    if (!cleanLine || !cleanLine.includes(' - ')) return;

    const parts = cleanLine.split(' - ');
    if (parts.length >= 3) {
      const province = toTitleCase(parts[0].trim());
      const district = toTitleCase(parts[1].trim());
      
      // Okul adında da tire (-) olma ihtimaline karşı geri kalanları birleştiriyoruz
      const schoolName = parts.slice(2).join(' - ').trim(); 

      const nameLow = schoolName.toLocaleLowerCase('tr-TR');
      
      // Sadece İlkokul ve Ortaokul olanları tespit edip ayırıyoruz (Liseler ve Anaokulları otomatik elenir)
      let type = '';
      if (nameLow.includes('ilkokul') || nameLow.includes('i̇lkokul')) {
        type = 'ilkokul';
      } else if (nameLow.includes('ortaokul')) {
        type = 'ortaokul';
      }

      if (type !== '') {
        parsedSchools.push({
          province,
          district,
          type,
          name: schoolName
        });
      }
    }
  });

  // Okulları son olarak isme göre alfabetik sıralayarak uygulamaya gönder
  return parsedSchools.sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));
})();