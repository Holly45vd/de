// src/context/moodIcons.js
import cloudRainSnow from "../assets/cloudrainsnow.png";
import B_cloudRainSnow from "../assets/B_cloudrainsnow.png";

import cloudCloud from "../assets/cloudcloud.png";
import B_cloudCloud from "../assets/B_cloudcloud.png";

import cloudSnow from "../assets/cloudsnow.png";
import B_cloudSnow from "../assets/B_cloudsnow.png";

import moonCloud from "../assets/mooncloud.png";
import B_moonCloud from "../assets/B_mooncloud.png";

import moonStar from "../assets/moonstar.png";
import B_moonStar from "../assets/B_moonstar.png";

import cloudRain from "../assets/cloudrain.png";
import B_cloudRain from "../assets/B_cloudrain.png";

import umbrella from "../assets/umbrella.png";
import B_umbrella from "../assets/B_umbrella.png";

import snow from "../assets/snow.png";
import B_snow from "../assets/B_snow.png";

import leaf from "../assets/leaf.png";
import B_leaf from "../assets/B_leaf.png";

import tree from "../assets/tree.png";
import B_tree from "../assets/B_tree.png";

export const moodIcons = {
  "anxious 불안": { color: cloudRainSnow, gray: B_cloudRainSnow },
  "down 무기력": { color: cloudCloud, gray: B_cloudCloud },
  "numb 냉담": { color: cloudSnow, gray: B_cloudSnow },
  "lonely 외로움": { color: moonCloud, gray: B_moonCloud },
  "relaxed 평온": { color: moonStar, gray: B_moonStar },
  "sad 슬픔": { color: cloudRain, gray: B_cloudRain },
  "protected 보호": { color: umbrella, gray: B_umbrella },
  "happy 행복": { color: snow, gray: B_snow },
  "hopeful 희망": { color: leaf, gray: B_leaf },
  "growth 성장": { color: tree, gray: B_tree },
};
