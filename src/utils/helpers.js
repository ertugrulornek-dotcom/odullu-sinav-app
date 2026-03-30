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

export const determineZoneName = (province, district, neighborhood) => {
  for (const z of INITIAL_ZONES) {
    if (z.districts.includes(district)) return z.name;
    if (z.partialDistricts && z.partialDistricts[district] && z.partialDistricts[district].includes(neighborhood)) return z.name;
  }
  return null;
};

  // 8. SINIF ERKEK İSTİSNASI EKLENMİŞ LOKASYON BULUCU
// ... diğer kodlar aynı (formatToTurkishDate vs)

export const getNeighborhoodDetails = (zone, district, neighborhood, gender, grade) => {
    const defaultFallback = { phone: "0553 973 54 40", contactName: "", mapLink: null, centerName: "Sınav Merkezi Bekleniyor", address: "" };
    if (!zone || !district || !neighborhood) return defaultFallback;

    let centerInfo = null;

    if (String(grade) === '8' && gender === 'Erkek') {
        const specialKey = `${district}-${neighborhood}`;
        const specialCenter = zone.specialBoysCenters?.[specialKey];
        if (specialCenter) {
            centerInfo = {
                phone: specialCenter.contactPhone || defaultFallback.phone,
                contactName: specialCenter.contactName || "",
                mapLink: specialCenter.mapLink || null,
                centerName: specialCenter.centerName || defaultFallback.centerName,
                address: specialCenter.address || ""
            };
        }
    }

    if (!centerInfo) {
        const centerKey = `${district}-${neighborhood}`;
        if (zone.centers && zone.centers[centerKey]) { centerInfo = zone.centers[centerKey]; } 
        else if (zone.mappings) { centerInfo = zone.mappings.find(m => m.district === district && m.neighborhood === neighborhood); }
    }

    if (!centerInfo) return defaultFallback;

    let phone = centerInfo.contactPhone || centerInfo.phone;
    if (gender === 'Kız' && centerInfo.contactPhoneKiz) phone = centerInfo.contactPhoneKiz;

    let finalCenterName = centerInfo.centerName || defaultFallback.centerName;

    // DÜZELTME: Sınav merkezi girilmemişse, hoca adını gizle ve ana numarayı göster!
    if (finalCenterName === "Sınav Merkezi Bekleniyor" || !centerInfo.address) {
        return defaultFallback;
    }

    return {
        phone: phone || defaultFallback.phone,
        contactName: centerInfo.contactName || "",
        mapLink: centerInfo.mapLink || defaultFallback.mapLink,
        centerName: finalCenterName,
        address: centerInfo.address || defaultFallback.address
    };
};
// GÜN-AY-HANGİ GÜN Formatına Çeviren Fonksiyon
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



  