import { MiniLevelGame } from "./MiniLevelGame";
import { UATBanner } from "./components/UATBanner";

function App() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#1a1a2e",
      color: "white",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "system-ui, sans-serif",
      paddingTop: "28px", // ← space for UAT banner (hides itself on Android)
    }}>
      <UATBanner />
      <MiniLevelGame />
    </div>
  );
}

export default App;