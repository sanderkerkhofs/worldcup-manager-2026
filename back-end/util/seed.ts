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
    { name: 'Argentina', country: 'Argentina', countryShortName: 'ARG', countryFlag: '🇦🇷' },
    { name: 'Brazil', country: 'Brazil', countryShortName: 'BRA', countryFlag: '🇧🇷' },
    { name: 'France', country: 'France', countryShortName: 'FRA', countryFlag: '🇫🇷' },
    { name: 'Germany', country: 'Germany', countryShortName: 'GER', countryFlag: '🇩🇪' },
    { name: 'Spain', country: 'Spain', countryShortName: 'ESP', countryFlag: '🇪🇸' },
    { name: 'England', country: 'England', countryShortName: 'ENG', countryFlag: '🏴' },
    { name: 'Netherlands', country: 'Netherlands', countryShortName: 'NED', countryFlag: '🇳🇱' },
    { name: 'Portugal', country: 'Portugal', countryShortName: 'POR', countryFlag: '🇵🇹' },
    { name: 'Belgium', country: 'Belgium', countryShortName: 'BEL', countryFlag: '🇧🇪' },
    { name: 'Italy', country: 'Italy', countryShortName: 'ITA', countryFlag: '🇮🇹' },
    { name: 'Croatia', country: 'Croatia', countryShortName: 'CRO', countryFlag: '🇭🇷' },
    { name: 'Uruguay', country: 'Uruguay', countryShortName: 'URU', countryFlag: '🇺🇾' },
    { name: 'Colombia', country: 'Colombia', countryShortName: 'COL', countryFlag: '🇨🇴' },
    { name: 'United States', country: 'United States', countryShortName: 'USA', countryFlag: '🇺🇸' },
    { name: 'Mexico', country: 'Mexico', countryShortName: 'MEX', countryFlag: '🇲🇽' },
    { name: 'Canada', country: 'Canada', countryShortName: 'CAN', countryFlag: '🇨🇦' },
    { name: 'Japan', country: 'Japan', countryShortName: 'JPN', countryFlag: '🇯🇵' },
    { name: 'South Korea', country: 'South Korea', countryShortName: 'KOR', countryFlag: '🇰🇷' },
    { name: 'Australia', country: 'Australia', countryShortName: 'AUS', countryFlag: '🇦🇺' },
    { name: 'Morocco', country: 'Morocco', countryShortName: 'MAR', countryFlag: '🇲🇦' },
    { name: 'Senegal', country: 'Senegal', countryShortName: 'SEN', countryFlag: '🇸🇳' },
    { name: 'Nigeria', country: 'Nigeria', countryShortName: 'NGA', countryFlag: '🇳🇬' },
    { name: 'Egypt', country: 'Egypt', countryShortName: 'EGY', countryFlag: '🇪🇬' },
    { name: 'Cameroon', country: 'Cameroon', countryShortName: 'CMR', countryFlag: '🇨🇲' },
    { name: 'Ghana', country: 'Ghana', countryShortName: 'GHA', countryFlag: '🇬🇭' },
    { name: 'Algeria', country: 'Algeria', countryShortName: 'ALG', countryFlag: '🇩🇿' },
    { name: 'Switzerland', country: 'Switzerland', countryShortName: 'SUI', countryFlag: '🇨🇭' },
    { name: 'Denmark', country: 'Denmark', countryShortName: 'DEN', countryFlag: '🇩🇰' },
    { name: 'Poland', country: 'Poland', countryShortName: 'POL', countryFlag: '🇵🇱' },
    { name: 'Serbia', country: 'Serbia', countryShortName: 'SRB', countryFlag: '🇷🇸' },
    { name: 'Austria', country: 'Austria', countryShortName: 'AUT', countryFlag: '🇦🇹' },
    { name: 'Turkey', country: 'Turkey', countryShortName: 'TUR', countryFlag: '🇹🇷' },
  ];

  const shuffledTeams = [...teamSeedData].sort(() => Math.random() - 0.5).slice(0, 16);

  const teams = await prisma.team.createManyAndReturn({ data: shuffledTeams });

  for (const team of teams) {
    await prisma.player.createMany({
      data: Array.from({ length: seededPlayersPerTeam }, (_unused, index) => ({
        teamName: team.name,
        firstName: playerFirstNames[(index + team.name.length) % playerFirstNames.length],
        lastName: playerLastNames[(index + team.country.length) % playerLastNames.length],
        shirtNumber: index + 1,
        position: positions[index % positions.length],
      })),
    });
  }

  const orderedRounds = [...fixedRounds].sort((left, right) => left.orderNumber - right.orderNumber);
  const seedStartDate = new Date(Date.UTC(2026, 5, 10, 14, 0, 0));
  let globalMatchIndex = 0;
  const allMatches = [] as Array<{
    roundOrderNumber: number;
    roundName: string;
    homeTeamName: string | null;
    awayTeamName: string | null;
    refereeUsername: string | null;
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
        homeTeamName: homeTeam?.name ?? null,
        awayTeamName: awayTeam?.name ?? null,
        refereeUsername: referee?.username ?? null,
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
