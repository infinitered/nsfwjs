import {
  Footer,
  Header,
  ImageInput,
  ModelSelector,
  Results,
  StatusTitle,
  Toolbar,
} from "./components";
import { NSFWJSProvider } from "./contexts/NSFWJS";

function App() {
  return (
    <NSFWJSProvider>
      <Header />
      <main className="container mx-auto flex flex-col items-center gap-8 px-4">
        <StatusTitle />
        <div>
          <ImageInput />
          <Toolbar />
        </div>
        <Results />
        <ModelSelector />
      </main>
      <Footer />
    </NSFWJSProvider>
  );
}

export default App;
