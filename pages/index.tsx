import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useMemo, useState } from "react";
import { check, DEFAULT_BOARD } from "../lib/checker";
import styles from "../styles/Home.module.css";

interface CellProps {
  index: number;
  board: number[];
  symbol: string;
  go: (move: string) => void;
}

function Cell({ index, board, symbol, go }: CellProps) {
  const leftSymbol = symbol + "L";
  const rightSymbol = symbol + "R";
  const leftReport = useMemo(
    () => check([leftSymbol], board),
    [board, leftSymbol]
  );
  const rightReport = useMemo(
    () => check([rightSymbol], board),
    [board, rightSymbol]
  );

  const cellScore = board[index];

  const onLeftClick = () => {
    if (cellScore) {
      go(leftSymbol);
    }
  };
  const onRightClick = () => {
    if (cellScore) {
      go(rightSymbol);
    }
  };

  return (
    <div className={styles.cell}>
      <div className={styles.cellHead} onClick={onLeftClick}>
        L {leftReport.totalDistance}km {leftReport.totalScore}pts
      </div>
      <div>
        <div>{symbol}</div>
        <div>{cellScore}</div>
      </div>
      <div className={styles.cellHead} onClick={onRightClick}>
        R {rightReport.totalDistance}km {rightReport.totalScore}pts
      </div>
    </div>
  );
}

const Home: NextPage = () => {
  const [moves, setMoves] = useState<string[]>([]);

  const report = useMemo(() => check(moves, DEFAULT_BOARD), [moves]);

  const currentBoard = useMemo(
    () =>
      report.moves?.length
        ? report.moves[report.moves.length - 1].board
        : DEFAULT_BOARD,
    [report]
  );

  const addMove = (move: string) => {
    setMoves((prevMoves) => [...prevMoves, move]);
  };

  const onReset = () => {
    setMoves([]);
  };

  const onDelete = () => {
    setMoves((prevMoves) => prevMoves.slice().splice(-1));
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="#">Challenge 6 - O An Quan</a>
        </h1>

        <div>Moves: {moves.join(" ")}</div>
        <div>Total distance: {report.totalDistance}</div>
        <div>Total scores: {report.totalScore}</div>
        <div>
          <button onClick={onReset}>Reset</button>
          <button onClick={onDelete}>Delete last move</button>
        </div>

        <div className={styles.board}>
          <div className={styles.king}>{currentBoard[0]}</div>
          <div>
            <div className={styles.row}>
              <Cell index={1} symbol="A1" board={currentBoard} go={addMove} />
              <Cell index={2} symbol="A2" board={currentBoard} go={addMove} />
              <Cell index={3} symbol="A3" board={currentBoard} go={addMove} />
              <Cell index={4} symbol="A4" board={currentBoard} go={addMove} />
              <Cell index={5} symbol="A5" board={currentBoard} go={addMove} />
            </div>
            <div className={styles.row}>
              <Cell index={7} symbol="B5" board={currentBoard} go={addMove} />
              <Cell index={8} symbol="B4" board={currentBoard} go={addMove} />
              <Cell index={9} symbol="B3" board={currentBoard} go={addMove} />
              <Cell index={10} symbol="B2" board={currentBoard} go={addMove} />
              <Cell index={11} symbol="B1" board={currentBoard} go={addMove} />
            </div>
          </div>
          <div className={styles.king}>{currentBoard[6]}</div>
        </div>
      </main>
      <footer className={styles.footer}>Made by Nhan (teaam 047) with 🧡</footer>
    </div>
  );
};

export default Home;
