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

// determineZoneName fonksiyonunu bul ve bu şekilde güncelle:
export const determineZoneName = (province, district, neighborhood, gender, grade, zonesFromDb = []) => {
  // 1. Önce Veritabanındaki Canlı Atamalara (Mappings) Bak (En Öncelikli)
  if (zonesFromDb.length > 0) {
    const possibleMappings = [];
    zonesFromDb.forEach(z => {
      const found = z.mappings?.find(m => 
        m.district === district && 
        m.neighborhood === neighborhood && 
        (m.gender === gender || m.gender === 'Tümü' || (m.gender === '8. Sınıf Erkek' && String(grade) === '8' && gender === 'Erkek'))
      );
      if (found) possibleMappings.push({ zoneName: z.name, centerId: found.centerId });
    });
    
    // Eğer sadece 1 eşleşme varsa direkt o mıntıkayı döndür
    if (possibleMappings.length === 1) return possibleMappings[0].zoneName;
    // Eğer birden fazla varsa 'MULTI' dön ki kayıt ekranı seçim yaptırsın
    if (possibleMappings.length > 1) return 'MULTI';
  }

  // 2. Eğer veritabanında atama yoksa statik istisnalara bak (Körfez vb.)
  if (district === 'Körfez' && (neighborhood === '17 Ağustos' || neighborhood === 'Cumhuriyet')) {
      if (gender === 'Kız' || (gender === 'Erkek' && String(grade) === '8')) return 'Akarçeşme';
      return 'Gebze';
  }
  
  // 3. Hiçbiri yoksa varsayılan listeye bak
  const zList = zonesFromDb.length > 0 ? zonesFromDb : INITIAL_ZONES;
  for (const z of zList) {
    if (z.districts?.includes(district)) return z.name;
    if (z.partialDistricts && z.partialDistricts[district]?.includes(neighborhood)) return z.name;
  }
  return null;
};

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