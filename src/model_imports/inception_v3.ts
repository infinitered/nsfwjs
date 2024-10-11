export const modelJson = () =>
  import("../models/inception_v3/model.min.js" as string);

export const weightBundles = [
  () => import("../models/inception_v3/group1-shard1of6.min.js" as string),
  () => import("../models/inception_v3/group1-shard2of6.min.js" as string),
  () => import("../models/inception_v3/group1-shard3of6.min.js" as string),
  () => import("../models/inception_v3/group1-shard4of6.min.js" as string),
  () => import("../models/inception_v3/group1-shard5of6.min.js" as string),
  () => import("../models/inception_v3/group1-shard6of6.min.js" as string),
];
