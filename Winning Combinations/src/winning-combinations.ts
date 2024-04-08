export class InvalidSymbolError extends Error {}

type WinningCombinationsResult = [number, number[]][];

type WinningCombinationConfig = {
  minSequenceLength: number;
  wildSymbol: number;
  payingSymbols: Array<number>;
  nonPayingSymbols: number[];
};

const config: WinningCombinationConfig = {
  minSequenceLength: 3,
  wildSymbol: 0,
  payingSymbols: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  nonPayingSymbols: [10, 11, 12, 13, 14, 15],
};

/**
 * Checks if a symbol is eligible for winning combinations.
 * @param symbol - The symbol to check.
 * @returns True if the symbol is a paying symbol and not a wild symbol, false otherwise.
 */
function isElegibleSymbol(symbol: number): boolean {
  const { payingSymbols } = config;
  const isPayingSymbol = payingSymbols.includes(symbol);
  const isWildSymbol = symbol === config.wildSymbol;

  return !isWildSymbol && isPayingSymbol;
}

/**
 * Builds an array of all possible positions based on the number of columns.
 * @param columnsCount - The number of columns.
 * @returns An array of all possible positions.
 */
function buildAllPositions(columnsCount: number): number[] {
  return Array.from({length: columnsCount}, (_, i) => i);
}

/**
 * Replaces all wild symbols in a line with a specific symbol.
 * @param lineSymbols - The line of symbols.
 * @param symbol - The symbol to replace wild symbols with.
 * @returns The line of symbols with all wild symbols replaced.
 */
function replaceWildToSymbolInLine(lineSymbols: number[], symbol: number): number[] {
  const { wildSymbol } = config;
  return lineSymbols.map((symbolToReplace) => {
    if (symbolToReplace !== wildSymbol) {
      return symbolToReplace;
    }
    return symbol;
  });
}

/**
 * Finds the positions of a payline in a list of sequences.
 * @param sequences - The list of sequences.
 * @returns The positions of the payline, or undefined if no payline is found.
 */
function findPaylinePositions(sequences: number[][]): number[] | undefined {
  const { minSequenceLength } = config;
  return sequences.find((sequence: number[]) => sequence.length >= minSequenceLength);
}

/**
 * Builds sequences of a specific symbol in a line.
 * @param line - The line of symbols.
 * @param symbol - The symbol to build sequences for.
 * @returns An array of sequences, where each sequence is an array of positions.
 */
function buildSymbolSequences(line: number[], symbol: number): number[][] {
  return line.reduce((acc: number[][], currentSymbol, index) => {
    if (currentSymbol === symbol) {
      if (acc.length === 0 || line[index - 1] !== symbol) {
        acc.push([index]);
      } else {
        acc[acc.length - 1].push(index);
      }
    }
    return acc;
  }, []);
}

/**
 * Gets the positions of a payline for a specific symbol in a line.
 * @param line - The line of symbols.
 * @param symbol - The symbol to get the payline positions for.
 * @returns The positions of the payline, or null if no payline is found.
 */
function getPaylinePositionsBySymbol(line: number[], symbol: number): number[] | null {
  const lineWithReplacedWilds = replaceWildToSymbolInLine(line, symbol);
  const sequencesBySymbol = buildSymbolSequences(lineWithReplacedWilds, symbol);

  return findPaylinePositions(sequencesBySymbol) || null;
}

/**
 * Validates a list of symbols.
 * @param symbols - The list of symbols to validate.
 * @throws InvalidSymbolError if the list contains an invalid symbol.
 * @returns True if all symbols are valid.
 */
function validateSymbols(symbols: number[]) {
  const { wildSymbol, payingSymbols, nonPayingSymbols } = config;
  const allSymbols = [wildSymbol, ...payingSymbols, ...nonPayingSymbols];

  if (!symbols.every(symbol => allSymbols.includes(symbol))) {
    throw new InvalidSymbolError('Error: line contains an invalid symbol');
  }

  return true;
}

/**
 * Calculates the winning combinations for a line of symbols.
 * @param line - The line of symbols.
 * @returns An array of winning combinations, where each combination is a pair of a symbol and an array of positions.
 */
function call(line: number[]): WinningCombinationsResult {
  const uniqueSymbols = [...new Set(line)];

  validateSymbols(uniqueSymbols);

  const isOnlyWildSymbol = uniqueSymbols.length === 1 && uniqueSymbols[0] === config.wildSymbol;
  if (isOnlyWildSymbol) {
    const paylinePositions = buildAllPositions(line.length);
    return [[config.wildSymbol, paylinePositions]];
  }

  let winningCombinationsResult: WinningCombinationsResult = [];
  uniqueSymbols.forEach((symbol) => {
    if (!isElegibleSymbol(symbol)) {
      return false;
    }

    const paylinePositions = getPaylinePositionsBySymbol(line, symbol);
    if(paylinePositions) {
      winningCombinationsResult.push([symbol, paylinePositions])
    }
  });

  return winningCombinationsResult;
}

export const WinningCombinations = { call };
