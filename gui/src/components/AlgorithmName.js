import React, { Component } from "react";

import { allLearners } from "../constants/constants";

class AlgorithmName extends Component {
  render() {
    const algorithmName = allLearners.find(
      (learner) => learner.value === this.props.algorithm
    ).label;

    return <h3>Algorithm: {algorithmName}</h3>;
  }
}

export default AlgorithmName;
