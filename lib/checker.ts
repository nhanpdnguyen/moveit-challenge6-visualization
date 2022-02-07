export function doCheckMoves(moveCode: string) {
  const moves = moveCode.split(/\s+/);

  const report = check(moves);
  printReport(report);
}

export const DEFAULT_BOARD = [10, 5, 5, 5, 5, 5, 10, 5, 5, 5, 5, 5];

export function check(moves: string[], input = DEFAULT_BOARD) {
  const BOARD = [...input];
  let totalDistance = 0;
  let totalScore = 0;
  let error = null;
  const allMoves = [];
  let lastMove = null;

  const supplementSpawns = (location) => {
    let supplemented = true;

    const range = location.startsWith("A")
      ? [1, 2, 3, 4, 5]
      : [7, 8, 9, 10, 11];

    for (const i of range) {
      if (BOARD[i] != 0) {
        supplemented = false;
        break;
      }
      BOARD[i] = 1; // supplement 1 spawn for one cell
    }

    return supplemented;
  };

  const isGameEnded = () => {
    // the game is ended if two MARSHAL cells are empty
    if (BOARD[0] == 0 && BOARD[6] == 0) {
      return true;
    }

    return false;
  };

  const moveFrom = (location, subMoves) => {
    if (isGameEnded()) {
      throw "Game is ended!";
    }

    let index = getBoardIndex(location);
    let spawns = BOARD[index];
    let score = 0;
    if (spawns == 0) {
      // check if possible to supplement spawns
      if (!supplementSpawns(location)) {
        throw "Start on an empty cell: " + location.substring(0, 2);
      }
      score = -5; // supplemented 5 spawns
      spawns = BOARD[index];
    }

    let direction = location.endsWith("R") ? 1 : -1;
    if (location.startsWith("B")) {
      // revert direction
      direction = -direction;
    }

    BOARD[index] = 0;
    index = nextIndex(index, direction);
    for (let i = 1; i <= spawns; i++) {
      BOARD[index] = BOARD[index] + 1;
      index = nextIndex(index, direction);
    }

    // Next cell is MARSHAL => end with score
    if (index % 6 == 0) {
      subMoves.push({
        location,
        distance: spawns,
        score,
        board: [...BOARD],
      });
      return;
    }

    // Next cell is empty => stop with score += BOARD[nextIndex]
    if (BOARD[index] == 0) {
      while (BOARD[index] == 0) {
        const earningIndex = nextIndex(index, direction);
        if (BOARD[earningIndex] == 0) {
          break;
        }

        score += BOARD[earningIndex];
        BOARD[earningIndex] = 0;

        index = nextIndex(earningIndex, direction);
      }

      subMoves.push({
        location,
        distance: spawns,
        score,
        board: [...BOARD],
      });
      return;
    }

    subMoves.push({
      location,
      distance: spawns,
      score,
      board: [...BOARD],
    });

    // Next cell is SPAWN, continue moving
    const nextLocation = getNextLocation(index, location);
    moveFrom(nextLocation, subMoves);
  };

  for (const location of moves) {
    if (lastMove && lastMove.startsWith("A") == location.startsWith("A")) {
      error = "Wrong moving side, last side is " + lastMove.charAt(0);
      break;
    }

    const subMoves = [];

    try {
      moveFrom(location, subMoves);
    } catch (e) {
      error = e.message || e;
      break;
    }

    const lastBoard = subMoves.length
      ? subMoves[subMoves.length - 1].board
      : [];
    let distance = 0;
    let score = 0;

    for (const subMove of subMoves) {
      distance += subMove.distance;
      score += subMove.score;
    }

    allMoves.push({
      location,
      distance,
      score,
      board: lastBoard,
    });
    totalDistance += distance;
    totalScore += score;

    lastMove = location;
  }

  return {
    totalDistance,
    totalScore,
    moves: allMoves,
    error,
    gameEnded: isGameEnded(),
  };
}

export function getBoardIndex(location) {
  if (!location.match(/[AB][12345][LR]/g)) {
    throw "Invalid location: " + location;
  }

  const cellIndex = parseInt(location.substring(1, 2));
  return location.startsWith("A") ? cellIndex : cellIndex + 6;
}

export function getNextLocation(boardIndex, currentLocation) {
  if (boardIndex % 6 == 0) {
    throw "This is the MARSHAL cell.";
  }

  let nextLocation;
  if (boardIndex <= 5) {
    // 1-5 => A1-A5
    nextLocation = "A" + boardIndex;
  } else {
    // 7-11 => B1-B5
    nextLocation = "B" + (boardIndex - 6);
  }

  // revert direction if next moving side is different with current moving side
  if (nextLocation.startsWith("A") != currentLocation.startsWith("A")) {
    nextLocation += currentLocation.endsWith("R") ? "L" : "R";
  } else {
    nextLocation += currentLocation.charAt(2);
  }

  return nextLocation;
}

export function nextIndex(index, increase) {
  index = index + increase;

  if (index < 0) {
    index = 11;
  }

  if (index >= 12) {
    index = 0;
  }

  return index;
}

export function printReport(report) {
  const spacePad = (number) => String(number).padStart(3, " ");

  // print initial board
  console.log("Initial board");
  console.log(printBoard([10, 5, 5, 5, 5, 5, 10, 5, 5, 5, 5, 5]));

  let text = "Set\t\tTurn\tStravaID\t\tMove\tKM\t\tScore\tActivityID\r\n";

  let turn = 1;
  report.moves.forEach((move) => {
    text += `${spacePad(1)}\t\t${spacePad(turn)}\t\t00000000\t\t${
      move.location
    }\t\t${move.distance}\t\t${move.score}\t\t00000000\r\n`;

    console.log(
      `Move #${turn}: ${move.location} (KM: ${move.distance}, score: ${move.score})`
    );
    console.log(printBoard(move.board));

    turn++;
  });

  text += "\r\n";
  if (report.error) {
    text += `[ERROR] ${report.error}\r\n`;
  }

  text += `Total KM: ${report.totalDistance}. Total score: ${
    report.totalScore
  }. Ended: ${report.gameEnded ? "yes" : "no"}\r\n`;
  document.getElementById("display").innerText = text;
}

export function printBoard(board) {
  if (!board || !board.length) {
    return "Invalid board";
  }

  const spacePad = (number) => String(number).padStart(2, " ");
  let output = "";

  output += "          A1     A2     A3     A4     A5          \r\n";
  output += "+------+------+------+------+------+------+------+\r\n";

  output += "|      |";
  for (let i = 1; i <= 5; i++) {
    output += `  ${spacePad(board[i])}  |`;
  }
  output += "      |\r\n";

  output += `|  ${spacePad(board[0])}  |`;
  output += "------+------+------+------+------";
  output += `  ${spacePad(board[6])}   |\r\n`;

  output += "|      |";
  for (let i = 11; i >= 7; i--) {
    output += `  ${spacePad(board[i])}  |`;
  }
  output += "      |\r\n";

  output += "+------+------+------+------+------+------+------+\r\n";
  output += "          B5     B4     B3     B2     B1          \r\n";

  return output;
}
