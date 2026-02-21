import nsfwjsLogo from "../assets/nsfwjs-logo.svg";
import tfjsLogo from "../assets/tfjs-logo.jpg";

const Header = () => (
  <header className="bg-background-main px-4">
    <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-4 sm:flex-nowrap">
      <img
        id="logo"
        className="h-20 w-50 object-contain sm:h-36 sm:w-64 md:w-90"
        src={nsfwjsLogo}
        alt="Logo"
      />
      <h1 className="py-3 text-xl font-bold italic max-sm:order-last max-sm:text-center sm:text-2xl">
        Client-side indecent content checking
      </h1>
      <div className="text-primary-main flex flex-col items-center font-bold sm:ml-auto">
        <p className="from-primary-dark to-primary-light bg-linear-to-r bg-clip-text text-base text-transparent sm:text-lg">
          Powered&nbsp;by
        </p>
        <a href="https://js.tensorflow.org/" target="_blank" rel="noreferrer">
          <img
            id="tflogo"
            className="h-12 w-20 object-contain sm:h-20 sm:w-32"
            src={tfjsLogo}
            alt="TensorflowJS Logo"
          />
        </a>
      </div>
    </div>
  </header>
);

export default Header;
