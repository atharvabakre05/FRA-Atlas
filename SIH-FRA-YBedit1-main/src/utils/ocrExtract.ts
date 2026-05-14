export interface ExtractedFields {
  // General Information
  claimType?: string;
  claimantName?: string;
  guardianName?: string;
  genderAge?: string;
  caste?: string;
  aadhaar?: string;

  // Land & Location
  village?: string;
  panchayat?: string;
  block?: string;
  district?: string;
  state?: string;
  surveyNumber?: string;
  landClaimed?: string;
  landUseType?: string;
  boundaries?: string;

  // Evidence toggles
  selectedEvidence?: string[];
}

export function extractFieldsFromText(text: string): ExtractedFields {
  const cleaned = text.replace(/\r/g, '').trim();
  const find = (re: RegExp) => {
    const m = cleaned.match(re);
    return m && m[1] ? m[1].trim() : undefined;
  };

  const numeric = (re: RegExp) => {
    const v = find(re);
    if (!v) return undefined;
    const num = v.match(/[\d.]+/);
    return num ? num[0] : v;
  };

  const fields: ExtractedFields = {};

  // General
  fields.claimantName = find(/(?:name|claimant)[\s:.-]*([a-zA-Z\s]+)(?:\n|$)/i);
  fields.guardianName = find(/(?:father|mother|spouse|guardian)[\s:.-]*([a-zA-Z\s]+)/i);
  const gender = find(/(?:gender)[\s:.-]*([a-zA-Z]+)/i);
  const age = numeric(/(?:age)[\s:.-]*([\d]{1,3})/i);
  if (gender || age) fields.genderAge = [gender, age].filter(Boolean).join(' ');
  fields.caste = find(/(?:caste|tribe|tribal\s*group)[\s:.-]*([a-zA-Z\s]+)/i);
  // Aadhaar / UIDAI: capture 12 digits possibly spaced (XXXX XXXX XXXX)
  const aad = cleaned.match(/(?:aadhaar|aadhar|uidai|uid)[:\s-]*([0-9]{4}[\s-]?[0-9]{4}[\s-]?[0-9]{4})/i) || cleaned.match(/\b([0-9]{4}\s?[0-9]{4}\s?[0-9]{4})\b/);
  if (aad && aad[1]) {
    fields.aadhaar = aad[1].replace(/\s|-/g, '');
  }

  // Claim type
  const ct = find(/(?:claim\s*type|type\s*of\s*claim)[\s:.-]*([a-zA-Z\s]+)/i)?.toUpperCase();
  if (ct) {
    if (ct.includes('INDIV')) fields.claimType = 'IFR';
    else if (ct.includes('COMMUNITY FOREST RESOURCE') || ct.includes('CFR')) fields.claimType = 'CFR';
    else if (ct.includes('COMMUNITY') || ct === 'CR') fields.claimType = 'CR';
  }

  // Land & location
  fields.village = find(/(?:village)[\s:.-]*([a-zA-Z\s]+)/i);
  fields.panchayat = find(/(?:panchayat)[\s:.-]*([a-zA-Z\s]+)/i);
  fields.block = find(/(?:block)[\s:.-]*([a-zA-Z\s]+)/i);
  fields.district = find(/(?:district)[\s:.-]*([a-zA-Z\s]+)/i);
  fields.state = find(/(?:state)[\s:.-]*([a-zA-Z\s]+)/i);
  fields.surveyNumber = find(/(?:survey\s*no\.?|khasra\s*no\.?|patta\s*number)[\s:.-]*([a-zA-Z0-9\/\-\s]+)/i);
  fields.landClaimed = numeric(/(?:area|land\s*claimed)[\s:.-]*([\d.]+)(?:\s*(?:ha|hectare|acre|ac))?/i);
  const useType = find(/(?:land\s*use\s*type|use\s*type)[\s:.-]*([a-zA-Z\s]+)/i)?.toLowerCase();
  if (useType) {
    if (useType.includes('cult')) fields.landUseType = 'cultivation';
    else if (useType.includes('home')) fields.landUseType = 'homestead';
    else if (useType.includes('graz')) fields.landUseType = 'grazing';
    else if (useType.includes('community forest resource') || useType.includes('cfr')) fields.landUseType = 'CFR';
  }
  const bounds = find(/(?:boundar(?:y|ies)|description)[\s:.-]*([\s\S]{0,300})/i);
  if (bounds) fields.boundaries = bounds;

  // Evidence toggles based on detected keywords
  const ev: string[] = [];
  if (/ration|aadhaar|aadhar|voter\s*id|residential/i.test(cleaned)) ev.push('residentialProof');
  if (/occupation|cultivation|kisan|farmer/i.test(cleaned)) ev.push('occupationProof');
  if (/community\s*rights|gram\s*sabha|frc/i.test(cleaned)) ev.push('communityRights');
  if (ev.length) fields.selectedEvidence = Array.from(new Set(ev));

  return fields;
}


