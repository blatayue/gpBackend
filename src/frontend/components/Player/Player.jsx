import React from "react";
import { CoverArt, MediaControls, Progress, TextInfo } from "./";
const Player = props => (
  <>
    <CoverArt />
    <TextInfo />
    <Progress />
    <MediaControls />
  </>
);

export default Player;
