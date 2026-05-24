const COUNTRY_FLAG_BY_SHORT_NAME: Record<string, string> = {
  ALG: '🇩🇿',
  ARG: '🇦🇷',
  AUS: '🇦🇺',
  AUT: '🇦🇹',
  BEL: '🇧🇪',
  BRA: '🇧🇷',
  CAN: '🇨🇦',
  CMR: '🇨🇲',
  COL: '🇨🇴',
  CRO: '🇭🇷',
  DEN: '🇩🇰',
  EGY: '🇪🇬',
  ENG: '🏴',
  ESP: '🇪🇸',
  FRA: '🇫🇷',
  GER: '🇩🇪',
  GHA: '🇬🇭',
  ITA: '🇮🇹',
  JPN: '🇯🇵',
  KOR: '🇰🇷',
  MAR: '🇲🇦',
  MEX: '🇲🇽',
  NED: '🇳🇱',
  NGA: '🇳🇬',
  POL: '🇵🇱',
  POR: '🇵🇹',
  SEN: '🇸🇳',
  SRB: '🇷🇸',
  SUI: '🇨🇭',
  TUR: '🇹🇷',
  URU: '🇺🇾',
  USA: '🇺🇸',
};

export function getCountryFlagFromShortName(countryShortName: string | null | undefined): string | null {
  if (!countryShortName) {
    return null;
  }

  return COUNTRY_FLAG_BY_SHORT_NAME[countryShortName] ?? null;
}
