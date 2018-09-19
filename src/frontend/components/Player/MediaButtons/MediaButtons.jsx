import React from "react";
const MediaButtons = props => (
  <>
    <Controls>
      <Prev {...props.prev} />
      <Pause {...props.pause} />
      <Next {...props.next} />
    </Controls>
    <Options>
      <Save {...props.save} />
      <Shuffle {...props.shuffle} />
    </Options>
  </>
);
