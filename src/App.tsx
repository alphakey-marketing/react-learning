import { MiniLevelGame } from "./MiniLevelGame";
import { UATBanner } from "./components/UATBanner";
import { MonetizationProvider } from "./context/MonetizationContext";

function App() {
  return (
    <MonetizationProvider>
      {/* UATBanner overlays everything via its own z-index — outside the shell */}
      <UATBanner />

      {/* App shell — vertical flex column, full dynamic viewport height */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          overflow: "hidden",
          background: "#1a1a2e",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Main content zone: flex: 1 so it fills remaining space, scrolls internally */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            paddingBottom: "64px", // clears BottomNavBar height
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <MiniLevelGame />
        </div>
      </div>
    </MonetizationProvider>
  );
}

export default App;
