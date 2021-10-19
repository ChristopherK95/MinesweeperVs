import { useContext, useEffect, useRef, useState } from "react";
import GameContext from "../GameContext";
import "../Styles/Timer.css";

export function Timer({ time, newTurn, gameIsPrepped }) {
  const { roundTimeSetting } = useContext(GameContext);
  const timerElement = useRef<any>();
  const remainderElement = useRef<any>();
  const [remainder, setRemainder] = useState({
    transition: "none",
    height: "100%",
  });

  const timerAnimation = {
    animationDuration: `${roundTimeSetting}s`,
    animationTimingFunction: "linear",
    animationName: "countDown",
    animationPlayState: `${gameIsPrepped ? "running" : "paused"}`,
  };

  const resetTimer = {
    height: "100%",
  };

  const [timerFx, setTimerFx] = useState<any>(resetTimer);

  // useEffect(() => {
  //   setRemainder({ transition: "none", height: "100%" });
  //   setTimeout(() => {
  //     setRemainder({
  //       transition: `height ${roundTimeSetting}s linear`,
  //       height: "0px",
  //     });
  //   }, 500);
  // }, [newTurn]);

  // useEffect(() => {
  //   console.log(gameIsPrepped);
  //   if (gameIsPrepped) return;
  //   setTimeout(() => {
  //     setRemainder({
  //       transition: "none",
  //       height: "100%",
  //     });
  //   }, 500);
  // }, [gameIsPrepped]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     setRemainder({
  //       transition: "none",
  //       height: "100%",
  //     });
  //   }, 500);
  // }, []);

  useEffect(() => {
    setTimerFx(resetTimer);
    setTimeout(() => {
      setTimerFx(timerAnimation);
    }, 300);
  }, [newTurn, gameIsPrepped]);

  // useEffect(() => {
  //   setTimerFx(timerAnimation);
  // }, [gameIsPrepped]);

  return (
    <div className="Timer" ref={timerElement}>
      <div style={timerFx} className={`Remainder`} ref={remainderElement}></div>
      <div className="Time">{time}s</div>
    </div>
  );
}
