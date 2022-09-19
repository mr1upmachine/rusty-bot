import { InvalidColorStringError } from '../errors/rusty-bot-errors.js';
import type { HexColor } from '../types/hex-color.js';

type RGB = [number, number, number];

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
    throw new InvalidColorStringError(color);
  }

  return formattedColor;
}

function isValidHex(color: string): color is HexColor {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/** Returns true if provided HexColor is readable on Discord dark, light, and AMOLED modes*/
export function validateHexColorContrast(color: HexColor): boolean {
  const DARK_MODE_RGB: RGB = [54, 57, 63];
  const LIGHT_MODE_RGB: RGB = [255, 255, 255];
  const AMOLED_MODE_RGB: RGB = [0, 0, 0];
  const MINIMUM_DARK_CONTRAST = 1.5;
  const MINIMUM_LIGHT_CONTRAST = 1;

  const rgbToTest = hexToRgb(color);

  const darkModeReadable =
    contrast(rgbToTest, DARK_MODE_RGB) > MINIMUM_DARK_CONTRAST;
  const lightModeReadable =
    contrast(rgbToTest, LIGHT_MODE_RGB) > MINIMUM_LIGHT_CONTRAST;
  const amoledModeReadable =
    contrast(rgbToTest, AMOLED_MODE_RGB) > MINIMUM_DARK_CONTRAST;

  return darkModeReadable && lightModeReadable && amoledModeReadable;
}

function hexToRgb(hexColor: HexColor): RGB {
  const hexComponents = hexColor.match(/[a-f\d]{2}/gi);

  if (!hexComponents || hexComponents.length !== 3) {
    throw new InvalidColorStringError(hexColor);
  }

  return [
    parseInt(hexComponents[0], 16),
    parseInt(hexComponents[1], 16),
    parseInt(hexComponents[2], 16)
  ];
}

function contrast(rgb1: RGB, rgb2: RGB): number {
  const lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

function luminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
