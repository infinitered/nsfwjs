import nsfwjsLogo from "../assets/nsfwjs-logo.svg";
import tfjsLogo from "../assets/tfjs-logo.jpg";

const Header = () => (
  <header className="bg-background-main px-4">
    <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-4 sm:flex-nowrap">
      <img id="logo" className="max-h-20 min-w-36 sm:max-h-36" src={nsfwjsLogo} alt="Logo" />
      <h1 className="py-3 text-xl font-bold italic max-sm:order-last max-sm:text-center sm:text-2xl">
        Client-side indecent content checking
      </h1>
      <div className="text-primary-main flex flex-col items-center gap-2 font-bold sm:ml-auto">
        <p className="from-primary-dark to-primary-light bg-linear-to-r bg-clip-text text-base text-transparent sm:text-lg">
          Powered&nbsp;by
        </p>
        <a href="https://js.tensorflow.org/" target="_blank" rel="noreferrer">
          <img
            id="tflogo"
            className="max-h-12 min-w-20 sm:max-h-20"
            src={tfjsLogo}
            alt="TensorflowJS Logo"
          />
        </a>
      </div>
    </div>
  </header>
);

export default Header;
