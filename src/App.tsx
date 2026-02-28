import { MiniLevelGame } from "./MiniLevelGame";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1a1a2e",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <MiniLevelGame />
    </div>
  );
}

export default App;
