import { InvalidColorStringError } from '../errors/rusty-bot-errors.js';
import type { HexColor } from '../types/hex-color.js';

export function formatHexColor(color: string): HexColor {
  let formattedColor = color.trim().toUpperCase();

  if (!formattedColor.startsWith('#')) {
    formattedColor = '#' + formattedColor;
  }

  const isShortenedHex = /(^#?[0-9A-F]{3}$)/i.test(formattedColor);
  if (isShortenedHex) {
    formattedColor = color.replace(
      /([0-9A-F])([0-9A-F])([0-9A-F])/,
      '#$1$1$2$2$3$3'
    );
  }

  if (!isValidHex(formattedColor)) {
    throw new InvalidColorStringError('Please input a valid hex color code!');
  }

  return formattedColor;
}

function isValidHex(color: string): color is HexColor {
  return /^#[0-9A-F]{6}$/i.test(color);
}
