export default (hex: string): [number, number, number] =>
  hex
    .replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => "#" + r + r + g + g + b + b,
    )
    .substring(1)
    .match(/.{2}/g)
    .map((x) => parseInt(x, 16)) as [number, number, number];
