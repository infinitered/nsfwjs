import irLogo from "../assets/ir-logo.svg";

const Footer = () => (
  <footer className="bg-background-main text-center text-sm font-semibold uppercase">
    <div className="container mx-auto flex flex-col gap-3.5 px-4 py-7">
      <div className="overflow-auto pb-3.5">
        <div className="[&>a:hover]:text-primary-main inline-flex min-w-125 gap-6 lg:gap-10 xl:gap-14">
          <a href="https://github.com/infinitered/nsfwjs">NSFW.js Github</a>
          <a href="https://github.com/infinitered/nsfwjs/tree/master/examples/nsfw_demo">
            Website Github
          </a>
          <a href="https://github.com/gantman/nsfw_model">NSFW Model Github</a>
          <a href="https://shift.infinite.red/avoid-nightmares-nsfw-js-ab7b176978b1">Blog Post</a>
          <a href="https://github.com/infinitered/nsfwjs-mobile">Mobile Demo Github</a>
        </div>
      </div>
      <a className="mx-auto shrink-0 pb-3.5" href="https://infinite.red">
        <img src={irLogo} alt="infinite red logo" width="93px" height="41px" />
      </a>
      <div>Copyright {new Date().getFullYear()} Infinite Red, Inc.</div>
    </div>
  </footer>
);

export default Footer;
