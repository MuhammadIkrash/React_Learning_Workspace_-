/**
 * @file selector-generator.js (classic script — see shared/namespace.js)
 */
(function () {
  const DYNAMIC_ID_RE = /^(ember|react|vue|mui|css|radix|:r)[-:]?[a-z0-9]{2,}$/i;
  const DYNAMIC_CLASS_RE = /^(css-|sc-|jsx-|_[a-z0-9]{5,}$|[a-z0-9]{6,}$)/i;

  function isStableId(id) {
    if (!id) return false;
    if (DYNAMIC_ID_RE.test(id)) return false;
    if (/^\d+$/.test(id)) return false;
    if (id.length > 40) return false;
    return true;
  }

  function isStableClass(cls) {
    if (!cls) return false;
    if (DYNAMIC_CLASS_RE.test(cls)) return false;
    if (/^\d/.test(cls)) return false;
    return true;
  }

  function getStableClasses(el) {
    return [...el.classList].filter(isStableClass).slice(0, 3);
  }

  function getSemanticAttributeSelector(el) {
    const preferredAttrs = ['data-testid', 'data-test', 'data-qa', 'aria-label', 'role', 'name'];
    for (const attr of preferredAttrs) {
      const value = el.getAttribute(attr);
      if (value && value.length < 60) {
        return `[${attr}="${value.replace(/"/g, '\\"')}"]`;
      }
    }
    return null;
  }

  function nthOfTypeSelector(el) {
    const parent = el.parentElement;
    if (!parent) return el.tagName.toLowerCase();
    const siblings = [...parent.children].filter((c) => c.tagName === el.tagName);
    if (siblings.length <= 1) return el.tagName.toLowerCase();
    const index = siblings.indexOf(el) + 1;
    return `${el.tagName.toLowerCase()}:nth-of-type(${index})`;
  }

  function buildPathSelector(el, maxDepth = 4) {
    const parts = [];
    let node = el;
    let depth = 0;
    while (node && node.nodeType === 1 && depth < maxDepth) {
      if (node.id && isStableId(node.id)) {
        parts.unshift(`#${CSS.escape(node.id)}`);
        break;
      }
      const stableClasses = getStableClasses(node);
      if (stableClasses.length) {
        parts.unshift(`${node.tagName.toLowerCase()}.${stableClasses.map((c) => CSS.escape(c)).join('.')}`);
      } else {
        parts.unshift(nthOfTypeSelector(node));
      }
      node = node.parentElement;
      depth++;
    }
    return parts.join(' > ');
  }

  function generateSelector(el) {
    if (!el || el.nodeType !== 1) return '';

    if (el.id && isStableId(el.id)) {
      return `#${CSS.escape(el.id)}`;
    }

    const stableClasses = getStableClasses(el);
    if (stableClasses.length) {
      const selector = `${el.tagName.toLowerCase()}.${stableClasses.map((c) => CSS.escape(c)).join('.')}`;
      if (document.querySelectorAll(selector).length <= 5) return selector;
    }

    const semanticSelector = getSemanticAttributeSelector(el);
    if (semanticSelector) {
      const selector = `${el.tagName.toLowerCase()}${semanticSelector}`;
      if (document.querySelectorAll(selector).length <= 5) return selector;
    }

    return buildPathSelector(el);
  }

  function describeElement(el) {
    if (!el) return '';
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const cls = el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
    return `${tag}${id}${cls}`.slice(0, 80);
  }

  window.CWP.zapper.selectorGenerator = { generateSelector, describeElement };
})();
