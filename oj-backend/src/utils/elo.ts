export function calculateNewRating(winnerRating: number, loserRating: number, winnerGames: number, loserGames: number): { winnerNew: number; loserNew: number } {
    const winnerK = winnerGames < 30 ? 32 : 16;
    const loserK = loserGames < 30 ? 32 : 16;

    const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    const expectedLoser = 1 - expectedWinner;

    const winnerNew = Math.round(winnerRating + winnerK * (1 - expectedWinner));
    const loserNew = Math.round(loserRating + loserK * (0 - expectedLoser));

    return { winnerNew, loserNew };
}