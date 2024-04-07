type AnticipatorConfig = {
  columnSize: number;
  minToAnticipate: number;
  maxToAnticipate: number;
  anticipateCadence: number;
  defaultCadence: number;
};

type SlotCoordinate = {
  column: number;
  row: number;
};

type SpecialSymbol = { specialSymbols: Array<SlotCoordinate> };

type RoundsSymbols = {
  roundOne: SpecialSymbol;
  roundTwo: SpecialSymbol;
  roundThree: SpecialSymbol;
};

type SlotCadence = Array<number>;

type RoundsCadences = {
  roundOne: SlotCadence;
  roundTwo: SlotCadence;
  roundThree: SlotCadence;
};

/**
 * Anticipator configuration. Has all information needed to check anticipator.
 * @param columnSize It's the number of columns the slot machine has.
 * @param minToAnticipate It's the minimum number of symbols to start anticipation.
 * @param maxToAnticipate It's the maximum number of symbols to end anticipation.
 * @param anticipateCadence It's the cadence value when has anticipation.
 * @param defaultCadence It's the cadence value when don't has anticipation.
 */
const anticipatorConfig: AnticipatorConfig = {
  columnSize: 5,
  minToAnticipate: 2,
  maxToAnticipate: 3,
  anticipateCadence: 2,
  defaultCadence: 0.25,
};

/**
 * Game rounds with special symbols position that must be used to generate the SlotCadences.
 */
const gameRounds: RoundsSymbols = {
  roundOne: {
    specialSymbols: [
      { column: 0, row: 2 },
      { column: 1, row: 3 },
      { column: 3, row: 4 },
    ],
  },
  roundTwo: {
    specialSymbols: [
      { column: 0, row: 2 },
      { column: 0, row: 3 },
    ],
  },
  roundThree: {
    specialSymbols: [
      { column: 4, row: 2 },
      { column: 4, row: 3 },
    ],
  },
};

/**
 * This must be used to get all game rounds cadences.
 */
const slotMachineCadences: RoundsCadences = { roundOne: [], roundTwo: [], roundThree: [] };

/**
 * Executes a provided function for each index in a column.
 * 
 * @param callback - A callback function that takes an index as a parameter.
 */
function forEachColumnIndex(callback: { (index: number): void }) {
  Array.from({ length: anticipatorConfig.columnSize }).forEach((_, index) => callback(index));
}

/**
 * Calculates the cumulative symbol counts per column.
 * 
 * @param symbols - An array of SlotCoordinate objects representing the symbols.
 * 
 * @returns An array of numbers representing the cumulative symbol counts per column.
 */
function calculateCumulativeSymbolCountsPerColumn(symbols: Array<SlotCoordinate>): Array<number> {
  let totalCount: number = 0;
  let symbolsAccumulatorPerColumn: Array<number> = []
  
  forEachColumnIndex((index) => {
    const symbolsColumnCount = symbols.filter((symbol) => symbol.column === index).length;
    totalCount += symbolsColumnCount;
    symbolsAccumulatorPerColumn.push(totalCount);
  });

  return symbolsAccumulatorPerColumn;
}

/**
 * Calculates the cadence based on the previous cadence and the previous symbols count.
 * 
 * @param previousCadence - The previous cadence value. It can be null.
 * @param previousSymbolsCount - The count of symbols from the previous calculation. It can be null.
 * 
 * @returns The calculated cadence.
 */
function calculateCadence(previousCadence: number | null, previousSymbolsCount: number | null): number {
  if (previousCadence === null) {
    return 0;
  }

  const isAnticipating = previousSymbolsCount && previousSymbolsCount >= anticipatorConfig.minToAnticipate && previousSymbolsCount < anticipatorConfig.maxToAnticipate;
  if (isAnticipating) {
    return previousCadence + anticipatorConfig.anticipateCadence
  }
  
  return previousCadence + anticipatorConfig.defaultCadence
}

/**
 * This function receives an array of coordinates relative to positions in the slot machine's matrix.
 * This array is the positions of the special symbols.
 * And it has to return a slot machine stop cadence.
 * @param symbols Array<SlotCoordinate> positions of the special symbols. Example: [{ column: 0, row: 2 }, { column: 2, row: 3 }]
 * @returns SlotCadence Array of numbers representing the slot machine stop cadence.
 */
function calculateSlotCadence(symbols: Array<SlotCoordinate>): SlotCadence {
  let previousCadence: number | null = null;
  let slotCadence: Array<number> = []; 
 
  const symbolsAccumulatorPerColumn: Array<number> = calculateCumulativeSymbolCountsPerColumn(symbols);
  forEachColumnIndex((index) => {
    const previousSymbolsCount = symbolsAccumulatorPerColumn[index - 1] || null
    const currentCadence = calculateCadence(previousCadence, previousSymbolsCount);

    slotCadence.push(currentCadence);
    previousCadence = currentCadence;
  });

  return slotCadence;
}

/**
 * Get all game rounds and return the final cadences of each.
 * @param rounds RoundsSymbols with contains all rounds special symbols positions.
 * @return RoundsCadences has all cadences for each game round.
 */
function handleCadences(rounds: RoundsSymbols): RoundsCadences {
  slotMachineCadences.roundOne = calculateSlotCadence(rounds.roundOne.specialSymbols);
  slotMachineCadences.roundTwo = calculateSlotCadence(rounds.roundTwo.specialSymbols);
  slotMachineCadences.roundThree = calculateSlotCadence(rounds.roundThree.specialSymbols);

  return slotMachineCadences;
}

console.log('CADENCES: ', handleCadences(gameRounds));
