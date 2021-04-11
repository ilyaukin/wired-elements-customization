import { customElement, property, query, css, TemplateResult, html, LitElement, CSSResult, PropertyValues } from 'lit-element';
import { rectangle, polygon, fire } from 'wired-lib';
import { WiredCard } from 'wired-card';
import { WiredItem } from 'wired-item';

interface ComboValue {
  value: string;
  text: string;
}

@customElement('wired-combo-lazy')
export class WiredComboLazy extends LitElement {
  @property({ type: Array }) values: ComboValue[] = [];
  @property({ type: Object }) value?: ComboValue;
  @property({ type: String }) selected?: string;
  @property({ type: Boolean, reflect: true }) disabled = false;

  @query('svg') private svg?: SVGSVGElement;
  @query('#card') private card?: WiredCard;

  private cardShowing = false;
  private itemNodes: WiredItem[] = [];
  private selectedItem?: WiredItem;

  // maximum number of items displayed at once
  private depth = 10;

  static get styles(): CSSResult {
    return css`
    :host {
      display: inline-block;
      font-family: inherit;
      position: relative;
      outline: none;
      opacity: 0;
    }
  
    :host(.wired-disabled) {
      opacity: 0.5 !important;
      cursor: default;
      pointer-events: none;
      background: rgba(0, 0, 0, 0.02);
    }
    
    :host(.wired-rendered) {
      opacity: 1;
    }

    :host(:focus-within) path {
      stroke-width: 1.5;
    }
  
    #container {
      white-space: nowrap;
      position: relative;
    }
  
    .inline {
      display: inline-block;
      vertical-align: top
    }
  
    #textPanel {
      min-width: 90px;
      min-height: 18px;
      padding: 8px;
    }
  
    #dropPanel {
      width: 34px;
      cursor: pointer;
    }
  
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }
  
    svg {
      display: block;
    }
  
    path {
      stroke: currentColor;
      stroke-width: 0.7;
      fill: transparent;
    }
  
    #card {
      position: absolute;
      background: var(--wired-combo-popup-bg, white);
      z-index: 1;
      box-shadow: 1px 5px 15px -6px rgba(0, 0, 0, 0.8);
    }

    #itemContainer {
      max-height: 200px;
      overflow-y: scroll;
    }

    ::slotted(wired-item) {
      display: block;
    }
    
    #searchInput {
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      border: none;
      padding: 8px;
      font-size: inherit;
      font-family: inherit;
      /* for debug */
      /*background-color: gray;*/
    }
    `;
  }

  render(): TemplateResult {
    return html`
    <input id="searchInput" @keyup="${this.onSearch}">
    <div id="container" @click="${this.onCombo}">
      <div id="textPanel" class="inline">
        <div id="text">
          <span>${this.value && this.value.text}</span>
        </div>
      </div>
      <div id="dropPanel" class="inline"></div>
      <div class="overlay">
        <svg id="svg"></svg>
      </div>
    </div>
    <wired-card id="card" tabindex="-1" role="listbox" @mousedown="${this.onItemClick}" @touchstart="${this.onItemClick}"
      style="display: none;">
      <div id="itemContainer">
        <!-- place for items to append in run-time -->
      </div>
    </wired-card>
    `;
  }

  focus(options?: FocusOptions) {
    super.focus(options);
    this.setCardShowing(true);
  }

  private refreshDisabledState() {
    if (this.disabled) {
      this.classList.add('wired-disabled');
    } else {
      this.classList.remove('wired-disabled');
    }
    this.tabIndex = this.disabled ? -1 : +(this.getAttribute('tabindex') || 0);
  }

  firstUpdated() {
    this.setAttribute('role', 'combobox');
    this.setAttribute('aria-haspopup', 'listbox');
    this.select(this.getSelectedItemBySelected());

    this.addEventListener('blur', () => {
      if (this.cardShowing) {
        this.setCardShowing(false);
      }
    });
    this.addEventListener('keydown', (event) => {
      // here we break (fix?) legacy behaviour:
      // arrow up,down only select item in the list but do not actually fire
      // "selected" event, <Enter> fires selected, <Esc> selects last selected value
      switch (event.keyCode) {
        case 38:
          event.preventDefault();
          if (!this.cardShowing) {
            this.setCardShowing(true);
          }
          this.selectPrevious();
          break;
        case 40:
          event.preventDefault();
          if (!this.cardShowing) {
            this.setCardShowing(true);
          }
          this.selectNext();
          break;
        case 27:
          event.preventDefault();
          if (this.cardShowing) {
            this.select(this.getSelectedItemBySelected());
            this.setCardShowing(false);
          }
          break;
        case 13:
          event.preventDefault();
          if (this.cardShowing) {
            this.fireSelected();
            this.setCardShowing(false);
          } else {
            this.setCardShowing(true);
          }
          break;
        case 32:
          if (!this.cardShowing) {
            event.preventDefault();
            this.setCardShowing(true);
          }
          break;
      }
    });
  }

  updated(changed: PropertyValues) {
    if (changed.has('disabled')) {
      this.refreshDisabledState();
    }
    const svg = this.svg!;
    while (svg.hasChildNodes()) {
      svg.removeChild(svg.lastChild!);
    }
    const s = this.shadowRoot!.getElementById('container')!.getBoundingClientRect();
    svg.setAttribute('width', `${s.width}`);
    svg.setAttribute('height', `${s.height}`);
    const textBounds = this.shadowRoot!.getElementById('textPanel')!.getBoundingClientRect();
    this.shadowRoot!.getElementById('dropPanel')!.style.minHeight = textBounds.height + 'px';
    rectangle(svg, 0, 0, textBounds.width, textBounds.height);
    const dropx = textBounds.width - 4;
    rectangle(svg, dropx, 0, 34, textBounds.height);
    const dropOffset = Math.max(0, Math.abs((textBounds.height - 24) / 2));
    const poly = polygon(svg, [
      [dropx + 8, 5 + dropOffset],
      [dropx + 26, 5 + dropOffset],
      [dropx + 17, dropOffset + Math.min(textBounds.height, 18)]
    ]);
    poly.style.fill = 'currentColor';
    poly.style.pointerEvents = this.disabled ? 'none' : 'auto';
    poly.style.cursor = 'pointer';
    this.classList.add('wired-rendered');

    // aria
    this.setAttribute('aria-expanded', `${this.cardShowing}`);
    if (changed.has('values')) {
      this.setValues(this.values.slice(0, this.depth));
    }
    if (changed.has('selected') && !this.selected) {
      (this.shadowRoot!.getElementById('searchInput') as HTMLInputElement).value = '';
    }
  }

  private getSelectedItemBySelected() {
    if (!this.itemNodes || !this.selected) {
      return undefined;
    }

    return this.itemNodes.find(node => {
      return node.tagName === "WIRED-ITEM" && this.selected === node.value;
    });
  }

  private setCardShowing(showing: boolean) {
    if (!this.card) {
      return;
    }
    this.cardShowing = showing;
    this.card.style.display = showing ? '' : 'none';
    // show search input
    const searchInput = this.shadowRoot!.getElementById('searchInput') as HTMLInputElement;
    searchInput.style.display = showing ? 'block' : 'none';
    // and immediately activate
    if (showing) {
      searchInput.focus();
      if (searchInput.value) {
        searchInput.select();
      }
    } else {
      // restore focus on the host
      super.focus();
    }
    // only show text when drop-down isn't open
    const text = this.shadowRoot!.getElementById('text') as HTMLElement;
    text.style.display = showing ? 'none': '';
    if (showing) {
      setTimeout(() => {
        this.card!.requestUpdate();
        this.itemNodes.forEach((item) => {
          item.requestUpdate();
        });
      }, 10);
    }
    this.setAttribute('aria-expanded', `${this.cardShowing}`);
  }

  private select(item: WiredItem | undefined) {
    // update displaying item
    if (this.selectedItem) {
      this.selectedItem.selected = false;
      this.selectedItem.removeAttribute('aria-selected');
    }
    if (item) {
      item.selected = true;
      item.setAttribute('aria-selected', 'true');

      // scroll to the item if it's out of visible area
      const area = this.shadowRoot?.getElementById('itemContainer') as HTMLElement;
      const item0Offset = this.itemNodes[0].offsetTop;
      if (area.scrollTop + area.offsetHeight < item.offsetTop - item0Offset
        || item.offsetTop - item0Offset < area.scrollTop) {
        area.scrollTo({ top: item.offsetTop - item0Offset });
      }
    }

    // update selected item for internal usage,
    // but not "selected" and "value" attributes,
    // since for consistence they are only updated
    // when "selected" event is fired
    this.selectedItem = item;
  }

  private onItemClick(event: CustomEvent) {
    event.stopPropagation();
    this.select(event.target as WiredItem);
    this.fireSelected();
    setTimeout(() => {
      this.setCardShowing(false);
    });
  }

  private fireSelected() {
    // update selected
    this.selected = this.selectedItem ? this.selectedItem.value : '';

    // update value
    if (this.selectedItem) {
      this.value = {
        value: this.selectedItem.value || '',
        text: this.selectedItem.textContent || ''
      };
    } else {
      this.value = undefined;
    }

    fire(this, 'selected', { selected: this.selected });
  }

  private selectPrevious() {
    if (!this.itemNodes.length) {
      return;
    }
    const item = this.selectedItem?.previousElementSibling as WiredItem
      || this.itemNodes[this.itemNodes.length - 1];
    this.select(item);

    const searchInput = this.shadowRoot!.getElementById('searchInput') as HTMLInputElement;
    searchInput.value = item.textContent || '';
  }

  private selectNext() {
    if (!this.itemNodes.length) {
      return;
    }
    let item = this.selectedItem?.nextElementSibling as WiredItem
      || this.itemNodes[0];
    this.select(item);

    const searchInput = this.shadowRoot!.getElementById('searchInput') as HTMLInputElement;
    searchInput.value = item.textContent || '';
  }

  private onSearch(event: KeyboardEvent) {
    if ([38, 40].indexOf(event.keyCode) !== -1) {
      return;
    }

    const searchInput = this.shadowRoot!.getElementById('searchInput') as HTMLInputElement;
    const searchValue = searchInput.value.toLocaleLowerCase();

    // 1) values starting with a search term
    let values = this.values.filter(value => {
      return value.text?.toLocaleLowerCase().startsWith(searchValue)
    }).slice(0, this.depth);
    if (values.length) {
      this.setValues(values);
      this.select(this.itemNodes[0]);
      return;
    }

    // 2) items containing a search term
    values = this.values.filter(value => {
      return value.text && value.text.toLocaleLowerCase().indexOf(searchValue) !== -1
    }).slice(0, this.depth);
    this.setValues(values);
    if (values.length) {
      this.select(this.itemNodes[0]);
    }
  }

  private onCombo(event: Event) {
    event.stopPropagation();
    this.setCardShowing(!this.cardShowing);
  }

  private setValues(values: ComboValue[]) {
    const itemContainer = this.shadowRoot!.getElementById('itemContainer')!;
    while (itemContainer.hasChildNodes()) {
      itemContainer.removeChild(itemContainer.lastChild!);
    }
    this.itemNodes = [];
    for (const value of values) {
      const item = new WiredItem();
      item.value = value.value;
      item.textContent = value.text;
      item.style.width = '100%';
      itemContainer.appendChild(item);
      this.itemNodes.push(item);
    }

    if (this.cardShowing) {
      (this.shadowRoot!.getElementById('card') as WiredCard).requestUpdate();
    }
  }
}