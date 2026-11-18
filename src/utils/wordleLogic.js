import { evaluateWordJamo, isWinningGuess } from './jamo';

export { evaluateWordJamo, isWinningGuess };

/**
 * Generates share text with emoji grid based on Jamo evaluations
 */
export function generateShareText(evaluationsHistory, targetWord, gameInfo) {
  const emojis = evaluationsHistory.map(rowEvals => {
    return rowEvals.map(syl => {
      if (syl.allCorrect) return '🟩';
      if (syl.someCorrect || syl.somePresent) return '🟨';
      return '⬛';
    }).join('');
  }).join('\n');

  const lastRow = evaluationsHistory[evaluationsHistory.length - 1];
  const won = lastRow && isWinningGuess(lastRow);
  const attempts = won ? `${evaluationsHistory.length}/6` : 'X/6';
  const label = gameInfo?.isDaily ? `트릭컬 워들 #${gameInfo.gameNumber}` : '트릭컬 워들 연습';

  return `${label} ${attempts}\n\n${emojis}\n\n자모 분해 트릭컬 워들 플레이하기`;
}
