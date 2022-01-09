import { BaseCSS } from '@my-handicapped-pet/wired-lib/lib/wired-base-legacy';
import { css, CSSResultArray, customElement, html, property, PropertyValues, TemplateResult } from 'lit-element';
import { WiredBase } from "@my-handicapped-pet/wired-base";

@customElement('wired-item')
export class WiredItem extends WiredBase {
  @property() value = '';
  @property() name = '';
  @property({ type: Boolean }) selected = false;

  static get styles(): CSSResultArray {
    return [
      BaseCSS,
      css`
      :host {
        display: inline-block;
        font-size: 14px;
        text-align: left;
      }
      button {
        cursor: pointer;
        outline: none;
        overflow: hidden;
        color: inherit;
        user-select: none;
        position: relative;
        font-family: inherit;
        text-align: inherit;
        font-size: inherit;
        letter-spacing: 1.25px;
        padding: 1px 10px;
        min-height: 36px;
        text-transform: inherit;
        background: none;
        border: none;
        transition: background-color 0.3s ease, color 0.3s ease;
        width: 100%;
        box-sizing: border-box;
        white-space: nowrap;
      }
      button.selected {
        color: var(--wired-item-selected-color, #fff);
      }
      button::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: currentColor;
        opacity: 0;
      }
      button span {
        display: inline-block;
        transition: transform 0.2s ease;
        position: relative;
      }
      button:active span {
        transform: scale(1.02);
      }
      #overlay {
        display: none;
      }
      button.selected #overlay {
        display: block;
      }
      svg path {
        stroke: var(--wired-item-selected-bg, #000);
        stroke-width: 2.75;
        fill: transparent;
        transition: transform 0.05s ease;
      }
      @media (hover: hover) {
        button:hover::before {
          opacity: 0.05;
        }
      }
      `
    ];
  }

  render(): TemplateResult {
    return html`
    <button class="${this.selected ? 'selected' : ''}">
      <div id="overlay"><svg></svg></div>
      <span><slot></slot></span>
    </button>`;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this.setAttribute(WiredBase.SHAPE_ATTR, 'rectangle:fill=hachure,border=none');
  }
}