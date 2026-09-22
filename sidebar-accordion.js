// 側邊欄手風琴：同一時間只展開一個群組，點開一個會收掉其他的。
//
// Mintlify 原生沒有這個行為（`expanded` 只控制預設展開與否，群組之間彼此獨立），
// 所以在這裡補上。放在內容目錄的 .js 會被自動載入，不必寫進 docs.json。
//
// ★ 這支依賴 Mintlify 側邊欄的 DOM 結構：
//     群組切換鈕 = `li > button.group`，展開狀態 = 鈕內 svg 帶 `rotate-90`。
//   Mintlify 改版改掉其中任何一項，這支就會靜默失效 —— 側邊欄退回「可以同時展開多個」，
//   也就是沒有這支時的樣子。不會讓頁面壞掉，但也不會有人來通知你。
//   下面的 SELECTOR 與 isOpen 是唯一兩個要跟著改的地方。
(function () {
  var SELECTOR = 'li > button.group';

  // 自己呼叫 .click() 收合其他群組時，會再次觸發這個 listener。
  // 沒有這個旗標就會無限遞迴。
  var busy = false;

  function isOpen(btn) {
    var svg = btn.querySelector('svg');
    return !!svg && svg.classList.contains('rotate-90');
  }

  document.addEventListener('click', function (e) {
    if (busy) return;
    var btn = e.target.closest && e.target.closest(SELECTOR);
    if (!btn) return;

    // 等 React 把這一下的狀態更新完再判斷，否則讀到的是點擊前的狀態。
    requestAnimationFrame(function () {
      // 使用者是把它收起來 → 不需要動其他群組。
      if (!isOpen(btn)) return;

      busy = true;
      try {
        var all = document.querySelectorAll(SELECTOR);
        for (var i = 0; i < all.length; i++) {
          if (all[i] !== btn && isOpen(all[i])) all[i].click();
        }
      } finally {
        busy = false;
      }
    });
  });
})();
