// src/context/moodIcons.js

// ===== 기존 아이콘 =====
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

// ===== 새로 추가할 아이콘 =====
import glosses from "../assets/glosses.png";
import B_glosses from "../assets/B_glosses.png";

import compass from "../assets/compass.png";
import B_compass from "../assets/B_compass.png";

export const moodIcons = {
  anxiety: {
    en: "Anxiety",
    ko: "불안",
    color: cloudRainSnow,
    gray: B_cloudRainSnow,
  },
  coldness: {
    en: "Coldness",
    ko: "냉담",
    color: cloudCloud,
    gray: B_cloudCloud,
  },
  lethargy: {
    en: "Lethargy",
    ko: "무기력",
    color: cloudSnow,
    gray: B_cloudSnow,
  },
  lonely: {
    en: "Lonely",
    ko: "외로움",
    color: moonCloud,
    gray: B_moonCloud,
  },
  calm: {
    en: "Calm",
    ko: "평온",
    color: moonStar,
    gray: B_moonStar,
  },
  sadness: {
    en: "Sadness",
    ko: "슬픔",
    color: cloudRain,
    gray: B_cloudRain,
  },
  protection: {
    en: "Protection",
    ko: "보호",
    color: umbrella,
    gray: B_umbrella,
  },
  happiness: {
    en: "Happiness",
    ko: "행복",
    color: snow,
    gray: B_snow,
  },
  hope: {
    en: "Hope",
    ko: "희망",
    color: leaf,
    gray: B_leaf,
  },
  growth: {
    en: "Growth",
    ko: "성장",
    color: tree,
    gray: B_tree,
  },
  confident: {
    en: "Confident",
    ko: "자신감",
    color: glosses,
    gray: B_glosses,
  },
  adventurous: {
    en: "Adventurous",
    ko: "모험",
    color: compass,
    gray: B_compass,
  },
};