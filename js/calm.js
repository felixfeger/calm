/* Calm page — breathing + guided steps. No dependencies. */

/* ---------- Breathing ---------- */
(function () {
  var patterns = {
    box:  { desc: 'Box breathing is used to steady the mind before something stressful. Equal parts in, hold, out, hold.',
            phases: [['Breathe in', 4, 1], ['Hold', 4, null], ['Breathe out', 4, 0.55], ['Hold', 4, null]] },
    '478':{ desc: 'The 4-7-8 pattern has a long hold and a slow exhale. Great for winding down before sleep.',
            phases: [['Breathe in', 4, 1], ['Hold', 7, null], ['Breathe out', 8, 0.55]] },
    even: { desc: 'Even breathing, about six breaths a minute. A gentle rhythm for everyday calm.',
            phases: [['Breathe in', 5, 1], ['Breathe out', 5, 0.55]] },
    long: { desc: 'A longer exhale than inhale nudges your body toward relaxation. Good when you feel wound up.',
            phases: [['Breathe in', 4, 1], ['Breathe out', 6, 0.55]] }
  };

  var circle = document.getElementById('breath-circle');
  var label = document.getElementById('breath-label');
  var count = document.getElementById('breath-count');
  var meta = document.getElementById('breath-meta');
  var btn = document.getElementById('breath-btn');
  var desc = document.getElementById('pattern-desc');
  var buttons = document.querySelectorAll('.pattern');

  var current = 'box', running = false, timer = null, idx = 0, left = 0, cycles = 0;

  function setDesc() { desc.textContent = patterns[current].desc; }

  function startPhase() {
    var p = patterns[current].phases[idx];
    label.textContent = p[0];
    left = p[1];
    count.textContent = left;
    if (p[2] !== null) {
      circle.style.transitionDuration = p[1] + 's';
      circle.style.transform = 'scale(' + p[2] + ')';
    }
  }

  function tick() {
    left--;
    if (left > 0) { count.textContent = left; return; }
    idx++;
    if (idx >= patterns[current].phases.length) {
      idx = 0; cycles++;
      meta.textContent = 'Cycles: ' + cycles;
    }
    startPhase();
  }

  function start() {
    running = true; idx = 0; cycles = 0;
    meta.textContent = 'Cycles: 0';
    btn.textContent = 'Stop';
    circle.style.transitionDuration = '0s';
    circle.style.transform = 'scale(0.55)';
    // tiny delay so the reset applies before the first inhale animates
    setTimeout(function () { if (running) startPhase(); }, 50);
    timer = setInterval(tick, 1000);
  }

  function stop() {
    running = false;
    clearInterval(timer);
    btn.textContent = 'Begin';
    label.textContent = 'Nicely done';
    count.textContent = '';
    circle.style.transitionDuration = '1.5s';
    circle.style.transform = 'scale(0.55)';
  }

  btn.addEventListener('click', function () { running ? stop() : start(); });

  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      buttons.forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      current = b.dataset.pattern;
      setDesc();
      if (running) { stop(); label.textContent = 'Ready'; }
    });
  });

  setDesc();
})();

/* ---------- Step guides ---------- */
function stepGuide(rootId, steps, secs) {
  var root = document.getElementById(rootId);
  if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var i = 0, elapsed = 0, timer = null;
  var auto = secs > 0;
  var nextBtn = $('[data-act="next"]'), prevBtn = $('[data-act="prev"]'), playBtn = $('[data-act="play"]');
  var done = false;

  function bar() {
    var pct = auto ? ((i + elapsed / secs) / steps.length) : ((i + 1) / steps.length);
    $('.guide-bar span').style.width = Math.min(pct * 100, 100) + '%';
  }

  function render() {
    done = false;
    $('.guide-count').textContent = 'Step ' + (i + 1) + ' of ' + steps.length;
    $('.guide-title').textContent = steps[i][0];
    $('.guide-text').textContent = steps[i][1];
    prevBtn.disabled = i === 0;
    prevBtn.style.opacity = i === 0 ? 0.4 : 1;
    if (!auto) nextBtn.textContent = i === steps.length - 1 ? 'Finish' : 'Next';
    bar();
  }

  function finish() {
    clearInterval(timer); timer = null; done = true;
    $('.guide-count').textContent = 'Complete';
    $('.guide-title').textContent = 'Well done';
    $('.guide-text').textContent = 'Take one more slow breath. Notice how you feel compared to when you started.';
    $('.guide-bar span').style.width = '100%';
    if (auto) playBtn.textContent = 'Restart'; else nextBtn.textContent = 'Restart';
  }

  function go(n) {
    elapsed = 0;
    if (n >= steps.length) return finish();
    i = Math.max(0, n);
    render();
  }

  nextBtn.addEventListener('click', function () {
    if (done) { i = 0; elapsed = 0; render(); return; }
    go(i + 1);
  });
  prevBtn.addEventListener('click', function () { done = false; go(i === 0 ? 0 : i - 1); });

  if (auto) {
    playBtn.addEventListener('click', function () {
      if (done) { i = 0; elapsed = 0; render(); }
      if (timer) { clearInterval(timer); timer = null; playBtn.textContent = 'Resume'; return; }
      playBtn.textContent = 'Pause';
      timer = setInterval(function () {
        elapsed += 0.25;
        if (elapsed >= secs) { go(i + 1); if (done) return; }
        bar();
      }, 250);
    });
  }

  render();
}

stepGuide('guide-grounding', [
  ['5 things you can see', 'Look around slowly. Name five things you can see, even small details like a crack in the wall or the light on a surface.'],
  ['4 things you can feel', 'Notice four things you can touch or feel: your feet on the floor, the fabric of your clothes, the chair holding you.'],
  ['3 things you can hear', 'Listen closely. Find three sounds, near or far. A fan, traffic, your own breathing.'],
  ['2 things you can smell', 'Find two scents. If nothing stands out, take a slow breath and notice the air itself.'],
  ['1 thing you can taste', 'Notice one taste in your mouth, or take a sip of water and pay attention to it.']
], 0);

stepGuide('guide-scan', [
  ['Settle in', 'Sit or lie comfortably. Close your eyes if you like, and take a slow, deep breath.'],
  ['Head and face', 'Soften your forehead, unclench your jaw, and let your tongue rest in your mouth.'],
  ['Neck and shoulders', 'Let your shoulders drop away from your ears. Release any lifting or tension.'],
  ['Arms and hands', 'Let your arms feel heavy. Open your hands and let your fingers relax.'],
  ['Chest and belly', 'Feel your breath move in your chest and belly. Let it be easy and unforced.'],
  ['Back and hips', 'Notice where your back is supported. Let your hips sink and settle.'],
  ['Legs and feet', 'Relax your thighs, your calves, and your feet all the way to your toes.'],
  ['Whole body', 'Feel your whole body at once, calm and supported. Stay here for a few breaths.']
], 15);
