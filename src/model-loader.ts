import * as nsfwjs from "./index";

module.exports = () => {
  let val: { model: any } = { model: undefined };
  nsfwjs.load("../lib/model").then(_model => {
    val.model = _model;
  });
  return {
    code: "module.exports = " + val
  };
};
