import { useRef } from "react";
import Switch from "react-switch";
import { useNSFWJS } from "../contexts/NSFWJS";

const Toolbar = () => {
  const { webCamEnabled, setWebCamEnabled, blurProtection, setBlurProtection } = useNSFWJS();
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div
      id="toolbar"
      className="bg-background-main/20 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-b-2xl px-4 py-5 text-base sm:text-xl"
    >
      <dialog
        id="fpModel"
        className="bg-background-main text-text-primary backdrop:bg-background-main/40 m-auto rounded-2xl border-2 backdrop:backdrop-blur"
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) {
            dialogRef.current.close();
          }
        }}
      >
        <div id="fpInfo" className="max-w-screen-sm space-y-6 p-5 sm:p-10">
          <h2 className="border-b text-3xl font-bold">+&nbsp;False Positives&nbsp;+</h2>
          <p>
            Humans are amazing at visual identification. NSFW tries to error more on the side of
            things being dirty than clean. It's part of what makes failures on NSFW JS entertaining
            as well as practical. This algorithm for NSFW JS is constantly getting improved,{" "}
            <strong>and you can help!</strong>
          </p>
          <h3 className="font-bold">Ways to Help!</h3>
          <ul className="space-y-6">
            <li>
              🌟
              <a
                className="text-primary-main"
                href="https://github.com/alexkimxyz/nsfw_data_scrapper"
                target="_blank"
                rel="noreferrer"
              >
                Contribute to the Data Scraper
              </a>{" "}
              - Noticed any common misclassifications? Just PR a subreddit that represents those
              misclassifications. Future models will be smarter!
            </li>
            <li>
              🌟
              <a
                className="text-primary-main"
                href="https://github.com/gantman/nsfw_model"
                target="_blank"
                rel="noreferrer"
              >
                Contribute to the Trainer
              </a>{" "}
              - The algorithm is public. Advancements here help NSFW JS and other projects!
            </li>
          </ul>
          <a
            className="text-primary-main block"
            href="https://medium.freecodecamp.org/machine-learning-how-to-go-from-zero-to-hero-40e26f8aa6da"
            target="_blank"
            rel="noreferrer"
          >
            <strong>Learn more about how Machine Learning works!</strong>
          </a>
        </div>
      </dialog>
      <p
        id="falsePositiveLabel"
        className="cursor-pointer"
        onClick={() => {
          dialogRef.current?.showModal();
        }}
      >
        False Positive?
      </p>
      <div className="flex items-center gap-2" id="camBlock">
        <p id="camLabel">
          <span>Camera</span>
        </p>
        <Switch
          onColor="#e79f23"
          offColor="#000"
          checked={webCamEnabled}
          onChange={setWebCamEnabled}
        />
      </div>
      <div className="flex items-center gap-2">
        <p id="blurLabel">
          <span>Blur Protection</span>
        </p>
        <Switch
          onColor="#e79f23"
          offColor="#000"
          checked={blurProtection}
          onChange={setBlurProtection}
        />
      </div>
    </div>
  );
};

export default Toolbar;
