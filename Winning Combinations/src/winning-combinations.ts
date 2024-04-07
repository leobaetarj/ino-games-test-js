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

function isElegibleSymbol(symbol: number): boolean {
  const { payingSymbols } = config;
  const isPayingSymbols = payingSymbols.includes(symbol)
  const isWildSymbol = symbol === config.wildSymbol

  return !isWildSymbol && isPayingSymbols
}

function buildAllWildWinningCombinationsResult(columnsCount: number): WinningCombinationsResult {
  const { wildSymbol } = config;
  return [[wildSymbol, Array.from({length: columnsCount}, (_, i) => i)]];
}

function replaceWildToSymbolInLine(lineSymbols: number[], symbol: number): number[] {
  const { wildSymbol } = config;
  return lineSymbols.map((symbolToReplace) => {
    if (symbolToReplace !== wildSymbol) {
      return symbolToReplace;
    }
    return symbol;
  });
}

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

function findPaylinePositions(sequences: number[][]): number[] | undefined {
  const { minSequenceLength } = config;
  return sequences.find((sequence: number[]) => sequence.length >= minSequenceLength);
}

function validateSymbols(symbols: number[]) {
  const { wildSymbol, payingSymbols, nonPayingSymbols } = config;
  const allSymbols = [wildSymbol, ...payingSymbols, ...nonPayingSymbols];

  if (!symbols.every(symbol => allSymbols.includes(symbol))) {
    throw new InvalidSymbolError('Error: line contains an invalid symbol');
  }

  return true;
}

function call(line: number[]): WinningCombinationsResult {
  const uniqueSymbols = [...new Set(line)];

  validateSymbols(uniqueSymbols);

  const { wildSymbol } = config;
  
  const isOnlyWildSymbol = uniqueSymbols.length === 1 && uniqueSymbols[0] === wildSymbol;
  if (isOnlyWildSymbol) {
    return buildAllWildWinningCombinationsResult(line.length);
  }

  let winningCombinationsResult: WinningCombinationsResult = [];
  uniqueSymbols.forEach((symbol) => {
    if (!isElegibleSymbol(symbol)) {
      return false;
    }

    const lineWithReplacedWilds = replaceWildToSymbolInLine(line, symbol);
    const symbolSequences = buildSymbolSequences(lineWithReplacedWilds, symbol);

    const paylinePositions = findPaylinePositions(symbolSequences);
    if(paylinePositions) {
      winningCombinationsResult.push([symbol, paylinePositions])
    }
  });

  return winningCombinationsResult;
}

export const WinningCombinations = { call };
