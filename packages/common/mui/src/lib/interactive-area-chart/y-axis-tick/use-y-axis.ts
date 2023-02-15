export const useYAxis = (chartData) => {
    const gridHeight = 260
    const maxRate = Math.max(...chartData.map((m) => m['area']));
    const maxTick = maxRate * 1.5;

    const ticks = new Array(6).fill(0).map((_, i) => {
      if (i < 5) return (i * maxTick) / 5;
      return maxTick;
    });

    // // The grid height has an offset of 5 from the bottom and a margin at top
    // // and bottom of 5. We do this manual calculation to ensure an extra line is
    // // not automatically drawn by recharts.
    const height = gridHeight - 10;
    const lines = ticks.map((t) => height - (t / maxTick) * height + 15);
    return { ticks, lines, maxTick };
}

export default useYAxis;