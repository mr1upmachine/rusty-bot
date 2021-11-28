export function formatHexColor(color: string): string {
  let formattedColor = color.trim().toUpperCase();

  if (!/^#/.test(formattedColor)) {
    formattedColor = '#' + formattedColor;
  }

  const isValidHex = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(formattedColor);
  if (!isValidHex) {
    throw new Error('Please input a valid hex color code!');
  }

  const isShortenedHex = /(^#?[0-9A-F]{3}$)/i.test(formattedColor);
  if (isShortenedHex) {
    formattedColor = color.replace(
      /([0-9A-F])([0-9A-F])([0-9A-F])/,
      '#$1$1$2$2$3$3'
    );
  }
  return formattedColor;
}
