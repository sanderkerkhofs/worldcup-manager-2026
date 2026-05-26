import { prisma } from '../repository/prisma/client';
import { competition, fixedRoundMatchCounts, fixedRounds, seededPlayersPerTeam } from './competition';
import { hashPassword } from './password';

const playerFirstNames = [
  'Alex', 'Marco', 'Luis', 'Jamal', 'Tariq', 'Hugo', 'Noah', 'Mateo', 'Omar', 'Ethan',
  'Luka', 'Sven', 'Youssef', 'Kenta', 'Rayan', 'Pablo', 'Leon', 'Adem', 'Nico', 'Samir',
];

const playerLastNames = [
  'Silva', 'Garcia', 'Mendes', 'Khan', 'Lopez', 'Rossi', 'Hansen', 'Ibrahim', 'Costa', 'Santos',
  'Okafor', 'Berg', 'Diaz', 'Sato', 'Haddad', 'Ferreira', 'Ivanov', 'Amin', 'Khalil', 'Moreira',
];

const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

const seededReferees = [
  { username: 'Michael_Oliver' },
  { username: 'Ismail_Elfath' },
  { username: 'Tori_Penso' },
  { username: 'Frank_De_Bleeckere' },
] as const;

const seededUsers = [
  { username: 'greetjej', password: 'greetjej123' },
  { username: 'elkes', password: 'elkes123' },
  { username: 'johanp', password: 'johanp123' },
] as const;

async function main() {
  await prisma.goal.deleteMany();
  await prisma.match.deleteMany();
  await prisma.player.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();

  const [adminHash, refereeHash, ...userHashes] = await Promise.all([
    hashPassword('admin123'),
    hashPassword('referee123'),
    ...seededUsers.map((user) => hashPassword(user.password)),
  ]);

  await prisma.user.createMany({
    data: [
      { username: 'admin', passwordHash: adminHash, role: 'ADMIN' },
      ...seededUsers.map((user, index) => ({
        username: user.username,
        passwordHash: userHashes[index],
        role: 'USER' as const,
      })),
      ...seededReferees.map((referee) => ({
        username: referee.username,
        passwordHash: refereeHash,
        role: 'REFEREE' as const,
      })),
    ],
  });

  const refereeUsers = await prisma.user.findMany({
    where: { role: 'REFEREE' },
    orderBy: { username: 'asc' },
  });

  const teamSeedData = [
    { name: 'Argentina', country: 'Argentina', countryShortName: 'ARG', countryFlag: '🇦🇷', coach: 'Lionel Scaloni' },
    { name: 'Brazil', country: 'Brazil', countryShortName: 'BRA', countryFlag: '🇧🇷', coach: 'Dorival Junior' },
    { name: 'France', country: 'France', countryShortName: 'FRA', countryFlag: '🇫🇷', coach: 'Didier Deschamps' },
    { name: 'Germany', country: 'Germany', countryShortName: 'GER', countryFlag: '🇩🇪', coach: 'Julian Nagelsmann' },
    { name: 'Spain', country: 'Spain', countryShortName: 'ESP', countryFlag: '🇪🇸', coach: 'Luis de la Fuente' },
    { name: 'England', country: 'England', countryShortName: 'ENG', countryFlag: '🏴', coach: 'Gareth Southgate' },
    { name: 'Netherlands', country: 'Netherlands', countryShortName: 'NED', countryFlag: '🇳🇱', coach: 'Ronald Koeman' },
    { name: 'Portugal', country: 'Portugal', countryShortName: 'POR', countryFlag: '🇵🇹', coach: 'Roberto Martinez' },
    { name: 'Belgium', country: 'Belgium', countryShortName: 'BEL', countryFlag: '🇧🇪', coach: 'Domenico Tedesco' },
    { name: 'Italy', country: 'Italy', countryShortName: 'ITA', countryFlag: '🇮🇹', coach: 'Luciano Spalletti' },
    { name: 'Croatia', country: 'Croatia', countryShortName: 'CRO', countryFlag: '🇭🇷', coach: 'Zlatko Dalic' },
    { name: 'Uruguay', country: 'Uruguay', countryShortName: 'URU', countryFlag: '🇺🇾', coach: 'Marcelo Bielsa' },
    { name: 'Colombia', country: 'Colombia', countryShortName: 'COL', countryFlag: '🇨🇴', coach: 'Nestor Lorenzo' },
    { name: 'United States', country: 'United States', countryShortName: 'USA', countryFlag: '🇺🇸', coach: 'Gregg Berhalter' },
    { name: 'Mexico', country: 'Mexico', countryShortName: 'MEX', countryFlag: '🇲🇽', coach: 'Javier Aguirre' },
    { name: 'Canada', country: 'Canada', countryShortName: 'CAN', countryFlag: '🇨🇦', coach: 'Jesse Marsch' },
    { name: 'Japan', country: 'Japan', countryShortName: 'JPN', countryFlag: '🇯🇵', coach: 'Hajime Moriyasu' },
    { name: 'South Korea', country: 'South Korea', countryShortName: 'KOR', countryFlag: '🇰🇷', coach: 'Jurgen Klinsmann' },
    { name: 'Australia', country: 'Australia', countryShortName: 'AUS', countryFlag: '🇦🇺', coach: 'Graham Arnold' },
    { name: 'Morocco', country: 'Morocco', countryShortName: 'MAR', countryFlag: '🇲🇦', coach: 'Walid Regragui' },
    { name: 'Senegal', country: 'Senegal', countryShortName: 'SEN', countryFlag: '🇸🇳', coach: 'Aliou Cisse' },
    { name: 'Nigeria', country: 'Nigeria', countryShortName: 'NGA', countryFlag: '🇳🇬', coach: 'Jose Peseiro' },
    { name: 'Egypt', country: 'Egypt', countryShortName: 'EGY', countryFlag: '🇪🇬', coach: 'Rui Vitoria' },
    { name: 'Cameroon', country: 'Cameroon', countryShortName: 'CMR', countryFlag: '🇨🇲', coach: 'Rigobert Song' },
    { name: 'Ghana', country: 'Ghana', countryShortName: 'GHA', countryFlag: '🇬🇭', coach: 'Otto Addo' },
    { name: 'Algeria', country: 'Algeria', countryShortName: 'ALG', countryFlag: '🇩🇿', coach: 'Djamel Belmadi' },
    { name: 'Switzerland', country: 'Switzerland', countryShortName: 'SUI', countryFlag: '🇨🇭', coach: 'Murat Yakin' },
    { name: 'Denmark', country: 'Denmark', countryShortName: 'DEN', countryFlag: '🇩🇰', coach: 'Kasper Hjulmand' },
    { name: 'Poland', country: 'Poland', countryShortName: 'POL', countryFlag: '🇵🇱', coach: 'Michal Probierz' },
    { name: 'Serbia', country: 'Serbia', countryShortName: 'SRB', countryFlag: '🇷🇸', coach: 'Dragan Stojkovic' },
    { name: 'Austria', country: 'Austria', countryShortName: 'AUT', countryFlag: '🇦🇹', coach: 'Ralf Rangnick' },
    { name: 'Turkey', country: 'Turkey', countryShortName: 'TUR', countryFlag: '🇹🇷', coach: 'Vincenzo Montella' },
  ];

  const shuffledTeams = [...teamSeedData].sort(() => Math.random() - 0.5).slice(0, 16);

  const teams = await prisma.team.createManyAndReturn({ data: shuffledTeams });

  for (const team of teams) {
    await prisma.player.createMany({
      data: Array.from({ length: seededPlayersPerTeam }, (_unused, index) => ({
        teamId: team.id,
        firstName: playerFirstNames[(index + team.name.length) % playerFirstNames.length],
        lastName: playerLastNames[(index + team.country.length) % playerLastNames.length],
        shirtNumber: index + 1,
        position: positions[index % positions.length],
        status: index < 12 ? 'AVAILABLE' : 'UNAVAILABLE',
      })),
    });
  }

  const orderedRounds = [...fixedRounds].sort((left, right) => left.orderNumber - right.orderNumber);
  const seedStartDate = new Date(Date.UTC(2026, 5, 10, 14, 0, 0));
  let globalMatchIndex = 0;
  const allMatches = [] as Array<{
    roundOrderNumber: number;
    roundName: string;
    homeTeamId: string | null;
    awayTeamId: string | null;
    refereeId: string | null;
    matchDate: Date;
    status: 'PLANNED' | 'NOT_STARTED' | 'IN_PROGRESS';
    homeScore: null;
    awayScore: null;
  }>;

  for (const round of orderedRounds) {
    const roundMatchCount = fixedRoundMatchCounts[round.orderNumber - 1] ?? 0;

    for (let index = 0; index < roundMatchCount; index += 1) {
      const referee = refereeUsers[(index + round.orderNumber) % refereeUsers.length];
      const hasKnownTeams = round.orderNumber === 1;
      const homeTeam = hasKnownTeams ? teams[index * 2] : null;
      const awayTeam = hasKnownTeams ? teams[index * 2 + 1] : null;
      const matchDate = new Date(seedStartDate.getTime() + globalMatchIndex * 24 * 60 * 60 * 1000);
      globalMatchIndex += 1;

      allMatches.push({
        roundOrderNumber: round.orderNumber,
        roundName: round.name,
        homeTeamId: homeTeam?.id ?? null,
        awayTeamId: awayTeam?.id ?? null,
        refereeId: referee?.id ?? null,
        matchDate,
        status: round.orderNumber === 1 ? 'IN_PROGRESS' : 'PLANNED',
        homeScore: null,
        awayScore: null,
      });
    }
  }

  await prisma.match.createMany({ data: allMatches });

  console.log(`Database seeded with ${competition.name}, 16 teams, precreated knockout matches, 15 players per team, and multiple referees.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
