// ==UserScript==
// @name Better LMSYS Chat
// @namespace https://github.com/insign/better-lmsys-chat
// @version 202403152308
// @description make chat lmsys chat better and clean
// @match https://chat.lmsys.org/*
// @icon https://www.google.com/s2/favicons?sz=64&domain=lmsys.org
// @author Hélio <insign@gmail.com>
// @copyright Hélio <insign@gmail.com>
// @license WTFPL
// @downloadURL https://update.greasyfork.org/scripts/489922/Better%20LMSYS%20Chat.user.js
// @updateURL https://update.greasyfork.org/scripts/489922/Better%20LMSYS%20Chat.meta.js
// ==/UserScript==

(function() {
  'use strict'

  const $      = document.querySelector.bind(document)
  const $$     = document.querySelectorAll.bind(document)
  const hide   = el => el.style.display = 'none'
  const remove = el => el.remove()
  const click  = el => el.click()

  const rename = (el, text) => el.textContent = text

  const perma = (selector, check, fn, interval = 50) => {
    let intervalId = null

    const checkAndExecute = () => {
      const elements = $$(selector)
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

  function when(selectors = [ 'html' ], callback = null, slow = 0) {
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
          const element = $(selector)
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

  perma('#component-6-button', el => el.textContent !== 'Battle', el => rename(el, 'Battle'))
  perma('#component-44-button', el => el.textContent !== 'Side-by-Side', el => rename(el, 'Side-by-Side'))
  perma('#component-81-button', el => el.textContent !== 'Chat', el => rename(el, 'Chat'))
  perma('#component-108-button', el => el.textContent !== 'Vision Chat', el => rename(el, 'Vision Chat'))
  perma('#component-140-button', el => el.textContent !== 'Ranking', el => rename(el, 'Ranking'))


  when([
    '.svelte-1ed2p3z', '#component-151-button', '#component-54', '#component-87', '#component-114', '#component-11',
  ], remove).then(() => { // all texts and about button :(
    when('#component-81-button', click, 1000)

    perma('.tab-nav button', el => el.style.padding !== 'var(--size-1) var(--size-3)', el => {
      el.style.padding = 'var(--size-1) var(--size-3)'
    })

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

  perma('#chatbot', el => el.style.height !== '80vh', el => {
    el.style.height = '80vh'
  }, 2000)

  perma('.gap', el => el.style.gap !== '6px', el => {
    console.info('gap', el.style.gap)
    el.style.gap = '6px'
  }, 2000)


})()
