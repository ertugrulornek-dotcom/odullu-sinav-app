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

export const getNeighborhoodDetails = (zone, district, neighborhood, gender = null) => {
  const defaultDetails = { phone: "0531 333 32 32", centerName: "Sınav Merkezi Bekleniyor", address: "", mapLink: "", contactName: "" };
  if (!zone || !zone.mappings || !zone.centers) return defaultDetails;
  
  let map = null;

  // 1. Önce öğrencinin cinsiyetine (Erkek/Kız) özel atama yapılmış mı kontrol et
  if (gender) {
    map = zone.mappings.find(m => m.district === district && m.neighborhood === neighborhood && m.gender === gender);
  }

  // 2. Eğer cinsiyete özel atama yoksa "Tümü" veya cinsiyetsiz bırakılmış genel atamayı bul
  if (!map) {
    map = zone.mappings.find(m => m.district === district && m.neighborhood === neighborhood && (!m.gender || m.gender === 'Tümü'));
  }
           
  if (!map) return defaultDetails;

  const center = zone.centers.find(c => c.id === map.centerId);
  if (!center) return { ...defaultDetails, phone: map.phone || defaultDetails.phone, contactName: map.contactName || "" };

  return {
    phone: map.phone || defaultDetails.phone,
    contactName: map.contactName || "",
    centerName: center.name,
    address: center.address,
    mapLink: center.mapLink
  };
  };