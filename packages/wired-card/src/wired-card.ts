import { BaseCSS, ResizeObserver } from '@my-handicapped-pet/wired-lib/lib/wired-base-legacy';
import { css, CSSResultArray, customElement, html, property, PropertyValues, TemplateResult } from 'lit-element';
import { WiredBase } from "@my-handicapped-pet/wired-base";

@customElement('wired-card')
export class WiredCard extends WiredBase {
  @property({ type: Number }) elevation = 1;
  @property({ type: String }) fill?: string;
  private resizeObserver?: ResizeObserver;
  private windowResizeHandler?: EventListenerOrEventListenerObject;

  constructor() {
    super();
    if ((window as any).ResizeObserver) {
      this.resizeObserver = new (window as any).ResizeObserver(() => {
        if (this.svg) {
          this.onUpdated();
        }
      });
    }
  }

  static get styles(): CSSResultArray {
    return [
      BaseCSS,
      css`
        :host {
          display: inline-block;
          position: relative;
          padding: 10px;
        }
        .cardFill path {
          stroke-width: 3.5;
          stroke: var(--wired-card-background-fill);
        }
        path {
          stroke: var(--wired-card-background-fill, currentColor);
        }
      `
    ];
  }

  render(): TemplateResult {
    return html`
    <div id="overlay"><svg></svg></div>
    <div style="position: relative;">
      <slot @slotchange="${this.onUpdated}"></slot>
    </div>
    `;
  }

  updated(changed: PropertyValues) {
    super.updated(changed);
    this.attachResizeListener();
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this.setAttribute(WiredBase.SHAPE_ATTR, `rectangle:offset=2,fill=hachure,elevation=${this.elevation},class=cardFill`);
  }

  disconnectedCallback() {
    this.detachResizeListener();
  }

  private attachResizeListener() {
    if (this.resizeObserver && this.resizeObserver.observe) {
      this.resizeObserver.observe(this);
    } else if (!this.windowResizeHandler) {
      this.windowResizeHandler = () => this.onUpdated();
      window.addEventListener('resize', this.windowResizeHandler, { passive: true });
    }
  }

  private detachResizeListener() {
    if (this.resizeObserver && this.resizeObserver.unobserve) {
      this.resizeObserver.unobserve(this);
    }
    if (this.windowResizeHandler) {
      window.removeEventListener('resize', this.windowResizeHandler);
    }
  }
}