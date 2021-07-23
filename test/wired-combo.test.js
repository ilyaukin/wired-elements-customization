import { expect, fixture } from '@open-wc/testing';
import '../packages/wired-combo/lib/wired-combo';

describe('wired-combo', () => {
  it('should runat least a simpliest test.... plz plz plz...', async () => {
    const elementus = await fixture('<wired-combo></wired-combo>');
    expect(elementus.shadowRoot).to.exist;
  });
})