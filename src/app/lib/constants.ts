// src/app/lib/constants.ts

// 1. Seasons / Years (1980 through 2026)
export const SHIRT_YEARS = Array.from(
  { length: 2026 - 1980 + 1 },
  (_, i) => (1980 + i).toString()
);

// 2. Condition Ratings (8, 9, 10)
export const SHIRT_CONDITIONS = [8, 9, 10] as const;

// 3. Kit Sizes (Youth & Adult)
export const SHIRT_SIZES = [
  'YS', 'YM', 'YL', 'YXL',
  'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'
] as const;

// 4. Kit Types / Garments
export const KIT_TYPES = [
  'Home', 'Away', 'Third', 'Fourth', 'Fifth',
  'GK', 'Jacket', 'Drill', 'Polo', 'Pre-match'
] as const;

// 5. Kit Specs / Editions
export const KIT_SPECS = ['Stadium', 'Player Issue', 'Match Issue'] as const;

// 6. Kit Brands
export const KIT_BRANDS = [
  'Nike', 'Adidas', 'Puma', 'Umbro', 'Kappa', 'Hummel', 'Reebok',
  'Lotto', 'Mizuno', 'Macron', 'Castore', 'Under Armour', 'New Balance',
  'Kelme', 'Joma', 'Diadora', 'Asics', 'Admiral', 'Other'
] as const;

// 7. Seed/Dropdown list of verified Teams & Nations
export const TEAMS_AND_COUNTRIES = [
  // England
  'Arsenal', 'Aston Villa', 'AFC Bournemouth', 'Brentford', 'Brighton & Hove Albion',
  'Burnley', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Leeds United',
  'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United',
  'Newcastle United', 'Nottingham Forest', 'Sunderland', 'Tottenham Hotspur',
  'West Ham United', 'Wolverhampton Wanderers', 'Ipswich Town', 'Birmingham',
  'Millwall', 'Norwich City', 'Sheffield Wednesday', 'Blackburn Rovers', 'Swansea',
  'Hull City', 'Stoke City', 'Swindon Town', 'Derby County', 'Luton Town',
  'Cardiff', 'Southampton', 'Exeter City', 'Stockport County',

  // Spain
  'Barcelona', 'Real Madrid', 'Atletico Madrid', 'Athletic Bilbao', 'Valencia',
  'Villarreal', 'Real Valladolid', 'Sporting Gijon', 'Girona',

  // Italy
  'Atalanta', 'Bologna', 'Fiorentina', 'Genoa', 'Inter Milan', 'Juventus',
  'Lazio', 'AC Milan', 'Napoli', 'Parma', 'AS Roma', 'Torino', 'Udinese', 'Lecce',

  // Germany
  'Bayern', 'Dortmund', 'Borussia Mönchengladbach', 'VfB Stuttgart', 'VfL Wolfsburg',
  'RB Leipzig', 'FC Augsburg', 'Hamburg', 'Kaiserslautern', 'Stuttgarter Kickers',
  'FC Magdeburg', 'Schalke',

  // France
  'Lyon', 'Marseille', 'PSG', 'Auxerre', 'Lille', 'Stade Rennais',

  // Netherlands, Portugal, Scotland, Rest of Europe
  'Ajax', 'PSV', 'Feyenoord', 'Porto', 'Celtic', 'Rangers', 'Galatasaray',
  'Besiktas', 'Fenerbahce', 'CSA Steaua București', 'Dynamo Kyiv', 'Slavia Prague',
  'Brondby', 'Kilmarnock', 'Sparta Prague',

  // Americas
  'Atlanta United', 'Charlotte', 'Chicago Fire', 'FC Cincinnati', 'Columbus Crew',
  'DC United', 'Inter Miami', 'CF Montréal', 'Nashville SC', 'New York City FC',
  'New York Red Bulls', 'Orlando City', 'Philadelphia Union', 'Toronto FC',
  'Austin FC', 'Colorado Rapids', 'FC Dallas', 'Houston Dynamo', 'LA Galaxy',
  'LAFC', 'Minnesota United', 'Portland Timbers', 'Real Salt Lake', 'San Diego',
  'San Jose Earthquakes', 'Seattle Sounders', 'Sporting Kansas City', 'St. Louis City',
  'Vancouver Whitecaps', 'New York Cosmos', 'Chivas USA', 'Club América',
  'Guadalajara', 'Cruz Azul', 'Pumas UNAM', 'Tigres UANL', 'Monterrey',
  'Santos Laguna', 'Toluca', 'Pachuca', 'León', 'Atlas', 'Tijuana',
  'Querétaro', 'Juárez', 'Atlético San Luis', 'Mazatlán', 'Necaxa', 'Puebla',
  'Boca Juniors', 'Flamengo', 'Vasco De Gama', 'Palmeiras', 'Millonarios',

  // Saudi Pro League & Gulf
  'Al Hilal', 'Al Nassr', 'Al Ittihad', 'Al Ahli', 'Al Ettifaq', 'Al Shabab',
  'Al Taawoun', 'Al Fateh', 'Al Fayha', 'Abha', 'Al Raed', 'Al Khaleej',
  'Al Wehda', 'Damac', 'Al Okhdood', 'Al Hazem', 'Al Riyadh', 'Al Qadsiah', 'Al Ain',

  // Asia
  'Vissel Kobe', 'Yokohama F Marinos', 'Kawasaki Frontale', 'Urawa Red Diamonds',
  'Gamba Osaka', 'Cerezo Osaka', 'FC Tokyo', 'Sanfrecce Hiroshima', 'Nagoya Grampus',
  'Hokkaido Consadole Sapporo', 'Shonan Bellmare', 'Kashima Antlers', 'Albirex Niigata',
  'Kyoto Sanga', 'Avispa Fukuoka', 'Sagan Tosu', 'Shimizu S Pulse', 'Kashiwa Reysol',
  'Machida Zelvia', 'Tokyo Verdy', 'Jubilo Iwata', 'Kataller Toyama', 'Shanghai Port',
  'Shanghai Shenhua', 'Shandong Taishan', 'Beijing Guoan', 'Chengdu Rongcheng',
  'Zhejiang', 'Henan', 'Tianjin Jinmen Tiger', 'Qingdao West Coast', 'Qingdao Hainiu',
  'Meizhou Hakka', 'Wuhan Three Towns', 'Changchun Yatai', 'Shenzhen Peng City',
  'Nantong Zhiyun', 'Cangzhou Mighty Lions', 'Guangzhou Evergrande', 'Suning',
  'Seoul FC', 'Suwon Samsung Bluewings', 'Jeonbuk Hyundai Motors', 'Pohang Steelers',
  'Goyang KB Kookmin Bank FC', 'Rayong FC', 'Samut Prakan City', 'Kitchee',
  'Eastern SC', 'South China AA', 'Melbourne Victory', 'Central Coast Mariners',
  'Orlando Pirates',

  // National Teams
  'Argentina', 'Brazil', 'England', 'France', 'Germany', 'Italy', 'Spain', 'Portugal',
  'Holland', 'Croatia', 'Belgium', 'Switzerland', 'Denmark', 'Austria', 'Sweden',
  'Poland', 'Czech Republic', 'Serbia', 'Turkey', 'Ukraine', 'Hungary', 'Norway',
  'Scotland', 'Ireland', 'Northern Ireland', 'Slovenia', 'Yugoslavia', 'USA',
  'Mexico', 'Canada', 'Jamaica', 'Costa Rica', 'Uruguay', 'Colombia', 'Ecuador',
  'Chile', 'Paraguay', 'Japan', 'South Korea', 'Iran', 'Saudi Arabia', 'Qatar',
  'Australia', 'China', 'Hong Kong', 'Singapore', 'Thailand', 'Vietnam',
  'Morocco', 'Senegal', 'Nigeria', 'Cameroon', 'Ghana', 'Ivory Coast', 'Algeria',
  'Tunisia', 'Egypt', 'South Africa'
] as const;