import { ImageInput, ModelSelector, Results, StatusTitle, Toolbar } from "./components";
import { NSFWJSProvider } from "./contexts/NSFWJS";

function App() {
  return (
    <NSFWJSProvider>
      <StatusTitle />
      <div>
        <ImageInput />
        <Toolbar />
      </div>
      <Results />
      <ModelSelector />
    </NSFWJSProvider>
  );
}

export default App;
