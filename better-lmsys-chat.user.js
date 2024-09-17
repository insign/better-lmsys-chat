// ==UserScript==
// @name Better LMSYS (LMarena) Chat
// @namespace https://github.com/insign/better-lmsys-chat
// @version 202409172050
// @description make chat lmsys (lmarena) chat better and clean
// @match https://lmarena.ai/*
// @match https://chat.lmsys.org/*
// @icon https://www.google.com/s2/favicons?sz=64&domain=lmsys.org
// @author Hélio <open@helio.me>
// @license WTFPL
// @downloadURL https://update.greasyfork.org/scripts/489922/Better%20LMSYS%20Chat.user.js
// @updateURL https://update.greasyfork.org/scripts/489922/Better%20LMSYS%20Chat.user.js
// ==/UserScript==

(function() {
  'use strict'

  const $      = document.querySelector.bind(document)
  const $$     = document.querySelectorAll.bind(document)
  const hide   = el => el.style.display = 'none'
  const remove = el => el.remove()
  const click  = el => el.click()

  const rename = (el, text) => el.textContent = text

  /**
   * Executes a function on selected elements repeatedly until the condition is met.
   *
   * @param {string|Element|NodeList|Array<string|Element|NodeList>} selector - The CSS selector, element, NodeList, or an array containing a combination of these types to select the elements.
   * @param {function(Element): boolean} check - A function that checks if the condition is met for an element. It should return `true` if the condition is met and `false` otherwise.
   * @param {function(Element): void} fn - The function to be executed on each element that meets the condition.
   * @param {number} [interval=50] - The interval in milliseconds between each check of the elements.
   *
   * @example
   * // Example usage with CSS selector
   * perma('.example-class', (el) => el.textContent !== 'Example', (el) => {
   *   el.textContent = 'Example';
   * });
   *
   * @example
   * // Example usage with element
   * const element = document.querySelector('#example-id');
   * perma(element, (el) => el.classList.contains('active'), (el) => {
   *   el.classList.add('active');
   * });
   *
   * @example
   * // Example usage with NodeList
   * const elements = document.querySelectorAll('.example-class');
   * perma(elements, (el) => el.dataset.status !== 'ready', (el) => {
   *   el.dataset.status = 'ready';
   * });
   *
   * @example
   * // Example usage with an array of selectors
   * perma(['.example-class', '#example-id'], (el) => el.style.display !== 'none', (el) => {
   *   el.style.display = 'none';
   * });
   */
  const perma = (selector, check, fn, interval = 1000) => {
    let intervalId = null

    const checkAndExecute = () => {
      let elements = []

      if (Array.isArray(selector)) {
        selector.forEach((item) => {
          if (typeof item === 'string') {
            elements = elements.concat(Array.from($$(item)))
          }
          else if (item instanceof Element) {
            elements.push(item)
          }
          else if (item instanceof NodeList) {
            elements = elements.concat(Array.from(item))
          }
        })
      }
      else if (typeof selector === 'string') {
        elements = $$(selector)
      }
      else if (selector instanceof Element) {
        elements = [ selector ]
      }
      else if (selector instanceof NodeList) {
        elements = Array.from(selector)
      }

      elements.forEach((element) => {
        if (check(element)) {
          fn(element)
        }
      })
    }

    const startInterval = () => {
      if (!intervalId) {
        intervalId = setInterval(checkAndExecute, interval)
      }
    }

    const stopInterval = () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        stopInterval()
      }
      else {
        startInterval()
      }
    })

    startInterval() // Start initially
  }
  /**
   * Waits for specific elements to be present in the DOM and executes a callback function when they are found.
   *
   * @param {string|Element|NodeList|Array<string|Element|NodeList|function(): Element|null>} [selectors=['html']] - The CSS selector(s), element(s), NodeList(s), or array function(s) that return an element or null. Can be a single selector, element, NodeList, array function, or an array containing a combination of these types. Defaults to ['html'] if not provided.
   * @param {function(Element): void} [callback=null] - The callback function to be executed when the specified elements are found. It receives the first found element as an argument. If not provided, the function will resolve without executing a callback.
   * @param {number} [slow=0] - The delay in milliseconds before executing the callback function. If set to 0 (default), the callback will be executed immediately after the elements are found.
   *
   * @returns {Promise<void>} A promise that resolves when the specified elements are found and the callback function (if provided) has been executed.
   *
   * @example
   * // Example usage with a single CSS selector
   * when('.example-class', (element) => {
   *   console.log('Element found:', element);
   * });
   *
   * @example
   * // Example usage with multiple CSS selectors
   * when(['.example-class', '#example-id'], (element) => {
   *   console.log('Element found:', element);
   * });
   *
   * @example
   * // Example usage with an array function
   * when(() => document.querySelector('.example-class'), (element) => {
   *   console.log('Element found:', element);
   * });
   *
   * @example
   * // Example usage with a delay before executing the callback
   * when('.example-class', (element) => {
   *   console.log('Element found:', element);
   * }, 1000);
   *
   * @example
   * // Example usage without a callback function
   * when('.example-class').then(() => {
   *   console.log('Element found');
   * });
   */
  const when  = (selectors = [ 'html' ], callback = null, slow = 0) => {
    if (!Array.isArray(selectors)) {
      selectors = [ selectors ]
    }

    return new Promise((resolve) => {
      const executeCallback = (element) => {
        if (callback) {
          if (slow > 0) {
            setTimeout(() => {
              callback(element)
              resolve()
            }, slow)
          }
          else {
            callback(element)
            resolve()
          }
        }
        else {
          resolve()
        }
      }

      const checkSelectors = () => {
        for (const selector of selectors) {
          let element = null

          if (typeof selector === 'string') {
            element = $(selector)
          }
          else if (selector instanceof Element) {
            element = selector
          }
          else if (selector instanceof NodeList) {
            element = selector[0]
          }
          else if (typeof selector === 'function') {
            element = selector()
            if (element === null) {
              continue
            }
          }

          if (element) {
            executeCallback(element)
            return true
          }
        }
        return false
      }

      if (checkSelectors()) {
        return
      }

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          Array.from(mutation.addedNodes).forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (checkSelectors()) {
                observer.disconnect()
              }
            }
          })
        })
      })

      observer.observe(document.body, { childList: true, subtree: true })
    })
  }

  when('.prose', el => !el.closest('.wrapper'), remove)

  perma('#component-18-button', el => el.textContent !== 'Battle', el => rename(el, 'Battle'), 100)
  perma('#component-63-button', el => el.textContent !== 'SbS', el => rename(el, 'Side-by-Side'), 100)
  perma('#component-107-button', el => el.textContent !== 'Chat', el => rename(el, 'Chat'), 100)
  perma('#component-108-button', el => el.textContent !== 'Vision Chat', el => rename(el, 'Vision Chat'), 100)
  perma('#component-140-button', el => el.textContent !== 'Ranking', el => rename(el, 'Ranking'), 100)
  perma('#component-231-button', el => el.textContent !== 'About', el => rename(el, 'About'), 100)


  when([
    '.svelte-1ed2p3z', '#component-151-button', '#component-54', '#component-87', '#component-114', '#component-11',
  ], remove).then(() => { // all texts and about button :(

    perma('.tab-nav button', el => el.style.padding !== 'var(--size-1) var(--size-3)', el => {
      console.info('padding', el.style.padding)
      el.style.padding = 'var(--size-1) var(--size-3)'
    }, 100)

    perma('.tabitem', el => el.style.padding !== '0px', el => {
      console.info(el.style.padding)

      el.style.padding = 0
      el.style.border  = 0
    })
  })

  when('.app', el => {
    el.style.margin   = '0 auto'
    el.style.maxWidth = '100%'
    el.style.padding  = 0
  })

  when('.tab-nav', el => {
    el.style.display   = 'flow'
    el.style.textAlign = 'center'
  })

  perma('#chatbot', el => el.style.height !== '75vh', el => {
    console.info('height', el.style.height)
    el.style.height = '75vh'
  })

  perma('.gap', el => el.style.gap !== '6px', el => {
    console.info('gap', el.style.gap)
    el.style.gap = '6px'
  })


  // no-radius
  perma([ 'button' ], el => el.style.borderRadius !== '0px', el => {
    console.info('border-radius', el.style.borderRadius)
    el.style.borderRadius = 0
  })

  perma('#input_box', el => el.style.border !== '0px', el => {
    console.info('Found input_box parent')
    el.style.border                  = 0
    el.style.padding                 = 0
    el.parentNode.style.border       = 0
    el.parentNode.style.borderRadius = 0

    // run on the child textarea
    el.querySelector('textarea').style.borderRadius = 0
  })

  // buttons send, 1123
  perma([ '#component-123',
  ], el => el.style.minWidth !== '65px', el => {
    console.info('buttons send', el.style.minWidth)
    el.style.minWidth = '65px'
    el.textContent    = '⤴️'
  })

  perma('#share-region-named', el => el.style.border !== '0px', el => {
    el.style.border       = 0
    el.style.borderRadius = 0
  })


  // gapper
  perma('.svelte-15lo0d8', el => el.style.gap !== 'var(--spacing-md)', el => {
    console.info('gap', el.style.gap)
    el.style.gap = 'var(--spacing-md)'
  })

  when('.built-with', remove, 1000)

  when('#component-107-button', click, 1000)
})()
