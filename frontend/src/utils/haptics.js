// Web Vibration API wrapper — no-op on unsupported devices (iOS Safari, desktop)
const v = (pattern) => navigator.vibrate?.(pattern);

export const haptics = {
  tap:        () => v(40),                          // selection, toggle
  success:    () => v(80),                          // add to cart, save
  successBig: () => v([80, 40, 80, 40, 200]),       // order confirmed
  error:      () => v([100, 50, 100]),              // validation error
  remove:     () => v([60, 40, 60]),               // delete / remove
};
