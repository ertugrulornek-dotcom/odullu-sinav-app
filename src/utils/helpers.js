import { INITIAL_ZONES } from '../data/constants';

export const normalizeForSearch = (str) => {
  if (!str) return '';
  return str.toLocaleLowerCase('tr-TR').trim().replace(/\s+/g, ' ');
};

export const parsePrizeArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object' && data.title) {
    return data.title.split(',').map(item => ({
        title: item.trim(), desc: data.desc || '', img: data.img || ''
    })).filter(i => i.title);
  }
  return [];
};

export const findZoneByName = (zonesList, zoneName) => zonesList.find(z => z.name === zoneName);

// 🚀 DÜZELTME: Sınıf (grade) ve Cinsiyet (gender) eklendi, İstisna Kusursuzlaştırıldı!
export const determineZoneName = (province, district, neighborhood, gender, grade) => {
  
  // ÖZEL KÖRFEZ İSTİSNASI (17 Ağustos ve Cumhuriyet)
  if (district === 'Körfez' && (neighborhood === '17 Ağustos' || neighborhood === 'Cumhuriyet')) {
      if (gender === 'Kız') return 'Akarçeşme';
      if (gender === 'Erkek' && String(grade) === '8') return 'Akarçeşme';
      return 'Gebze'; // 3, 4, 5, 6 ve 7. Sınıf Erkekler GEBZE'ye gider!
  }

  for (const z of INITIAL_ZONES) {
    if (z.districts.includes(district)) return z.name;
    if (z.partialDistricts && z.partialDistricts[district] && z.partialDistricts[district].includes(neighborhood)) return z.name;
  }
  return null;
};

// 8. SINIF ERKEK İSTİSNASI EKLENMİŞ LOKASYON BULUCU
export const getNeighborhoodDetails = (zone, district, neighborhood, gender, grade) => {
    const defaultFallback = { phone: "0553 973 54 40", contactName: "", mapLink: null, centerName: "Sınav Merkezi Bekleniyor", address: "" };
    if (!zone || !district || !neighborhood) return defaultFallback;

    let mapping = null;
    let centerObj = null;

    if (zone.mappings) {
        if (String(grade) === '8' && gender === 'Erkek') {
            mapping = zone.mappings.find(m => m.district === district && m.neighborhood === neighborhood && m.gender === '8. Sınıf Erkek');
        }
        
        if (!mapping) {
            mapping = zone.mappings.find(m => m.district === district && m.neighborhood === neighborhood && m.gender === gender);
        }
        
        if (!mapping) {
            mapping = zone.mappings.find(m => m.district === district && m.neighborhood === neighborhood && (m.gender === 'Tümü' || !m.gender));
        }
    }

    if (!mapping && String(grade) === '8' && gender === 'Erkek' && zone.specialBoysCenters) {
        const specialKey = `${district}-${neighborhood}`;
        if (zone.specialBoysCenters[specialKey]) {
            const sp = zone.specialBoysCenters[specialKey];
            return {
                phone: sp.contactPhone || defaultFallback.phone,
                contactName: sp.contactName || "",
                mapLink: sp.mapLink || null,
                centerName: sp.centerName || defaultFallback.centerName,
                address: sp.address || "Açık adres bilgisi girilmemiş."
            };
        }
    }

    if (mapping && zone.centers) {
        centerObj = zone.centers.find(c => c.id === mapping.centerId);
    }

    if (!mapping || !centerObj) return defaultFallback;

    const finalMapLink = centerObj.mapLink || centerObj.mapUrl || centerObj.googleMaps || centerObj.link || null;
    const finalAddress = centerObj.address || centerObj.openAddress || centerObj.acikAdres || centerObj.fullAddress || "Açık adres bilgisi girilmemiş.";
    const finalCenterName = centerObj.name || centerObj.centerName || centerObj.schoolName || `${district} Sınav Merkezi`;

    return {
        phone: mapping.phone || defaultFallback.phone,
        contactName: mapping.contactName || "",
        mapLink: finalMapLink,
        centerName: finalCenterName,
        address: finalAddress
    };
};

export const formatToTurkishDate = (dateStr) => {
    if (!dateStr) return '';
    try {
        const cleanDate = dateStr.replace(/\//g, '-').replace(/\./g, '-');
        const parts = cleanDate.split('-');
        let year, month, day;
        if (parts[0].length === 4) { year = parts[0]; month = parts[1]; day = parts[2]; }
        else { day = parts[0]; month = parts[1]; year = parts[2]; }
        
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
        const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
        
        return `${parseInt(day)} ${monthNames[parseInt(month)-1]} ${dayNames[dateObj.getDay()]}`;
    } catch(e) {
        return dateStr;
    }
};