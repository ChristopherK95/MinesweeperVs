import React, { useContext, useState } from "react";
import GameContext, { Event } from "../GameContext";
import "../Styles/EventLog.css";

export function EventLog({ tileRef, events }) {
  const [highlightedTile, setHighlightedTile] = useState<number>(0);
  const { tileAmount } = useContext(GameContext);

  function highlightTile(pos: { x: number; y: number } | string) {
    if (typeof pos === "string") return;
    const nr = pos.x + pos.y * tileAmount;
    setHighlightedTile(nr);
    tileRef.current.childNodes[nr].className += " highlight";
  }

  function highlightOff() {
    tileRef.current.childNodes[highlightedTile].className =
      tileRef.current.childNodes[highlightedTile].className.split(" ")[0];
  }

  return (
    <div className="EventLog">
      <div className="Top">
        <h2>Event Log</h2>
      </div>
      <div className="Events">
        <ol reversed>
          {events &&
            events.map((event: Event, index: number) =>
              event.info !== undefined ? (
                <li
                  onMouseEnter={() =>
                    highlightTile(
                      event.info !== undefined
                        ? event.info.position
                        : event.text!
                    )
                  }
                  onMouseLeave={highlightOff}
                  key={index}
                >
                  <span className="Name">{event.user}</span>
                  <span className="X">X: {event.info.position.x}</span>
                  <span className="Y">Y: {event.info.position.y}</span>
                  <span className="Score">Score: {event.info.score}</span>
                </li>
              ) : (
                <li
                  onMouseEnter={() =>
                    highlightTile(
                      event.info !== undefined
                        ? event.info.position
                        : event.text!
                    )
                  }
                  onMouseLeave={highlightOff}
                  key={index}
                >
                  <span className="Name">{event.user}</span>
                  <span className="X">{event.text}</span>
                </li>
              )
            )}
        </ol>
      </div>
    </div>
  );
}
