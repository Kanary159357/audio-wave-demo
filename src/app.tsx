import "./app.css";
import { useEffect, useState } from "preact/hooks";
import AudioPlayer from "./AudioPlayer/AudioPlayer";

export function App() {
  const [state, setState] = useState<Response>();
  useEffect(() => {
    async function fetchAudio() {
      const body = await fetch("./assets/music.mp3");
      setState(body);
    }
    fetchAudio();
  }, []);

  return <>{state && <AudioPlayer body={state} />}</>;
}
