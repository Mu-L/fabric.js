import { roundSnapshotOptions } from '../../../vitest.extend';
import { cache } from '../../cache';
import { config } from '../../config';
import { Path } from '../Path';
import { FabricText } from './Text';

import { describe, expect, it, afterEach } from 'vitest';

afterEach(() => {
  config.restoreDefaults();
});

describe('FabricText', () => {
  it('toObject', async () => {
    expect(new FabricText('text').toObject()).toMatchObjectSnapshot();
  });

  it('fromObject', async () => {
    expect((await FabricText.fromObject({ text: 'text' })).toObject()).toEqual(
      new FabricText('text').toObject(),
    );
  });

  describe('measuring, splitting', () => {
    it('measuring', () => {
      cache.clearFontCache();
      const zwc = '\u200b';
      const text = new FabricText('');
      const style = text.getCompleteStyleDeclaration(0, 0);
      const measurement = text._measureChar('a', style, zwc, style);
      expect(measurement).toMatchSnapshot(roundSnapshotOptions);
      expect(measurement).toEqual(text._measureChar('a', style, zwc, style));
    });

    it('splits into lines', () => {
      const text = new FabricText('test foo bar-baz\nqux');
      expect(text._splitTextIntoLines(text.text)).toMatchSnapshot();
    });
  });

  it('toSVG with NUM_FRACTION_DIGITS', async () => {
    const text = await FabricText.fromObject({
      text: 'xxxxxx',
      styles: [
        { fill: 'red' },
        { fill: 'blue' },
        { fill: 'green' },
        { fill: 'yellow' },
        { fill: 'pink' },
      ].map((style, index) => ({ style, start: index, end: index + 1 })),
    });
    config.configure({ NUM_FRACTION_DIGITS: 1 });
    expect(text.toSVG()).toMatchSnapshot();
    config.configure({ NUM_FRACTION_DIGITS: 3 });
    expect(text.toSVG()).toMatchSnapshot();
  });

  it('toSVG with a path', async () => {
    const path = new Path('M 10 10 H 50 V 60', { fill: '', stroke: 'red' });
    const text = new FabricText(
      'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      { scaleX: 2, scaleY: 2 },
    );
    const plainSvg = text.toSVG();
    text.path = path;
    const svg = text.toSVG();
    expect(svg).toMatchSnapshot();
    expect(svg.includes(plainSvg)).toBe(false);
  });

  it('subscript/superscript', async () => {
    const text = await FabricText.fromObject({
      text: 'xxxxxx',
      styles: [
        { stroke: 'black', fill: 'blue' },
        { fill: 'blue' },
        { fontSize: 4, deltaY: 20 },
        { stroke: 'black', fill: 'blue' },
        { fill: 'blue' },
        { fontSize: 4, deltaY: 20 },
      ].map((style, index) => ({ style, start: index, end: index + 1 })),
    });
    text.setSuperscript(1, 2);
    text.setSuperscript(2, 3);
    text.setSubscript(3, 4);
    text.setSubscript(4, 5);
    expect(text.toObject().styles).toMatchSnapshot();
  });
});
