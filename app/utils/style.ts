/** A blur that clears as an element fades in: maxBlur pixels when invisible, none when shown. */
export const blurUntilVisible = (opacity: number, maxBlur: number) =>
  opacity < 0.995 ? `blur(${((1 - opacity) * maxBlur).toFixed(1)}px)` : 'none';
