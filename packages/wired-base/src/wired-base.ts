import { LitElement, PropertyValues, query } from "lit-element";
import { debugLog, hachureFill, line, Point, polygon, rectangle } from "@my-handicapped-pet/wired-lib";

export class WiredBase extends LitElement {
  @query('svg') protected svg?: SVGSVGElement;
  protected lastSize: Point = [0, 0];

  static SHAPE_ATTR = 'data-wired-shape';

  updated(_changed?: PropertyValues) {
    this.onUpdated();
  }

  protected onUpdated(force = false) {
    if (this.svg) {
      // condition to render: size is changed or force is true
      const rect = this.getBoundingClientRect();
      if ((!force) && (rect.width === this.lastSize[0]) && (rect.height === this.lastSize[1])) {
        return;
      }
      // set size of svg to size of this
      // consider elevation
      let elev = 0;
      if (this.hasAttribute(WiredBase.SHAPE_ATTR) && /elevation=\d+/.test(this.getAttribute(WiredBase.SHAPE_ATTR)!)) {
        elev = Math.min(parseInt(/elevation=(\d+)/.exec(this.getAttribute(WiredBase.SHAPE_ATTR)!)![1]), 5);
      }
      this.svg.setAttribute('width', `${rect.width + (elev ? elev - 1 : 0)}`);
      this.svg.setAttribute('height', `${rect.height + (elev ? elev - 1 : 0)}`);
      // remove old shapes
      this.removeWiredShapes();
      // draw new shapes
      this.renderWiredShapes();
      this.lastSize = [rect.width, rect.height];
      this.classList.add('wired-rendered');
    }
  }

  protected removeWiredShapes() {
    while (this.svg!.hasChildNodes()) {
      this.svg!.removeChild(this.svg!.lastChild!);
    }
  }

  /**
   * Render wired shapes, by the attributes 'data-wired-shape'
   * of the nested elements
   *
   * Syntax of `data-wired-shape` attribute:
   *
   * wired-shape  ::= single-shape[;single-shape;...]
   * single-shape ::= shape[:k=v,k=v,...]
   * shape        ::= 'rectangle'|'arrow-down'|'arrow-up'
   * k            ::= 'offset'|'offset-top'|'offset-left'|'offset-bottom'|'offset-right'|'fill'|
   *                  'border'|'elevation'|'class'
   * v            ::= number|string
   */
  protected renderWiredShapes() {
    // implying svg is absolutely positioned at 0,0
    // hence we'll calculate positions of the shapes drawn as position of element's rect
    // relative to this rect

    const anchor = this.getBoundingClientRect();
    this.renderWiredShapesForElementAndChildren(this, anchor.x, anchor.y);
  }

  private renderWiredShapesForElementAndChildren(element: HTMLElement, anchorX: number, anchorY: number) {
    // render element
    if (element.hasAttribute(WiredBase.SHAPE_ATTR)) {
      const attribute = element.getAttribute(WiredBase.SHAPE_ATTR)!;
      const drawSingleShape = (singleShape: string) => {
        const arr = singleShape.split(':');
        const shape = arr[0];
        const properties: any = {};
        if (arr.length > 1) {
          arr[1].split(',').forEach(p => {
            const parr = p.split('=');
            properties[parr[0]] = parr.length > 1 ? parr[1] : true;
          })
        }
        // calculate element's rectangle
        const rect = element.getBoundingClientRect();
        let x0 = rect.left - anchorX, y0 = rect.top - anchorY, x1 = x0 + rect.width, y1 = y0 + rect.height;
        // consider offsets
        if (properties.offset) {
          properties["offset-top"] ||= properties.offset;
          properties["offset-left"] ||= properties.offset;
          properties["offset-bottom"] ||= properties.offset;
          properties["offset-right"] ||= properties.offset;
        }
        if (properties["offset-top"]) {
          y0 += parseInt(properties["offset-top"]);
        }
        if (properties["offset-left"]) {
          x0 += parseInt(properties["offset-left"]);
        }
        if (properties["offset-bottom"]) {
          y1 -= parseInt(properties["offset-bottom"]);
        }
        if (properties["offset-right"]) {
          x1 -= parseInt(properties["offset-right"]);
        }
        let svg: SVGElement | undefined;  // drawn shape
        debugLog(`${shape}(${x0}, ${y0}, ${x1}, ${y1})`);
        switch (shape) {
          case "rectangle":
            // inner area
            switch (properties.fill) {
              case "hachure":
                svg = hachureFill([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]);
                this.svg?.appendChild(svg);
                break;
            }
            if (svg && properties.class) {
              svg.classList.add(properties.class);
            }
            // border
            switch (properties.border) {
              case "none":
                break;
              default:
                svg = rectangle(this.svg!, x0, y0, x1 - x0, y1 - y0);
                break;
            }
            // elevation
            let elev = properties.elevation ? Math.min(parseInt(properties.elevation), 5) : 0;
            if (elev > 1) {
              for (let i = 0, j = 0; i < elev - 1; j ? (i++, j = 0) : j++) {
                line(this.svg!, x0 + i * 2, y1 + i * 2, x1 + i * 2, y1 + i * 2)
                  .style.opacity = `${(75 - 10 * i) / 100}`;
                line(this.svg!, x1 + i * 2, y1 + i * 2, x1 + i * 2, y0 + i * 2)
                  .style.opacity = `${(75 - 10 * i) / 100}`;
              }
            }
            break;
          case "arrow-down":
            svg = polygon(this.svg!, [[x0, y0], [x1, y0], [(x0 + x1) / 2, y1]]);
            break;
          case "arrow-up":
            svg = polygon(this.svg!, [[x0, y1], [x1, y1], [(x0 + x1 / 2), y0]]);
            break;
        }
        if (svg && properties.fill && properties.fill !== "hachure") {
          svg.style.fill = properties.fill;
        }
      }
      for (let singleShape of attribute.split(';')) {
        drawSingleShape(singleShape);
      }
    }

    // render children
    (element.shadowRoot ? element.shadowRoot.childNodes : element.childNodes).forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        this.renderWiredShapesForElementAndChildren(<HTMLElement>node, anchorX, anchorY);
      }
    });
  }
}