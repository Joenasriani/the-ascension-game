import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { GAME_LEVELS } from "./game/levels";
import {
  initialState,
  transition,
  canWalk,
  position,
  solve,
  type Snapshot,
  type Action,
} from "./game/engine";
import { readProgress, saveProgress, type Progress } from "./game/storage";
import { REFLECTIONS } from "./game/reflections";
import {
  playAction,
  setSound,
  toggleMusic,
  pauseMusic,
} from "./services/audioService";
import type { Motion } from "./components/GameScene";
import "./styles.css";
const GameScene = lazy(() => import("./components/GameScene"));
class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="fallback">
        <p>The 3D view could not start.</p>
        <p>You can still play with the action controls below.</p>
      </div>
    ) : (
      this.props.children
    );
  }
}
const roman = ["I", "II", "III", "IV"];
export default function App() {
  const [progress, setProgress] = useState<Progress>(() =>
    readProgress(GAME_LEVELS.length),
  );
  const [index, setIndex] = useState(
    () => readProgress(GAME_LEVELS.length).unlocked,
  );
  const level = GAME_LEVELS[index];
  const [screen, setScreen] = useState<"home" | "play" | "win" | "ending">(
    "home",
  );
  const [snapshot, setSnapshot] = useState<Snapshot>(() => initialState(level));
  const [history, setHistory] = useState<Snapshot[]>([]),
    [selected, setSelected] = useState(level.startBlockId);
  const [motion, setMotion] = useState<Motion | null>(null),
    [panel, setPanel] = useState<"levels" | "settings" | "help" | null>(null);
  const [notice, setNotice] = useState(
    "Choose a surface to walk. The handles can be operated from anywhere.",
  );
  const [hint, setHint] = useState(0),
    [sound, setSoundState] = useState(true),
    [music, setMusic] = useState(false);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [quality, setQuality] = useState<"low" | "medium" | "high">(
    window.innerWidth < 600 ? "low" : "medium",
  );
  const pending = useRef<Motion | null>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    focus = useRef<HTMLHeadingElement>(null);
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    pending.current = null;
    setMotion(null);
  };
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      pauseMusic();
    },
    [],
  );
  useEffect(() => {
    setSound(sound);
  }, [sound]);
  useEffect(() => {
    focus.current?.focus();
  }, [screen, index, panel]);
  const finish = useCallback(() => {
    const m = pending.current;
    if (!m) return;
    pending.current = null;
    if (timer.current) clearTimeout(timer.current);
    setSnapshot(m.to);
    setMotion(null);
    if (m.to.player === level.endBlockId) {
      setScreen("win");
      playAction("win");
      setProgress((prev) => {
        const next = {
          unlocked: Math.max(
            prev.unlocked,
            Math.min(index + 1, GAME_LEVELS.length - 1),
          ),
          completed: [...new Set([...prev.completed, index])],
          best: {
            ...prev.best,
            [index]: Math.min(prev.best[index] ?? Infinity, m.to.moves),
          },
        };
        if (!saveProgress(next))
          setNotice("Progress could not be saved on this device.");
        return next;
      });
    } else
      setNotice(
        m.action.type === "view"
          ? `Frame ${roman[m.to.view]}. Look for a shared silhouette.`
          : m.action.type === "operate"
            ? "Mechanism settled. The next step is yours."
            : `Standing on ${m.to.player}.`,
      );
  }, [index, level]);
  useEffect(() => {
    const hide = () => {
      if (document.hidden) {
        finish();
        pauseMusic();
        setMusic(false);
      }
    };
    document.addEventListener("visibilitychange", hide);
    return () => document.removeEventListener("visibilitychange", hide);
  }, [finish]);
  function load(i: number) {
    cancel();
    setIndex(i);
    setSnapshot(initialState(GAME_LEVELS[i]));
    setHistory([]);
    setSelected(GAME_LEVELS[i].startBlockId);
    setHint(0);
    setPanel(null);
    setScreen("play");
    setNotice(GAME_LEVELS[i].hint);
  }
  function act(action: Action) {
    if (pending.current || screen !== "play" || panel) return;
    const next = transition(level, snapshot, action);
    if (!next) {
      playAction("invalid");
      setNotice(
        action.type === "walk"
          ? "That surface is not connected at this height and orientation. Try its handle or a different view."
          : "That surface has no mechanism.",
      );
      return;
    }
    setHistory((h) => [...h, snapshot]);
    const a = position(snapshot.blocks.find((b) => b.id === snapshot.player)!),
      b = position(next.blocks.find((b) => b.id === next.player)!);
    const duration = reduced
      ? 0
      : action.type === "walk"
        ? Math.min(
            1300,
            350 + Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) * 130,
          )
        : action.type === "view"
          ? 550
          : 650;
    const m = {
      from: snapshot,
      to: next,
      action,
      duration: Math.max(1, duration),
      started: performance.now(),
    };
    pending.current = m;
    setMotion(m);
    playAction(action.type, next.moves);
    timer.current = setTimeout(finish, duration + 20);
  }
  function undo() {
    if (pending.current || !history.length) return;
    const prev = history[history.length - 1];
    setSnapshot(prev);
    setHistory((h) => h.slice(0, -1));
    setSelected(prev.player);
    setNotice("Previous arrangement restored.");
  }
  function showHint() {
    const n = Math.min(hint + 1, 3);
    setHint(n);
    if (n === 1) setNotice(level.hints?.[0] ?? level.hint);
    else if (n === 2)
      setNotice(
        level.hints?.[1] ??
          "Bridges turn in quarter turns. Lifts travel two units. A handle works from any platform.",
      );
    else {
      const path = solve(level, snapshot);
      const a = path?.[0];
      setNotice(
        !a
          ? "You are at the destination."
          : a.type === "view"
            ? `Next step: choose Frame ${roman[a.view]}.`
            : a.type === "operate"
              ? `Next step: operate ${a.id}.`
              : `Next step: walk to ${a.id}.`,
      );
    }
  }
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key === "Escape") {
        finish();
        setPanel((p) => (p ? null : "settings"));
        return;
      }
      if (el.closest("button,input,select,a")) return;
      if (screen !== "play" || panel || pending.current) return;
      const blocks = snapshot.blocks.filter((b) => b.type !== "EMPTY");
      const i = blocks.findIndex((b) => b.id === selected);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setSelected(blocks[(i + 1) % blocks.length].id);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelected(blocks[(i - 1 + blocks.length) % blocks.length].id);
      } else if (e.key === "Enter") {
        e.preventDefault();
        act({ type: "walk", id: selected });
      } else if (e.key.toLowerCase() === "e")
        act({ type: "operate", id: selected });
      else if (e.key.toLowerCase() === "z") undo();
      else if (e.key.toLowerCase() === "h") showHint();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });
  const chooseMusic = async () => {
    try {
      const on = await toggleMusic(!music);
      setMusic(on);
      setNotice(on ? "Music playing." : "Music paused.");
    } catch {
      setMusic(false);
      setNotice("Music is unavailable. You can continue playing.");
    }
  };
  const open = (p: typeof panel) => {
    finish();
    setPanel(p);
  };
  return (
    <main className={reduced ? "reduced" : ""}>
      <header inert={!!panel || screen === "win"}>
        <a
          href="https://github.com/Joenasriani/the-ascension-game"
          target="_blank"
          rel="noreferrer"
          className="wordmark"
        >
          A / ASCENSION<span>BY JOE NASR</span>
        </a>
        <nav aria-label="Game">
          <button onClick={() => open("levels")}>
            Chapters{" "}
            <span>
              {progress.completed.length}/{GAME_LEVELS.length}
            </span>
          </button>
          <button onClick={() => open("settings")}>Settings</button>
          <button onClick={() => open("help")} aria-label="How to play">
            ?
          </button>
        </nav>
      </header>
      {screen === "home" ? (
        <section inert={!!panel} className="home">
          <div className="intro">
            <p className="eyebrow">AN ARCHITECTURAL PUZZLE / EDITION 02</p>
            <h1 ref={focus} tabIndex={-1}>
              A change
              <br />
              of <em>perspective.</em>
            </h1>
            <p className="lede">
              Turn a bridge. Find a footing.
              <br />
              See the same world from somewhere new.
            </p>
            <button className="primary" onClick={() => load(progress.unlocked)}>
              {progress.completed.length
                ? "Continue the ascent"
                : "Begin the ascent"}{" "}
              <span>↗</span>
            </button>
            <p className="small">
              26 spaces to discover · Play at your own pace
            </p>
          </div>
          <div className="sculpture" aria-hidden="true">
            <div className="sculpture-step one" />
            <div className="sculpture-step two" />
            <div className="sculpture-step three" />
            <div className="sculpture-door" />
            <span>FORM / MOVEMENT / PERSPECTIVE</span>
          </div>
          <footer>
            <span>Architecture in motion.</span>
            <span>Original music: The Little Hero</span>
          </footer>
        </section>
      ) : screen === "ending" ? (
        <section inert={!!panel} className="ending">
          <p className="eyebrow">THE ASCENT / COMPLETE</p>
          <h1 ref={focus} tabIndex={-1}>
            You found
            <br />
            another way.
          </h1>
          <div
            className="monument"
            aria-label={`${progress.completed.length} completed spaces`}
          >
            {GAME_LEVELS.map((l, i) => (
              <i
                key={l.id}
                style={{ height: 18 + (i % 7) * 9, background: l.theme.path }}
              />
            ))}
          </div>
          <p>
            Twenty-six spaces. Four chapters.
            <br />
            Every turn brought you here.
          </p>
          <p className="credit">
            Created by Joe Nasr · Music restored from this project’s original
            recording.
            <br />
            Reflections are original authored text for this edition.
          </p>
          <button className="primary" onClick={() => open("levels")}>
            Revisit the journey ↗
          </button>
          <a href="https://linktr.ee/joenasr" target="_blank" rel="noreferrer">
            More from Joe Nasr
          </a>
        </section>
      ) : (
        <>
          <section inert={!!panel || screen === "win"} className="game-heading">
            <div>
              <p className="eyebrow">{level.chapter}</p>
              <h1 ref={focus} tabIndex={-1}>
                {String(index + 1).padStart(2, "0")} <em>{level.title}</em>
              </h1>
            </div>
            <div className="metrics">
              <span>{snapshot.moves} moves</span>
              <button
                onClick={undo}
                disabled={!history.length || !!motion || screen !== "play"}
              >
                Undo
              </button>
              <button onClick={() => load(index)}>Restart</button>
            </div>
          </section>
          <section
            inert={!!panel || screen === "win"}
            className="stage"
            aria-label="Architectural game board"
          >
            <SceneBoundary key={index}>
              <Suspense
                fallback={
                  <div className="fallback">Preparing the architecture…</div>
                }
              >
                <GameScene
                  level={level}
                  snapshot={snapshot}
                  motion={motion}
                  selected={selected}
                  onSelect={setSelected}
                  onAction={act}
                  onSettled={finish}
                  reduced={reduced}
                  quality={quality}
                  paused={!!panel}
                />
              </Suspense>
            </SceneBoundary>
            <div className="view-switch" aria-label="Camera frames">
              {roman.map((r, i) => (
                <button
                  key={r}
                  aria-pressed={snapshot.view === i}
                  disabled={!!motion || screen !== "play"}
                  onClick={() => act({ type: "view", view: i })}
                >
                  Frame {r}
                </button>
              ))}
            </div>
          </section>
          <section
            inert={!!panel || screen === "win"}
            className="control-deck"
            aria-label="Accessible board controls"
          >
            <div className="feedback">
              <p role="status" aria-live="polite">
                {motion ? "Architecture in motion…" : notice}
              </p>
              <button
                disabled={!!motion || screen !== "play"}
                onClick={showHint}
              >
                Hint {hint > 0 ? `${hint}/3` : ""}
              </button>
            </div>
            <div className="actions">
              <label>
                Surface
                <select
                  aria-label="Select surface"
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  {snapshot.blocks
                    .filter((b) => b.type !== "EMPTY")
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.id}
                        {b.id === snapshot.player ? " · you are here" : ""}
                        {b.id === level.endBlockId ? " · destination" : ""}
                      </option>
                    ))}
                </select>
              </label>
              <button
                className="primary"
                disabled={
                  !!motion ||
                  screen !== "play" ||
                  !canWalk(level, snapshot, selected)
                }
                onClick={() => act({ type: "walk", id: selected })}
              >
                Walk here <kbd>↵</kbd>
              </button>
              <button
                disabled={
                  !!motion ||
                  screen !== "play" ||
                  (!snapshot.blocks.find((b) => b.id === selected)
                    ?.isRotatable &&
                    !snapshot.blocks.find((b) => b.id === selected)
                      ?.isSlideable)
                }
                onClick={() => act({ type: "operate", id: selected })}
              >
                Operate handle <kbd>E</kbd>
              </button>
              <p className="small">
                Select with arrows · Undo Z · Hint H<br />
                All handles work from any surface.
              </p>
            </div>
          </section>
        </>
      )}
      {screen === "win" && !panel && (
        <div className="veil">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="win-title"
            className="dialog"
            onKeyDown={trapFocus}
          >
            <p className="eyebrow">SPACE {index + 1} / RESOLVED</p>
            <h2 id="win-title" tabIndex={-1} autoFocus>
              One step higher.
            </h2>
            <p className="reflection">{REFLECTIONS[index]}</p>
            <p className="small">
              {snapshot.moves} moves · Best{" "}
              {progress.best[index] ?? snapshot.moves}
            </p>
            <button
              autoFocus
              className="primary"
              onClick={() =>
                index === GAME_LEVELS.length - 1
                  ? setScreen("ending")
                  : load(index + 1)
              }
            >
              {index === GAME_LEVELS.length - 1
                ? "See the completed ascent"
                : "Next space"}{" "}
              ↗
            </button>
            <button onClick={() => load(index)}>Try another route</button>
          </section>
        </div>
      )}
      {panel && (
        <div className="veil">
          <section
            className="dialog wide"
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
            onKeyDown={trapFocus}
          >
            <button
              autoFocus
              className="close"
              onClick={() => setPanel(null)}
              aria-label="Close panel"
            >
              ×
            </button>
            <h2 id="panel-title">
              {panel === "levels"
                ? "The ascent"
                : panel === "help"
                  ? "Find your footing."
                  : "Make yourself comfortable."}
            </h2>
            {panel === "levels" ? (
              <div className="level-list">
                {GAME_LEVELS.map((l, i) => (
                  <button
                    key={l.id}
                    disabled={i > progress.unlocked}
                    onClick={() => load(i)}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {l.title}
                    <span>
                      {progress.completed.includes(i)
                        ? "✓"
                        : i > progress.unlocked
                          ? "Locked"
                          : "↗"}
                    </span>
                  </button>
                ))}
              </div>
            ) : panel === "help" ? (
              <div className="instructions">
                <p>
                  Click a connected surface to walk. Click the small ivory crank
                  to turn a bridge or raise a lift. You can operate every handle
                  remotely.
                </p>
                <p>
                  Bridges must meet at the same height. Ride a lift before
                  raising it. Turn a bridge again while standing on it to reach
                  a new direction.
                </p>
                <p>
                  In the Perspective chapter, choose a numbered camera frame.
                  Distant platforms connect when their silhouettes coincide. Use
                  “Select surface” and “Walk here” to cross overlapping
                  silhouettes.
                </p>
                <p>
                  Keyboard: arrows select surfaces, Enter walks, E operates, Z
                  undoes, H offers a hint, Escape opens or closes settings.
                  Every action also has an HTML control below the board.
                </p>
                <p>
                  Frames change the viewpoint, never require dragging, and fit
                  the whole structure on screen. There are no timed puzzles.
                </p>
              </div>
            ) : (
              <div className="settings">
                <label>
                  <input
                    type="checkbox"
                    checked={reduced}
                    onChange={(e) => setReduced(e.target.checked)}
                  />{" "}
                  Reduce motion
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={sound}
                    onChange={(e) => setSoundState(e.target.checked)}
                  />{" "}
                  Mechanical tones
                </label>
                <button aria-pressed={music} onClick={chooseMusic}>
                  Music: {music ? "playing" : "paused"}
                </button>
                <label>
                  Graphics
                  <select
                    value={quality}
                    onChange={(e) =>
                      setQuality(e.target.value as typeof quality)
                    }
                  >
                    <option value="low">Low · lighter rendering</option>
                    <option value="medium">Medium · balanced</option>
                    <option value="high">High · detailed shadows</option>
                  </select>
                </label>
                <p className="small">
                  Progress is saved on this device. No account or AI service is
                  required. Music pauses when the page is hidden.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
function trapFocus(e: React.KeyboardEvent<HTMLElement>) {
  if (e.key !== "Tab") return;
  const items = Array.from(
    e.currentTarget.querySelectorAll<HTMLElement>(
      "button:not(:disabled),select,input,a[href]",
    ),
  );
  const first = items[0],
    last = items.at(-1);
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last?.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first?.focus();
  }
}
