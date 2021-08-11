import { expect, fixture, html } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import '../packages/wired-combo/lib/wired-combo';

describe('wired-combo', () => {
  let elementus;

  const __fixture = async (code) => {
    elementus = await fixture(code);

    // some helpers to make the test look nicer
    Object.defineProperties(elementus, {
      card: {
        get() {
          return elementus.shadowRoot.querySelector('wired-card');
        }
      },
      slot: {
        get() {
          return elementus.shadowRoot.querySelector('#slot');
        }
      },
      items: {
        get() {
          return elementus.slot.assignedNodes().filter(e => e instanceof HTMLElement);
        }
      },

    })
  }

  it('should show menu items on click', async () => {
    const code = html`
    <wired-combo>
      <wired-item value="apple">Apple</wired-item>
      <wired-item value="banana">Banana</wired-item>
    </wired-combo>
    `
    await __fixture(code);
    expect(elementus.card).not.to.be.displayed;

    elementus.shadowRoot.querySelector('#text').click();
    expect(elementus.card).to.be.displayed;
  });

  it('should move to an item according to search input', async () => {
    const code = html`
    <wired-combo>
      <wired-item value="apple">Apple</wired-item>
      <wired-item value="banana">Banana</wired-item>
      <wired-item value="cherry">Cherry</wired-item>
    </wired-combo>
    `
    await __fixture(code);
    elementus.shadowRoot.querySelector('#text').click();
    expect(elementus.items.length).to.be.equal(3);
    expect(elementus.items[0].innerText).to.be.equal('Apple');
    expect(elementus.items[1].innerText).to.be.equal('Banana');
    expect(elementus.items[2].innerText).to.be.equal('Cherry');

    // non selected initially
    expect(elementus.items[0].getAttribute('aria-selected')).not.to.exist;
    expect(elementus.items[1].getAttribute('aria-selected')).not.to.exist;
    expect(elementus.items[2].getAttribute('aria-selected')).not.to.exist;

    // start typing
    await sendKeys({ type: 'ba' });
    expect(elementus.items[0].getAttribute('aria-selected')).not.to.exist;
    expect(elementus.items[1].getAttribute('aria-selected')).to.be.equal('true');
    expect(elementus.items[2].getAttribute('aria-selected')).not.to.exist;
  });

  it('should move back and forth by arrows', async () => {
    const code = html`
    <wired-combo>
      <wired-item value="apple">Apple</wired-item>
      <wired-item value="banana">Banana</wired-item>
      <wired-item value="cherry">Cherry</wired-item>
    </wired-combo>
    `
    await __fixture(code);
    elementus.shadowRoot.querySelector("#text").click();

    // non selected initially
    expect(elementus.items[0].getAttribute('aria-selected')).not.to.exist;
    expect(elementus.items[1].getAttribute('aria-selected')).not.to.exist;
    expect(elementus.items[2].getAttribute('aria-selected')).not.to.exist;

    // arrow down
    await sendKeys({ press: 'ArrowDown' })
    expect(elementus.items[0].getAttribute('aria-selected')).to.be.equal('true');
    expect(elementus.items[1].getAttribute('aria-selected')).not.to.exist;
    expect(elementus.items[2].getAttribute('aria-selected')).not.to.exist;

    // arrow down
    await sendKeys({ press: 'ArrowDown' })
    expect(elementus.items[0].getAttribute('aria-selected')).not.to.exist;
    expect(elementus.items[1].getAttribute('aria-selected')).to.be.equal('true');
    expect(elementus.items[2].getAttribute('aria-selected')).not.to.exist;

    // arrow up
    await sendKeys({ press: 'ArrowUp' });
    expect(elementus.items[0].getAttribute('aria-selected')).to.be.equal('true');
    expect(elementus.items[1].getAttribute('aria-selected')).not.to.exist;
    expect(elementus.items[2].getAttribute('aria-selected')).not.to.exist;
  });
})
