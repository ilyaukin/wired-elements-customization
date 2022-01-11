import { expect, fixture, html } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { TemplateResult } from "lit-element";
import '..';

interface WiredComboElement extends HTMLElement {
  container: HTMLElement;
  searchInput: HTMLElement;
  card: HTMLElement;
  slotElement: HTMLSlotElement;
  items: Array<HTMLElement>;
}


describe('wired-combo', () => {
  let elementus: WiredComboElement;

  const __fixture = async (code: string | TemplateResult) => {
    // @ts-ignore
    elementus = await fixture(code);

    // add missing attributes
    Object.defineProperties(elementus, {
      container: {
        get() {
          return elementus.shadowRoot!.querySelector("#container");
        }
      },
      searchInput: {
        get() {
          return elementus.shadowRoot!.querySelector("#searchInput");
        }
      },
      card: {
        get() {
          return elementus.shadowRoot!.querySelector('wired-card');
        }
      },
      slotElement: {
        get() {
          return elementus.shadowRoot!.querySelector('#slot');
        }
      },
      items: {
        get() {
          return elementus.slotElement.assignedNodes().filter(e => e instanceof HTMLElement);
        }
      },

    })
  }

  async function __fixture_fruits() {
    const code = html`
    <wired-combo>
      <wired-item value="apple">Apple</wired-item>
      <wired-item value="banana">Banana</wired-item>
      <wired-item value="cherry">Cherry</wired-item>
    </wired-combo>
    `
    await __fixture(code);
  }

  function __click_on_combo() {
    (elementus.shadowRoot!.querySelector('#text') as HTMLElement).click();
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
    __click_on_combo();
    expect(elementus.card).to.be.displayed;
  });

  it('should move to an item according to search input', async () => {
    await __fixture_fruits();
    __click_on_combo();
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
    await __fixture_fruits();
    __click_on_combo();

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

  it('should move to an item according to search input (items added dynamically)', async () => {
    const code = html`
    <wired-combo>
    </wired-combo>
    `
    await __fixture(code);

    const addItem = (value: string, text: string) => {
      const item = document.createElement('wired-item');
      item.setAttribute('value', value);
      item.innerHTML = text;
      elementus.appendChild(item);
    }

    addItem('apple', 'Apple');
    addItem('banana', 'Banana');
    addItem('cherry', 'Cherry');

    __click_on_combo();
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

  it('should render combo, cards and edit box of the same size', async () => {
    await __fixture_fruits();

    // have to expand items to get actual size
    __click_on_combo();

    const r1 = elementus.container.getBoundingClientRect();
    const r2 = elementus.card.getBoundingClientRect();
    const r3 = elementus.searchInput.getBoundingClientRect();
    expect(r1.width).to.be.equal(r2.width);
    expect(r1.width).to.be.equal(r3.width + 34 /*dropdown width*/);
  });
})
