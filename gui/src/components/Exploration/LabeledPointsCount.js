import React, { Component } from "react";

class LabeledPointsCount extends Component {
  render() {
    const nLabeled = this.props.points.length;
    const nPositive = this.props.points.filter((e) => e.label === 1).length;
    const nNegative = this.props.points.filter((e) => e.label === 0).length;

    return (
      <p>
        Total: {nLabeled} ({nPositive} positive, {nNegative} negative)
      </p>
    );
  }
}

export default LabeledPointsCount;
