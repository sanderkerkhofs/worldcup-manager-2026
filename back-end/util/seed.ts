import { prisma } from '../repository/prisma/client';
import { hashPassword } from './password';

async function main() {
	await prisma.match.deleteMany();
	await prisma.round.deleteMany();
	await prisma.tournamentTeam.deleteMany();
	await prisma.tournament.deleteMany();
	await prisma.team.deleteMany();
	await prisma.user.deleteMany();

	const [adminHash, organizerHash, viewerHash, refereeHash] = await Promise.all([
		hashPassword('admin123'),
		hashPassword('greetjej123'),
		hashPassword('elkes123'),
		hashPassword('referee123'),
	]);

	await prisma.user.createMany({
		data: [
			// Keep these required users unchanged.
			{ username: 'admin', passwordHash: adminHash, role: 'ADMIN' },
			{ username: 'greetjej', passwordHash: organizerHash, role: 'ORGANIZER' },
			{ username: 'elkes', passwordHash: viewerHash, role: 'VIEWER' },
			{ username: 'johanp', passwordHash: viewerHash, role: 'VIEWER' },
			// Additional referees for assignment-based authorization checks.
			{ username: 'referee1', passwordHash: refereeHash, role: 'REFEREE' },
			{ username: 'referee2', passwordHash: refereeHash, role: 'REFEREE' },
			{ username: 'referee3', passwordHash: refereeHash, role: 'REFEREE' },
			{ username: 'referee4', passwordHash: refereeHash, role: 'REFEREE' },
			{ username: 'referee5', passwordHash: refereeHash, role: 'REFEREE' },
			{ username: 'referee6', passwordHash: refereeHash, role: 'REFEREE' },
		],
	});

	const referees = await prisma.user.findMany({
		where: { role: 'REFEREE' },
		orderBy: { username: 'asc' },
	});

	const teams = await prisma.team.createManyAndReturn({
		data: [
			{ name: 'Argentina', country: 'Argentina', coach: 'Star: Lionel Messi' },
			{ name: 'Brazil', country: 'Brazil', coach: 'Star: Vinicius Junior' },
			{ name: 'France', country: 'France', coach: 'Star: Kylian Mbappe' },
			{ name: 'Germany', country: 'Germany', coach: 'Star: Jamal Musiala' },
			{ name: 'Spain', country: 'Spain', coach: 'Star: Rodri' },
			{ name: 'England', country: 'England', coach: 'Star: Harry Kane' },
			{ name: 'Netherlands', country: 'Netherlands', coach: 'Star: Virgil van Dijk' },
			{ name: 'Portugal', country: 'Portugal', coach: 'Star: Cristiano Ronaldo' },
			{ name: 'Belgium', country: 'Belgium', coach: 'Star: Kevin De Bruyne' },
			{ name: 'Italy', country: 'Italy', coach: 'Star: Gianluigi Donnarumma' },
			{ name: 'Croatia', country: 'Croatia', coach: 'Star: Luka Modric' },
			{ name: 'Uruguay', country: 'Uruguay', coach: 'Star: Federico Valverde' },
			{ name: 'Colombia', country: 'Colombia', coach: 'Star: Luis Diaz' },
			{ name: 'United States', country: 'United States', coach: 'Star: Christian Pulisic' },
			{ name: 'Mexico', country: 'Mexico', coach: 'Star: Santiago Gimenez' },
			{ name: 'Canada', country: 'Canada', coach: 'Star: Alphonso Davies' },
			{ name: 'Japan', country: 'Japan', coach: 'Star: Takefusa Kubo' },
			{ name: 'South Korea', country: 'South Korea', coach: 'Star: Son Heung-min' },
			{ name: 'Australia', country: 'Australia', coach: 'Star: Mathew Leckie' },
			{ name: 'Morocco', country: 'Morocco', coach: 'Star: Achraf Hakimi' },
			{ name: 'Senegal', country: 'Senegal', coach: 'Star: Sadio Mane' },
			{ name: 'Nigeria', country: 'Nigeria', coach: 'Star: Victor Osimhen' },
			{ name: 'Egypt', country: 'Egypt', coach: 'Star: Mohamed Salah' },
			{ name: 'Cameroon', country: 'Cameroon', coach: 'Star: Andre Onana' },
			{ name: 'Ghana', country: 'Ghana', coach: 'Star: Mohammed Kudus' },
			{ name: 'Algeria', country: 'Algeria', coach: 'Star: Riyad Mahrez' },
			{ name: 'Switzerland', country: 'Switzerland', coach: 'Star: Granit Xhaka' },
			{ name: 'Denmark', country: 'Denmark', coach: 'Star: Christian Eriksen' },
			{ name: 'Poland', country: 'Poland', coach: 'Star: Robert Lewandowski' },
			{ name: 'Serbia', country: 'Serbia', coach: 'Star: Aleksandar Mitrovic' },
			{ name: 'Austria', country: 'Austria', coach: 'Star: David Alaba' },
			{ name: 'Turkey', country: 'Turkey', coach: 'Star: Hakan Calhanoglu' },
		],
	});

	const tournament = await prisma.tournament.create({
		data: {
			name: 'worldcup-manager-2026',
			year: 2026,
			format: 'Knockout',
		},
	});

	const rounds = await prisma.round.createManyAndReturn({
		data: [
			{ tournamentId: tournament.id, name: '16th Final', orderNumber: 1 },
			{ tournamentId: tournament.id, name: 'Round of 16', orderNumber: 2 },
			{ tournamentId: tournament.id, name: 'Quarterfinals', orderNumber: 3 },
			{ tournamentId: tournament.id, name: 'Semifinals', orderNumber: 4 },
			{ tournamentId: tournament.id, name: 'Final', orderNumber: 5 },
		],
	});

	await prisma.tournamentTeam.createMany({
		data: teams.map((team) => ({
			tournamentId: tournament.id,
			teamId: team.id,
		})),
	});

	const sixteenthFinalRound = rounds.find((round) => round.name === '16th Final');
	if (!sixteenthFinalRound) {
		throw new Error('16th Final round is missing from seed setup.');
	}

	const seededMatches = Array.from({ length: 16 }, (_unused, index) => {
		const homeTeam = teams[index * 2];
		const awayTeam = teams[index * 2 + 1];
		const referee = referees[index % referees.length];
		const isCompleted = index < 4;
		const matchDay = 10 + Math.floor(index / 2);
		const matchHour = index % 2 === 0 ? 14 : 18;

		return {
			tournamentId: tournament.id,
			roundId: sixteenthFinalRound.id,
			homeTeamId: homeTeam.id,
			awayTeamId: awayTeam.id,
			refereeId: referee?.id,
			matchDate: new Date(Date.UTC(2026, 5, matchDay, matchHour, 0, 0)),
			status: isCompleted ? 'COMPLETED' : 'SCHEDULED',
			homeScore: isCompleted ? 2 : null,
			awayScore: isCompleted ? 1 : null,
		};
	});

	await prisma.match.createMany({ data: seededMatches });

	console.log('Database seeded with worldcup-manager-2026, 32 teams, 16th Final matches, and multiple referees.');
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
