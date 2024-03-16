// ==UserScript==
// @name         Better LMSYS Chat
// @namespace    https://github.com/insign/better-lmsys-chat
// @version      2024-03-15
// @description  make chat lmsys chat better and clean
// @match        https://chat.lmsys.org/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=lmsys.org
// @author       Hélio <insign@gmail.com>
// @copyright    Hélio <insign@gmail.com>
// @grant        none
// ==/UserScript==

(function() {
  'use strict'
  const $          = document.querySelector.bind(document)
  const again      = (f, ms = 100) => window.setTimeout(f, ms)
  const hide       = el => el.style.display = 'none'
  const remove     = (el) => el.remove()
  const onceExists = (sel, callback) => sel ? callback(sel) : again(() => onceExists(sel, callback))

  onceExists($('.svelte-1ed2p3z'), remove) // Rules
  onceExists($('#ack_markdown'), remove) // Terms

})()
