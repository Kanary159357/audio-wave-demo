import "./app.css";
import { useEffect, useRef, useState } from "preact/hooks";
import AudioPlayer from "./AudioPlayer/AudioPlayer";

export function App() {
  const [state, setState] = useState<Response>();
  useEffect(() => {
    async function temp() {
      const body = await fetch("./assets/music.mp3");
      setState(body);
    }
    temp();
  });

  return <>{state && <AudioPlayer body={state} />}</>;
}
